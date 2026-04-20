import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bed, BedStatus, BedType } from './entities/bed.entity';
import { Hospital } from '../hospitals/entities/hospital.entity';
import { Staff } from '../staff/entities/staff.entity';
import { Role } from '../users/entities/user.entity';

@Injectable()
export class BedsService {
  constructor(
    @InjectRepository(Bed)
    private readonly bedRepository: Repository<Bed>,
    @InjectRepository(Hospital)
    private readonly hospitalRepository: Repository<Hospital>,
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
  ) {}

  private async resolveHospitalIdForUser(userId: string, role: Role) {
    if (role === Role.HOSPITAL) {
      const hospital = await this.hospitalRepository.findOne({ where: { userId } });
      if (!hospital) throw new NotFoundException('Hospital profile not found');
      return hospital.id;
    }

    if (role === Role.STAFF) {
      const staff = await this.staffRepository.findOne({ where: { userId } });
      if (!staff) throw new NotFoundException('Staff profile not found');
      return staff.hospitalId;
    }

    return null;
  }

  async findByUserScope(userId: string, role: Role) {
    const hospitalId = await this.resolveHospitalIdForUser(userId, role);

    const where = hospitalId ? { hospitalId } : {};
    return this.bedRepository.find({
      where,
      order: { status: 'ASC' },
    });
  }

  async findByHospitalId(hospitalId: string) {
    return this.bedRepository.find({
      where: { hospitalId },
      relations: { hospital: true },
      order: { status: 'ASC' },
    });
  }

  async createForHospital(
    userId: string,
    payload: { type?: BedType; pricePerDay?: number },
  ) {
    const hospital = await this.hospitalRepository.findOne({ where: { userId } });
    if (!hospital) throw new NotFoundException('Hospital profile not found');

    const bed = this.bedRepository.create({
      hospitalId: hospital.id,
      type: payload.type ?? BedType.GENERAL,
      status: BedStatus.AVAILABLE,
      pricePerDay: payload.pricePerDay ?? 0,
    });

    const saved = await this.bedRepository.save(bed);
    await this.hospitalRepository.update(
      { id: hospital.id },
      { totalBeds: hospital.totalBeds + 1, availableBeds: hospital.availableBeds + 1 },
    );

    return saved;
  }

  async updateStatus(id: string, status: BedStatus) {
    const bed = await this.bedRepository.findOne({ where: { id } });
    if (!bed) throw new NotFoundException('Bed not found');

    if (bed.status === status) {
      return bed;
    }

    await this.bedRepository.update(id, { status });

    const hospital = await this.hospitalRepository.findOne({ where: { id: bed.hospitalId } });
    if (hospital) {
      const delta = status === BedStatus.AVAILABLE ? 1 : -1;
      await this.hospitalRepository.update(
        { id: hospital.id },
        { availableBeds: Math.max(0, hospital.availableBeds + delta) },
      );
    }

    const updated = await this.bedRepository.findOne({ where: { id } });
    if (!updated) throw new NotFoundException('Bed not found after update');
    return updated;
  }
}
