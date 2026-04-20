import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from './entities/doctor.entity';
import { CreateDoctorDto, UpdateDoctorDto } from './dto/doctor.dto';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
  ) {}

  async findOne(userId: string) {
    const doctor = await this.doctorRepository.findOne({
      where: { userId },
      relations: [
        'user',
        'hospital',
        'appointments',
        'appointments.patient',
        'appointments.patient.user',
      ],
    });
    if (!doctor) throw new NotFoundException('Doctor profile not found');
    
    // Filtering pending appointments as done in Prisma version
    if (doctor.appointments) {
      doctor.appointments = doctor.appointments
        .filter(app => app.status === 'PENDING')
        .sort((a, b) => a.date.getTime() - b.date.getTime());
    }
    
    return doctor;
  }

  async update(userId: string, updateDoctorDto: UpdateDoctorDto) {
    await this.doctorRepository.update({ userId }, updateDoctorDto);
    return this.findOne(userId);
  }

  async create(userId: string, createDoctorDto: CreateDoctorDto) {
    const doctor = this.doctorRepository.create({
      ...createDoctorDto,
      userId,
    });
    return this.doctorRepository.save(doctor);
  }

  async findAll() {
    return this.doctorRepository.find({
      relations: ['user', 'hospital'],
    });
  }

  async findByHospital(hospitalId: string) {
    return this.doctorRepository.find({
      where: { hospitalId },
      relations: ['user'],
    });
  }
}
