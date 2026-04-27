import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { CreatePatientDto, UpdatePatientDto } from './dto/patient.dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
  ) {}

  async findOne(userId: string, includeRelations: boolean = false) {
    const query = this.patientRepository.createQueryBuilder('patient')
      .where('patient.userId = :userId', { userId });

    if (includeRelations) {
      query
        .leftJoinAndSelect('patient.user', 'user')
        .leftJoinAndSelect('patient.appointments', 'appointments')
        .leftJoinAndSelect('appointments.doctor', 'doctor')
        .leftJoinAndSelect('doctor.user', 'doctorUser')
        .leftJoinAndSelect('patient.prescriptions', 'prescriptions')
        .leftJoinAndSelect('patient.medicalHistory', 'medicalHistory')
        .leftJoinAndSelect('patient.bills', 'bills')
        .orderBy('appointments.date', 'DESC');
    }

    const patient = await query.getOne();
    if (!patient) throw new NotFoundException('Patient profile not found');
    return patient;
  }

  async findOneBasic(userId: string) {
    const patient = await this.patientRepository.findOne({
      where: { userId },
      relations: ['user'],
    });
    if (!patient) throw new NotFoundException('Patient profile not found');
    return patient;
  }

  async update(userId: string, updatePatientDto: UpdatePatientDto) {
    await this.patientRepository.update({ userId }, updatePatientDto);
    return this.findOneBasic(userId);
  }

  async create(userId: string, createPatientDto: CreatePatientDto) {
    const patient = this.patientRepository.create({
      ...createPatientDto,
      userId,
    });
    return this.patientRepository.save(patient);
  }

  async getMedicalHistory(userId: string) {
    const patient = await this.patientRepository.findOne({
      where: { userId },
      relations: ['medicalHistory'],
    });
    return patient?.medicalHistory || [];
  }

  async findAll() {
    return this.patientRepository.find({
      relations: ['user'],
      select: {
        id: true,
        userId: true,
        user: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      order: { user: { firstName: 'ASC' } },
    });
  }

  async getPrescriptions(userId: string) {
    const patient = await this.patientRepository.findOne({
      where: { userId },
      relations: ['prescriptions', 'prescriptions.doctor', 'prescriptions.doctor.user'],
    });
    return patient?.prescriptions || [];
  }

  async getBills(userId: string) {
    const patient = await this.patientRepository.findOne({
      where: { userId },
      relations: ['bills', 'bills.hospital'],
    });
    return patient?.bills || [];
  }
}
