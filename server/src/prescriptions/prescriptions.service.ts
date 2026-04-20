import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prescription } from './entities/prescription.entity';
import { CreatePrescriptionDto } from './dto/prescription.dto';
import { Doctor } from '../doctors/entities/doctor.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Hospital } from '../hospitals/entities/hospital.entity';

@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectRepository(Prescription)
    private prescriptionRepository: Repository<Prescription>,
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(Hospital)
    private hospitalRepository: Repository<Hospital>,
  ) {}

  async create(doctorId: string, createPrescriptionDto: CreatePrescriptionDto) {
    const doctor = await this.doctorRepository.findOne({ where: { userId: doctorId } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    const appointment = await this.appointmentRepository.findOne({ 
      where: { id: createPrescriptionDto.appointmentId } 
    });
    if (!appointment) throw new NotFoundException('Appointment not found');

    // Check if prescription already exists for this appointment
    const existing = await this.prescriptionRepository.findOne({
      where: { appointmentId: createPrescriptionDto.appointmentId }
    });
    if (existing) throw new ConflictException('Prescription already exists for this appointment');

    const prescription = this.prescriptionRepository.create({
      diagnosis: createPrescriptionDto.diagnosis,
      medicines: createPrescriptionDto.medicines,
      instructions: createPrescriptionDto.instructions,
      appointmentId: createPrescriptionDto.appointmentId,
      patientId: createPrescriptionDto.patientId,
      doctorId: doctor.id,
    });
    
    return this.prescriptionRepository.save(prescription);
  }

  async findByPatient(userId: string) {
    const patient = await this.patientRepository.findOne({ where: { userId } });
    if (!patient) throw new NotFoundException('Patient not found');

    return this.prescriptionRepository.find({
      where: { patientId: patient.id },
      relations: ['doctor', 'doctor.user', 'appointment'],
      order: { date: 'DESC' },
    });
  }

  async findByDoctor(doctorId: string) {
    const doctor = await this.doctorRepository.findOne({ where: { userId: doctorId } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    return this.prescriptionRepository.find({
      where: { doctorId: doctor.id },
      relations: ['patient', 'patient.user', 'appointment'],
      order: { date: 'DESC' },
    });
  }

  async findByHospital(userId: string) {
    // Get the hospital for this user
    const hospital = await this.hospitalRepository.findOne({ where: { userId } });
    if (!hospital) throw new NotFoundException('Hospital not found');

    const hospitalId = hospital.id;

    // Find all prescriptions for doctors in this hospital
    const prescriptions = await this.prescriptionRepository
      .createQueryBuilder('prescription')
      .leftJoinAndSelect('prescription.doctor', 'doctor')
      .leftJoinAndSelect('prescription.patient', 'patient')
      .leftJoinAndSelect('patient.user', 'patient_user')
      .leftJoinAndSelect('doctor.user', 'doctor_user')
      .leftJoinAndSelect('prescription.appointment', 'appointment')
      .where('doctor.hospitalId = :hospitalId', { hospitalId })
      .orderBy('prescription.date', 'DESC')
      .getMany();

    return prescriptions;
  }

  async findOne(id: string) {
    const prescription = await this.prescriptionRepository.findOne({
      where: { id },
      relations: [
        'patient',
        'patient.user',
        'doctor',
        'doctor.user',
        'appointment',
      ],
    });
    if (!prescription) throw new NotFoundException('Prescription not found');
    return prescription;
  }
}
