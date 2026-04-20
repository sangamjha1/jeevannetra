import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { HospitalsService } from './hospitals/hospitals.service';
import { DoctorsService } from './doctors/doctors.service';
import { PatientsService } from './patients/patients.service';
import { Role } from './users/entities/user.entity';
import { BedType, BedStatus, Bed } from './beds/entities/bed.entity';
import { Staff, StaffType } from './staff/entities/staff.entity';
import { Appointment, AppointmentStatus } from './appointments/entities/appointment.entity';
import { Prescription } from './prescriptions/entities/prescription.entity';
import { Bill } from './bills/entities/bill.entity';
import { EmergencyRequest, EmergencyStatus } from './emergency/entities/emergency-request.entity';
import { BloodBank } from './resources/entities/blood-bank.entity';
import { ResourceHospital } from './resources/entities/resource-hospital.entity';
import { PoliceStation } from './resources/entities/police-station.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const usersService = app.get(UsersService);
  const hospitalsService = app.get(HospitalsService);
  const doctorsService = app.get(DoctorsService);
  const bedRepository = app.get<Repository<Bed>>(getRepositoryToken(Bed));
  const staffRepository = app.get<Repository<Staff>>(getRepositoryToken(Staff));
  const appointmentRepository = app.get<Repository<Appointment>>(getRepositoryToken(Appointment));
  const prescriptionRepository = app.get<Repository<Prescription>>(getRepositoryToken(Prescription));
  const billRepository = app.get<Repository<Bill>>(getRepositoryToken(Bill));
  const emergencyRepository = app.get<Repository<EmergencyRequest>>(getRepositoryToken(EmergencyRequest));
  const bloodBankRepository = app.get<Repository<BloodBank>>(getRepositoryToken(BloodBank));
  const resourceHospitalRepository = app.get<Repository<ResourceHospital>>(getRepositoryToken(ResourceHospital));
  const policeStationRepository = app.get<Repository<PoliceStation>>(getRepositoryToken(PoliceStation));
  const patientsService = app.get(PatientsService);

  console.log('--- SEEDING SYSTEM DATA ---');

  // 1. Create ADMIN
  const adminPassword = await bcrypt.hash('admin123', 10);
  try {
    const existing = await usersService.findByEmail('admin@chms.com');
    if (!existing) {
      await usersService.create({
        email: 'admin@chms.com',
        password: adminPassword,
        role: Role.ADMIN,
        firstName: 'System',
        lastName: 'Administrator',
        onboardingDone: true,
      });
      console.log('✓ Admin created');
    }
  } catch (e) {
    console.log('! Error checking admin');
  }

  // 2. Create Hospital
  const hospPassword = await bcrypt.hash('hospital123', 10);
  let hospUser = await usersService.findByEmail('hospital@chms.com');
  if (!hospUser) {
    hospUser = await usersService.create({
      email: 'hospital@chms.com',
      password: hospPassword,
      role: Role.HOSPITAL,
      firstName: 'Apollo',
      lastName: 'Admin',
      onboardingDone: true,
    });
  }

  let hospital = await hospitalsService.findOne(hospUser.id).catch(() => null);
  if (!hospital) {
    hospital = await hospitalsService.create(hospUser.id, {
      name: 'Apollo Premier Hospital',
      address: '123 Sky Tower, Health City, NY',
      phone: '+1 800-APOLLO',
      email: 'hospital@chms.com',
      website: 'https://apollo-premium.com',
    });
    console.log('✓ Premium Hospital created');
  }

  // 3. Create Doctor
  const docPassword = await bcrypt.hash('doctor123', 10);
  let docUser = await usersService.findByEmail('doctor@chms.com');
  if (!docUser) {
    docUser = await usersService.create({
      email: 'doctor@chms.com',
      password: docPassword,
      role: Role.DOCTOR,
      firstName: 'James',
      lastName: 'Smith',
      onboardingDone: true,
    });
  }

  const existingDoc = await doctorsService.findOne(docUser.id).catch(() => null);
  let doctorProfile = existingDoc;
  if (!doctorProfile) {
    await doctorsService.create(docUser.id, {
      hospitalId: hospital.id,
      specialization: 'Cardiology',
      licenseNumber: 'MD-99823-CARD',
      qualification: 'MD, Cardiology (Harvard Medical)',
      yearsOfExperience: 15,
      bio: 'Senior cardiologist specializing in non-invasive procedures and heart health optimization.',
      availability: {
        mon: ['09:00-12:00', '14:00-17:00'],
        wed: ['09:00-12:00'],
        fri: ['14:00-18:00'],
      },
    });
    console.log('✓ Specialist Doctor created');
    doctorProfile = await doctorsService.findOne(docUser.id);
  }

  // 3b. Create Additional Doctors
  const doctorData = [
    {
      email: 'dr.patel@apollo.com',
      name: { first: 'Raj', last: 'Patel' },
      specialization: 'General Medicine',
      licenseNumber: 'MD-99824-GMED',
      qualification: 'MBBS, General Medicine (Delhi University)',
      yearsOfExperience: 12,
      bio: 'Experienced general practitioner with focus on preventive care.',
    },
    {
      email: 'dr.sharma@apollo.com',
      name: { first: 'Priya', last: 'Sharma' },
      specialization: 'Orthopedics',
      licenseNumber: 'MD-99825-ORTH',
      qualification: 'MD, Orthopedics (Mumbai Institute)',
      yearsOfExperience: 10,
      bio: 'Specialist in bone and joint care with expertise in sports medicine.',
    },
    {
      email: 'dr.gupta@apollo.com',
      name: { first: 'Vikram', last: 'Gupta' },
      specialization: 'Neurology',
      licenseNumber: 'MD-99826-NEUR',
      qualification: 'MD, Neurology (CMC Vellore)',
      yearsOfExperience: 18,
      bio: 'Senior neurologist specializing in complex neurological disorders.',
    },
  ];

  const doctorProfiles: any[] = [doctorProfile];
  for (const doc of doctorData) {
    let docUser = await usersService.findByEmail(doc.email).catch(() => null);
    if (!docUser) {
      docUser = await usersService.create({
        email: doc.email,
        password: await bcrypt.hash('doctor123', 10),
        role: Role.DOCTOR,
        firstName: doc.name.first,
        lastName: doc.name.last,
        onboardingDone: true,
      });
    }

    let profile = await doctorsService.findOne(docUser.id).catch(() => null);
    if (!profile) {
      await doctorsService.create(docUser.id, {
        hospitalId: hospital.id,
        specialization: doc.specialization,
        licenseNumber: doc.licenseNumber,
        qualification: doc.qualification,
        yearsOfExperience: doc.yearsOfExperience,
        bio: doc.bio,
        availability: {
          mon: ['09:00-12:00', '14:00-17:00'],
          tue: ['10:00-13:00', '15:00-18:00'],
          wed: ['09:00-12:00'],
          thu: ['14:00-17:00'],
          fri: ['09:00-12:00', '15:00-18:00'],
        },
      });
      profile = await doctorsService.findOne(docUser.id);
    }
    doctorProfiles.push(profile);
  }
  console.log('✓ Additional doctors created');

  // 4. Create Staff
  const staffPassword = await bcrypt.hash('staff123', 10);
  let staffUser = await usersService.findByEmail('staff@chms.com');
  if (!staffUser) {
    staffUser = await usersService.create({
      email: 'staff@chms.com',
      password: staffPassword,
      role: Role.STAFF,
      firstName: 'Anna',
      lastName: 'Nurse',
      onboardingDone: true,
      phone: '+1 555-0222',
    });
  }

  const existingStaff = await staffRepository.findOne({ where: { userId: staffUser.id } });
  if (!existingStaff) {
    await staffRepository.save({
      userId: staffUser.id,
      hospitalId: hospital.id,
      type: StaffType.NURSE,
      tasks: { shift: 'Morning', ward: 'Cardiology' },
    });
    console.log('✓ Staff profile created');
  }

  // Add more dummy staff with different types
  const dummyStaffData = [
    { email: 'icu.staff@hospital.com', firstName: 'Raj', lastName: 'Kumar', type: StaffType.ICU_STAFF, phone: '+1 555-0301' },
    { email: 'ot.staff@hospital.com', firstName: 'Priya', lastName: 'Singh', type: StaffType.OT_STAFF, phone: '+1 555-0302' },
    { email: 'opd.staff@hospital.com', firstName: 'Amit', lastName: 'Patel', type: StaffType.OPD_STAFF, phone: '+1 555-0303' },
    { email: 'surgeon@hospital.com', firstName: 'Dr. Vikram', lastName: 'Verma', type: StaffType.SURGEON, phone: '+1 555-0304' },
    { email: 'anesthetist@hospital.com', firstName: 'Dr. Neha', lastName: 'Sharma', type: StaffType.ANESTHETIST, phone: '+1 555-0305' },
    { email: 'physio@hospital.com', firstName: 'Ravi', lastName: 'Desai', type: StaffType.PHYSIOTHERAPIST, phone: '+1 555-0306' },
    { email: 'lab.tech@hospital.com', firstName: 'Kavya', lastName: 'Nair', type: StaffType.LAB_TECHNICIAN, phone: '+1 555-0307' },
    { email: 'receptionist@hospital.com', firstName: 'Anjali', lastName: 'Gupta', type: StaffType.RECEPTIONIST, phone: '+1 555-0308' },
    { email: 'ambulance@hospital.com', firstName: 'Suresh', lastName: 'Rao', type: StaffType.AMBULANCE_DRIVER, phone: '+1 555-0309' },
    { email: 'ward.boy@hospital.com', firstName: 'Ramesh', lastName: 'Singh', type: StaffType.WARD_BOY, phone: '+1 555-0310' },
    { email: 'security@hospital.com', firstName: 'Harish', lastName: 'Joshi', type: StaffType.SECURITY, phone: '+1 555-0311' },
  ];

  for (const staffData of dummyStaffData) {
    let staffUser = await usersService.findByEmail(staffData.email);
    if (!staffUser) {
      const staffPassword = await bcrypt.hash('staff123', 10);
      staffUser = await usersService.create({
        email: staffData.email,
        password: staffPassword,
        role: Role.STAFF,
        firstName: staffData.firstName,
        lastName: staffData.lastName,
        phone: staffData.phone,
        onboardingDone: true,
      });
    }

    const existingStaffProfile = await staffRepository.findOne({ where: { userId: staffUser.id } });
    if (!existingStaffProfile) {
      await staffRepository.save({
        userId: staffUser.id,
        hospitalId: hospital.id,
        type: staffData.type,
        tasks: { shift: 'Day' },
      });
    }
  }
  console.log('✓ Multiple staff members seeded (11 more staff with different roles)');

  // 5. Create Sample Beds (idempotent)
  const existingBeds = await bedRepository.count({ where: { hospitalId: hospital.id } });
  const bedTypes = [
    { type: BedType.ICU, price: 1500 },
    { type: BedType.PRIVATE, price: 800 },
    { type: BedType.GENERAL, price: 200 },
    { type: BedType.VENTILATOR, price: 2500 }
  ];

  if (existingBeds === 0) {
    for (const b of bedTypes) {
      await bedRepository.save({
        hospitalId: hospital.id,
        type: b.type,
        status: BedStatus.AVAILABLE,
        pricePerDay: b.price
      });
    }
    console.log('✓ Premium Beds seeded');
  } else {
    console.log('✓ Beds already exist, skipping insert');
  }

  // 6. Create Patients
  const patientData = [
    {
      email: 'patient@chms.com',
      firstName: 'John',
      lastName: 'Doe',
      gender: 'Male',
      dateOfBirth: new Date('1990-05-15'),
      address: '456 Garden Street, Health City, NY',
      phone: '+1 555-0199',
      bloodGroup: 'O+',
      emergencyContact: '+1 555-0000',
      weight: 75,
      height: 180,
    },
    {
      email: 'patient2@chms.com',
      firstName: 'Sarah',
      lastName: 'Johnson',
      gender: 'Female',
      dateOfBirth: new Date('1988-08-22'),
      address: '789 Park Avenue, Health City, NY',
      phone: '+1 555-0100',
      bloodGroup: 'AB+',
      emergencyContact: '+1 555-0001',
      weight: 65,
      height: 165,
    },
    {
      email: 'patient3@chms.com',
      firstName: 'Michael',
      lastName: 'Williams',
      gender: 'Male',
      dateOfBirth: new Date('1985-12-10'),
      address: '321 Oak Street, Health City, NY',
      phone: '+1 555-0102',
      bloodGroup: 'B-',
      emergencyContact: '+1 555-0002',
      weight: 80,
      height: 185,
    },
    {
      email: 'patient4@chms.com',
      firstName: 'Emily',
      lastName: 'Brown',
      gender: 'Female',
      dateOfBirth: new Date('1992-03-30'),
      address: '654 Elm Street, Health City, NY',
      phone: '+1 555-0103',
      bloodGroup: 'A+',
      emergencyContact: '+1 555-0003',
      weight: 62,
      height: 168,
    },
    {
      email: 'patient5@chms.com',
      firstName: 'David',
      lastName: 'Martinez',
      gender: 'Male',
      dateOfBirth: new Date('1995-07-18'),
      address: '987 Maple Street, Health City, NY',
      phone: '+1 555-0104',
      bloodGroup: 'O-',
      emergencyContact: '+1 555-0004',
      weight: 78,
      height: 182,
    },
  ];

  const patientProfiles: any[] = [];
  for (const p of patientData) {
    let patientUser = await usersService.findByEmail(p.email).catch(() => null);
    if (!patientUser) {
      patientUser = await usersService.create({
        email: p.email,
        password: await bcrypt.hash('patient123', 10),
        role: Role.PATIENT,
        firstName: p.firstName,
        lastName: p.lastName,
        onboardingDone: true,
        phone: p.phone,
        gender: p.gender,
        dateOfBirth: p.dateOfBirth,
        address: p.address,
        emergencyContacts: [
          {
            name: 'Emergency Contact 1',
            phone: p.emergencyContact || '+1 555-0000',
          },
          {
            name: 'Emergency Contact 2',
            phone: '+91 9876543210',
          },
        ],
      });
    }

    let patientProfile = await patientsService.findOne(patientUser.id).catch(() => null);
    if (!patientProfile) {
      await patientsService.create(patientUser.id, {
        bloodGroup: p.bloodGroup,
        emergencyContact: p.emergencyContact,
        weight: p.weight,
        height: p.height,
      });
      patientProfile = await patientsService.findOne(patientUser.id);
    }
    patientProfiles.push(patientProfile);
  }
  console.log(`✓ ${patientProfiles.length} Patients created`);

  // 7. Create Appointments for all patients
  if (doctorProfiles.length > 0 && patientProfiles.length > 0) {
    const appointmentReasons = [
      'Chest pain and shortness of breath',
      'Routine cardiac follow-up',
      'Back pain and stiffness',
      'Regular checkup',
      'Severe headaches and dizziness',
      'Joint pain management',
      'Blood pressure check',
      'Consultation for medication adjustment',
    ];

    const appointmentStatuses = [
      AppointmentStatus.COMPLETED,
      AppointmentStatus.COMPLETED,
      AppointmentStatus.CONFIRMED,
      AppointmentStatus.PENDING,
    ];

    let appointmentCount = 0;
    for (let patientIdx = 0; patientIdx < patientProfiles.length; patientIdx++) {
      const patient = patientProfiles[patientIdx];
      const doctorsToAssign = doctorProfiles.slice(0, Math.min(2, doctorProfiles.length));

      for (const doctor of doctorsToAssign) {
        const numAppointments = patientIdx % 3 + 2; // 2-4 appointments per patient
        for (let i = 0; i < numAppointments; i++) {
          const daysAgo = 30 - i * 10;
          const appointmentDate = new Date();
          appointmentDate.setDate(appointmentDate.getDate() - daysAgo);
          appointmentDate.setHours(9 + Math.random() * 8, 0, 0, 0);

          const reason = appointmentReasons[appointmentCount % appointmentReasons.length];
          const status = appointmentStatuses[appointmentCount % appointmentStatuses.length];

          const existingAppointment = await appointmentRepository.findOne({
            where: {
              patientId: patient.id,
              doctorId: doctor.id,
              reason,
            },
          });

          if (!existingAppointment) {
            await appointmentRepository.save({
              patientId: patient.id,
              doctorId: doctor.id,
              reason,
              date: appointmentDate,
              status,
            });
            appointmentCount++;
          }
        }
      }
    }
    console.log(`✓ ${appointmentCount} Appointments seeded`);

    // 8. Create Prescriptions for completed appointments
    const medicineOptions = [
      [
        { name: 'Aspirin', dosage: '75mg', frequency: 'Once daily', duration: '30 days' },
        { name: 'Atorvastatin', dosage: '10mg', frequency: 'At night', duration: '30 days' },
      ],
      [
        { name: 'Ibuprofen', dosage: '400mg', frequency: 'Twice daily', duration: '7 days' },
        { name: 'Paracetamol', dosage: '500mg', frequency: 'Three times daily', duration: '7 days' },
      ],
      [
        { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', duration: '60 days' },
        { name: 'Lisinopril', dosage: '5mg', frequency: 'Once daily', duration: '60 days' },
      ],
      [
        { name: 'Amoxicillin', dosage: '500mg', frequency: 'Three times daily', duration: '7 days' },
        { name: 'Vitamin C', dosage: '500mg', frequency: 'Once daily', duration: '14 days' },
      ],
    ];

    const diagnosisList = [
      'Mild angina',
      'Muscle strain',
      'Type 2 Diabetes',
      'Upper respiratory infection',
      'Hypertension',
      'Osteoarthritis',
    ];

    let prescriptionCount = 0;
    const completedAppointments = await appointmentRepository.find({
      where: { status: AppointmentStatus.COMPLETED },
      relations: ['patient', 'doctor'],
    });

    for (const appointment of completedAppointments) {
      const existingPrescription = await prescriptionRepository.findOne({
        where: { appointmentId: appointment.id },
      });

      if (!existingPrescription) {
        const medicines = medicineOptions[prescriptionCount % medicineOptions.length];
        const diagnosis = diagnosisList[prescriptionCount % diagnosisList.length];

        await prescriptionRepository.save({
          appointmentId: appointment.id,
          patientId: appointment.patientId,
          doctorId: appointment.doctorId,
          diagnosis,
          instructions: `Take prescribed medications regularly. Follow-up in ${7 + prescriptionCount % 3} days.`,
          medicines,
        });
        prescriptionCount++;
      }
    }
    console.log(`✓ ${prescriptionCount} Prescriptions seeded`);

    // 9. Create Bills
    const invoiceItems = [
      [
        { name: 'Consultation', amount: 120 },
        { name: 'ECG', amount: 80 },
        { name: 'Blood Tests', amount: 220 },
      ],
      [
        { name: 'Consultation', amount: 100 },
        { name: 'X-Ray', amount: 150 },
        { name: 'Physical Therapy', amount: 200 },
      ],
      [
        { name: 'Consultation', amount: 120 },
        { name: 'Lab Work', amount: 180 },
        { name: 'Medication', amount: 150 },
      ],
    ];

    const billStatuses = ['PAID', 'UNPAID', 'PENDING'];
    let billCount = 0;

    for (const appointment of completedAppointments.slice(0, Math.min(10, completedAppointments.length))) {
      const existingBill = await billRepository.findOne({
        where: { appointmentId: appointment.id },
      });

      if (!existingBill) {
        const items = invoiceItems[billCount % invoiceItems.length];
        const amount = items.reduce((sum: number, item: any) => sum + item.amount, 0);
        const status = billStatuses[billCount % billStatuses.length];

        await billRepository.save({
          invoiceNumber: `INV-${Date.now()}-${billCount}`,
          patientId: appointment.patientId,
          hospitalId: hospital.id,
          appointmentId: appointment.id,
          amount,
          status,
          items,
        });
        billCount++;
      }
    }

    // Bills for appointments without explicit appointment link
    for (let i = 0; i < 5; i++) {
      const items = invoiceItems[i % invoiceItems.length];
      const amount = items.reduce((sum: number, item: any) => sum + item.amount, 0);
      const patient = patientProfiles[i % patientProfiles.length];

      const existingBill = await billRepository.findOne({
        where: { invoiceNumber: `MISC-INV-${i}` },
      });

      if (!existingBill) {
        await billRepository.save({
          invoiceNumber: `MISC-INV-${i}`,
          patientId: patient.id,
          hospitalId: hospital.id,
          amount,
          status: billStatuses[i % billStatuses.length],
          items,
        });
        billCount++;
      }
    }

    console.log(`✓ ${billCount} Bills seeded`);

    // 10. Create Emergency Requests
    let emergencyCount = 0;
    for (const patient of patientProfiles.slice(0, 3)) {
      const existingCount = await emergencyRepository.count({ where: { userId: patient.userId } });
      if (existingCount === 0) {
        await emergencyRepository.save([
          {
            userId: patient.userId,
            latitude: 23.2156 + Math.random() * 0.01,
            longitude: 72.6369 + Math.random() * 0.01,
            status: EmergencyStatus.PENDING,
          },
          {
            userId: patient.userId,
            latitude: 23.2201 + Math.random() * 0.01,
            longitude: 72.6415 + Math.random() * 0.01,
            status: EmergencyStatus.DISPATCHED,
            staffId: existingStaff?.id,
          },
        ]);
        emergencyCount += 2;
      }
    }
    console.log(`✓ ${emergencyCount} Emergency requests seeded`);

    // 11. Seed Resource Hospitals
    const hospitalData = [
      {
        name: 'City Medical Hospital',
        address: 'Plot No 1, Sector 11, Ahmedabad',
        latitude: 23.2156,
        longitude: 72.6369,
        phone: '+91 79 2345 6789',
        website: 'https://citymedicalhospital.com',
        departments: ['Emergency', 'ICU', 'Surgery', 'Cardiology', 'Orthopedics'],
        totalBeds: 100,
        availableBeds: 15,
      },
      {
        name: 'Care Medical Center',
        address: '456 Health Avenue, Ahmedabad',
        latitude: 23.2200,
        longitude: 72.6400,
        phone: '+91 79 2356 7890',
        website: 'https://caremedicalcenter.com',
        departments: ['Emergency', 'Pediatrics', 'Gynecology', 'Neurology'],
        totalBeds: 80,
        availableBeds: 20,
      },
      {
        name: 'Prime Healthcare',
        address: '789 Wellness Street, Ahmedabad',
        latitude: 23.2180,
        longitude: 72.6380,
        phone: '+91 79 2367 8901',
        website: 'https://primehealthcare.com',
        departments: ['Emergency', 'ICU', 'Oncology', 'Radiology'],
        totalBeds: 120,
        availableBeds: 25,
      },
    ];

    let hospitalCount = 0;
    for (const data of hospitalData) {
      const existing = await resourceHospitalRepository.findOne({
        where: { phone: data.phone },
      });
      if (!existing) {
        await resourceHospitalRepository.save(data);
        hospitalCount++;
      }
    }
    console.log(`✓ ${hospitalCount} Resource Hospitals seeded`);

    // 12. Seed Blood Banks
    const bloodBankData = [
      {
        name: 'Red Cross Blood Bank',
        address: 'Medical Plaza, Sector 9, Ahmedabad',
        latitude: 23.2140,
        longitude: 72.6350,
        phone: '+91 79 2300 1111',
        availability: '24/7',
        bloodTypes: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
      },
      {
        name: 'Life Blood Center',
        address: '321 Health Complex, Ahmedabad',
        latitude: 23.2200,
        longitude: 72.6420,
        phone: '+91 79 2300 2222',
        availability: '9 AM - 6 PM',
        bloodTypes: ['O+', 'A+', 'B+', 'AB+'],
      },
      {
        name: 'National Blood Services',
        address: '654 Medical District, Ahmedabad',
        latitude: 23.2170,
        longitude: 72.6380,
        phone: '+91 79 2300 3333',
        availability: '24/7',
        bloodTypes: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
      },
    ];

    let bankCount = 0;
    for (const data of bloodBankData) {
      const existing = await bloodBankRepository.findOne({
        where: { phone: data.phone },
      });
      if (!existing) {
        await bloodBankRepository.save(data);
        bankCount++;
      }
    }
    console.log(`✓ ${bankCount} Blood Banks seeded`);

    // 13. Seed Police Stations
    const policeStationData = [
      {
        name: 'Central Police Station',
        address: '123 Law & Order Street, Ahmedabad',
        latitude: 23.2150,
        longitude: 72.6360,
        phone: '+91 79 2200 1100',
        email: 'central.ps@ahmedabadpolice.gov.in',
        officersAvailable: 25,
      },
      {
        name: 'North City Police Station',
        address: '456 Patrol Road, Ahmedabad',
        latitude: 23.2210,
        longitude: 72.6410,
        phone: '+91 79 2200 2200',
        email: 'north.ps@ahmedabadpolice.gov.in',
        officersAvailable: 20,
      },
      {
        name: 'Emergency Response Unit',
        address: '789 Rapid Response Avenue, Ahmedabad',
        latitude: 23.2180,
        longitude: 72.6390,
        phone: '+91 79 2200 3300',
        email: 'eru@ahmedabadpolice.gov.in',
        officersAvailable: 35,
      },
    ];

    let stationCount = 0;
    for (const data of policeStationData) {
      const existing = await policeStationRepository.findOne({
        where: { phone: data.phone },
      });
      if (!existing) {
        await policeStationRepository.save(data);
        stationCount++;
      }
    }
    console.log(`✓ ${stationCount} Police Stations seeded`);
  }

  console.log('--- SEEDING COMPLETE ---');
  await app.close();
}

bootstrap();
