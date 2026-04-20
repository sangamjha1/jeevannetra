import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppointmentStatus } from './appointments/entities/appointment.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './patients/entities/patient.entity';
import { Doctor } from './doctors/entities/doctor.entity';
import { Appointment } from './appointments/entities/appointment.entity';
import { Prescription } from './prescriptions/entities/prescription.entity';
import { Bill } from './bills/entities/bill.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const patientRepository = app.get<Repository<Patient>>(getRepositoryToken(Patient));
  const doctorRepository = app.get<Repository<Doctor>>(getRepositoryToken(Doctor));
  const appointmentRepository = app.get<Repository<Appointment>>(getRepositoryToken(Appointment));
  const prescriptionRepository = app.get<Repository<Prescription>>(getRepositoryToken(Prescription));
  const billRepository = app.get<Repository<Bill>>(getRepositoryToken(Bill));

  console.log('--- POPULATING APPOINTMENTS, PRESCRIPTIONS, AND BILLS ---');

  // Get patients
  const patients = await patientRepository.find({ relations: ['user'] });
  const doctors = await doctorRepository.find({ relations: ['user'] });

  if (patients.length === 0 || doctors.length === 0) {
    console.error('No patients or doctors found!');
    process.exit(1);
  }

  console.log(`Found ${patients.length} patients and ${doctors.length} doctors`);

  const appointmentReasons = ['Regular Checkup', 'Follow-up', 'Consultation', 'Vaccination', 'Blood Test', 'General Health'];
  const appointmentStatuses = [AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED];

  let appointmentCount = 0;
  let prescriptionCount = 0;
  let billCount = 0;

  // Create appointments for each patient-doctor pair
  for (const patient of patients.slice(0, 4)) {
    for (const doctor of doctors.slice(0, 2)) {
      for (let i = 0; i < 2; i++) {
        const appointmentDate = new Date();
        appointmentDate.setDate(appointmentDate.getDate() - (5 - i * 2));
        appointmentDate.setHours(10 + i * 2, 0, 0, 0);

        const reason = appointmentReasons[appointmentCount % appointmentReasons.length];
        const status = appointmentStatuses[appointmentCount % appointmentStatuses.length];

        const existingAppointment = await appointmentRepository.findOne({
          where: {
            patientId: patient.id,
            doctorId: doctor.id,
            reason,
            date: appointmentDate,
          },
        });

        if (!existingAppointment) {
          const appointment = await appointmentRepository.save({
            patientId: patient.id,
            doctorId: doctor.id,
            reason,
            date: appointmentDate,
            status,
          });
          console.log(`✓ Appointment created: ${patient.user.firstName} with Dr. ${doctor.user.firstName} (${status})`);
          appointmentCount++;

          // Create prescription if appointment is completed
          if (status === AppointmentStatus.COMPLETED) {
            const medicines = [
              { name: 'Aspirin', dosage: '75mg', frequency: 'Once daily', duration: '30 days' },
              { name: 'Paracetamol', dosage: '500mg', frequency: 'As needed', duration: '7 days' },
              { name: 'Ibuprofen', dosage: '400mg', frequency: 'Twice daily', duration: '5 days' },
            ];

            const prescription = await prescriptionRepository.save({
              patientId: patient.id,
              doctorId: doctor.id,
              appointmentId: appointment.id,
              diagnosis: `Follow-up: ${reason}`,
              medicines: medicines.slice(0, 1 + Math.floor(Math.random() * 2)),
              instructions: 'Take medicines as prescribed. Stay hydrated.',
            });
            console.log(`  ✓ Prescription created for ${patient.user.firstName}`);
            prescriptionCount++;
          }

          // Create bill for appointment
          const consultationFee = 500 + Math.random() * 500;
          const bill = await billRepository.save({
            patientId: patient.id,
            hospitalId: doctor.hospitalId,
            appointmentId: appointment.id,
            amount: Math.round(consultationFee),
            items: { description: `Consultation Fee - ${reason}` },
            invoiceNumber: `INV-${Date.now()}-${billCount}`,
            status: 'PAID',
          });
          console.log(`  ✓ Bill created: ₹${Math.round(consultationFee)} for ${patient.user.firstName}`);
          billCount++;
        }
      }
    }
  }

  console.log(`\n--- SUMMARY ---`);
  console.log(`✓ Created: ${appointmentCount} appointments`);
  console.log(`✓ Created: ${prescriptionCount} prescriptions`);
  console.log(`✓ Created: ${billCount} bills`);

  await app.close();
}

bootstrap();
