import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hospital } from './entities/hospital.entity';
import { CreateHospitalDto, UpdateHospitalDto } from './dto/hospital.dto';

@Injectable()
export class HospitalsService {
  constructor(
    @InjectRepository(Hospital)
    private hospitalRepository: Repository<Hospital>,
  ) {}

  async findAll() {
    return this.hospitalRepository.find({
      relations: ['beds', 'doctors', 'doctors.user'],
    });
  }

  async findOne(idOrUserId: string) {
    const hospital = await this.hospitalRepository.findOne({
      where: [
        { id: idOrUserId },
        { userId: idOrUserId },
      ],
      relations: [
        'beds',
        'doctors',
        'doctors.user',
        'staff',
        'staff.user',
        'bills',
      ],
    });
    if (!hospital) throw new NotFoundException('Hospital not found');
    return hospital;
  }

  async create(userId: string, createHospitalDto: CreateHospitalDto) {
    const hospital = this.hospitalRepository.create({
      ...createHospitalDto,
      userId,
    });
    return this.hospitalRepository.save(hospital);
  }

  async update(userId: string, updateHospitalDto: UpdateHospitalDto) {
    const hospital = await this.hospitalRepository.findOne({ where: { userId } });
    if (!hospital) throw new NotFoundException('Hospital not found');
    
    await this.hospitalRepository.update({ userId }, updateHospitalDto);
    return this.findOne(userId);
  }

  async getResourceStats(userId: string) {
    const hospital = await this.hospitalRepository.findOne({
      where: { userId },
      relations: ['doctors', 'staff', 'bills'],
    });
    
    if (!hospital) throw new NotFoundException('Hospital not found');

    const totalRevenue = hospital.bills
      .filter((b) => b.status === 'PAID')
      .reduce((sum, b) => sum + b.amount, 0);

    return {
      bedStats: { total: hospital.totalBeds, available: hospital.availableBeds },
      doctorCount: hospital.doctors.length,
      staffCount: hospital.staff.length,
      totalRevenue,
    };
  }
}
