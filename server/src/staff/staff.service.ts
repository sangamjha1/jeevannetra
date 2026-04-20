import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from './entities/staff.entity';
import { CreateStaffDto, UpdateStaffDto } from './dto/staff.dto';
import { Hospital } from '../hospitals/entities/hospital.entity';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
    @InjectRepository(Hospital)
    private hospitalRepository: Repository<Hospital>,
  ) {}

  async create(userId: string, createStaffDto: CreateStaffDto) {
    const staff = this.staffRepository.create({
      userId,
      hospitalId: createStaffDto.hospitalId,
      type: createStaffDto.type,
      tasks: createStaffDto.tasks || {},
    });
    return this.staffRepository.save(staff);
  }

  async findByHospital(hospitalUserId: string) {
    const hospital = await this.hospitalRepository.findOne({ where: { userId: hospitalUserId } });
    if (!hospital) throw new NotFoundException('Hospital not found');

    // Return staff with user info
    const staffList = await this.staffRepository.find({
      where: { hospitalId: hospital.id },
      relations: ['user'],
    });

    return staffList;
  }

  async findAll() {
    return this.staffRepository.find({
      relations: ['user', 'hospital'],
      order: { id: 'DESC' },
    });
  }

  async findOne(userId: string) {
    const staff = await this.staffRepository.findOne({
      where: { userId },
      relations: ['user', 'hospital'],
    });
    if (!staff) throw new NotFoundException('Staff member not found');
    return staff;
  }

  async update(userId: string, updateStaffDto: UpdateStaffDto) {
    await this.staffRepository.update({ userId }, {
      type: updateStaffDto.type,
      tasks: updateStaffDto.tasks,
    });
    return this.findOne(userId);
  }

  async remove(userId: string) {
    const result = await this.staffRepository.delete({ userId });
    return (result.affected ?? 0) > 0;
  }

  async getTasks(userId: string) {
    const staff = await this.findOne(userId);
    return staff.tasks;
  }

  async updateTasks(userId: string, tasks: any) {
    await this.staffRepository.update({ userId }, { tasks });
    return this.findOne(userId);
  }
}
