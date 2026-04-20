import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(data: Partial<User>): Promise<User> {
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['patientProfile', 'doctorProfile', 'hospitalProfile', 'staffProfile'],
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['patientProfile', 'doctorProfile', 'hospitalProfile', 'staffProfile'],
    });
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    await this.userRepository.update(id, data);
    const user = await this.findById(id);
    if (!user) throw new Error('User not found after update');
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['patientProfile', 'doctorProfile', 'hospitalProfile', 'staffProfile'],
      order: { createdAt: 'DESC' },
    });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async setRefreshToken(userId: string, refreshToken: string | null) {
    return this.userRepository.update(userId, { refreshToken } as any);
  }
}
