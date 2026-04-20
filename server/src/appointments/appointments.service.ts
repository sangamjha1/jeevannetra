import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto/appointment.dto';
import { Patient } from '../patients/entities/patient.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { Hospital } from '../hospitals/entities/hospital.entity';
import { Bed } from '../beds/entities/bed.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
    @InjectRepository(Hospital)
    private hospitalRepository: Repository<Hospital>,
    @InjectRepository(Bed)
    private bedRepository: Repository<Bed>,
  ) {}

  async create(userId: string, createAppointmentDto: CreateAppointmentDto) {
    const patient = await this.patientRepository.findOne({ where: { userId } });
    if (!patient) throw new NotFoundException('Patient not found');

    const doctor = await this.doctorRepository.findOne({ where: { id: createAppointmentDto.doctorId } });
    if (!doctor) throw new NotFoundException('Selected doctor does not exist');

    const appointmentDate = new Date(createAppointmentDto.date);
    if (isNaN(appointmentDate.getTime())) {
      throw new BadRequestException('Invalid appointment date format');
    }

    if (appointmentDate < new Date()) {
      throw new BadRequestException('Appointment date cannot be in the past');
    }

    // Validate hospital if provided
    if (createAppointmentDto.hospitalId) {
      const hospital = await this.hospitalRepository.findOne({
        where: { id: createAppointmentDto.hospitalId },
      });
      if (!hospital) throw new NotFoundException('Selected hospital does not exist');
    }

    // Validate bed if provided
    if (createAppointmentDto.bedId) {
      const bed = await this.bedRepository.findOne({
        where: { id: createAppointmentDto.bedId },
      });
      if (!bed) throw new NotFoundException('Selected bed does not exist');

      // Verify bed belongs to the hospital if both are provided
      if (createAppointmentDto.hospitalId && bed.hospitalId !== createAppointmentDto.hospitalId) {
        throw new BadRequestException('Selected bed does not belong to the selected hospital');
      }
    }

    const appointmentData = {
      patientId: patient.id,
      doctorId: doctor.id,
      hospitalId: createAppointmentDto.hospitalId || null,
      bedId: createAppointmentDto.bedId || null,
      date: appointmentDate,
      reason: createAppointmentDto.reason,
      status: AppointmentStatus.PENDING,
    };

    const appointment = this.appointmentRepository.create(appointmentData as any);
    return this.appointmentRepository.save(appointment);
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto) {
    const appointment = await this.appointmentRepository.findOne({ where: { id } });
    if (!appointment) throw new NotFoundException('Appointment not found');

    const data: any = { ...updateAppointmentDto };
    if (updateAppointmentDto.date) {
      data.date = new Date(updateAppointmentDto.date);
    }

    await this.appointmentRepository.update(id, data);
    return this.findOne(id);
  }

  async findByPatient(userId: string) {
    const patient = await this.patientRepository.findOne({ where: { userId } });
    if (!patient) throw new NotFoundException('Patient not found');

    return this.appointmentRepository.find({
      where: { patientId: patient.id },
      relations: ['doctor', 'doctor.user'],
      order: { date: 'DESC' },
    });
  }

  async findByDoctor(userId: string) {
    const doctor = await this.doctorRepository.findOne({ where: { userId } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    return this.appointmentRepository.find({
      where: { doctorId: doctor.id },
      relations: ['patient', 'patient.user'],
      order: { date: 'ASC' },
    });
  }

  async findByHospital(userId: string) {
    // Get the hospital for this user
    const hospital = await this.hospitalRepository.findOne({ where: { userId } });
    if (!hospital) throw new NotFoundException('Hospital not found');

    const hospitalId = hospital.id;

    // Find all appointments for doctors in this hospital
    const appointments = await this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.doctor', 'doctor')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('patient.user', 'patient_user')
      .leftJoinAndSelect('doctor.user', 'doctor_user')
      .where('doctor.hospitalId = :hospitalId', { hospitalId })
      .orderBy('appointment.date', 'DESC')
      .getMany();

    return appointments;
  }

  async findOne(id: string) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: [
        'patient',
        'patient.user',
        'doctor',
        'doctor.user',
        'prescription',
        'bill',
      ],
    });
    if (!appointment) throw new NotFoundException('Appointment not found');
    return appointment;
  }
}
