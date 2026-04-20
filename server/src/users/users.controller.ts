import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Hospital } from '../hospitals/entities/hospital.entity';
import { Staff } from '../staff/entities/staff.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Prescription } from '../prescriptions/entities/prescription.entity';
import { Bill } from '../bills/entities/bill.entity';
import * as bcrypt from 'bcrypt';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private usersService: UsersService,
  ) {}
}

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(
    private usersService: UsersService,
    @InjectRepository(Hospital)
    private hospitalRepository: Repository<Hospital>,
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(Prescription)
    private prescriptionRepository: Repository<Prescription>,
    @InjectRepository(Bill)
    private billRepository: Repository<Bill>,
  ) {}

  @Get('stats')
  async getSystemStats() {
    try {
      const [totalUsers, totalHospitals, totalStaff, totalAppointments, totalPrescriptions, totalBills] = await Promise.all([
        this.usersService.findAll().then((users) => users.length).catch(() => 0),
        this.hospitalRepository.count(),
        this.staffRepository.count(),
        this.appointmentRepository.count(),
        this.prescriptionRepository.count(),
        this.billRepository.count(),
      ]);

      return {
        totalUsers,
        totalHospitals,
        totalStaff,
        totalAppointments,
        totalPrescriptions,
        totalBills,
      };
    } catch (error) {
      console.error('Error getting system stats:', error);
      return {
        totalUsers: 0,
        totalHospitals: 0,
        totalStaff: 0,
        totalAppointments: 0,
        totalPrescriptions: 0,
        totalBills: 0,
      };
    }
  }

  @Get('users')
  async getAllUsers() {
    return this.usersService.findAll();
  }

  @Post('users')
  async createUser(
    @Body() createUserDto: { email: string; firstName: string; lastName: string; role: Role; phone?: string }
  ) {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(createUserDto.email).catch(() => null);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create new user with default password
    const hashedPassword = await bcrypt.hash('Admin@123!', 10);
    const user = await this.usersService.create({
      email: createUserDto.email,
      password: hashedPassword,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      phone: createUserDto.phone,
      role: createUserDto.role,
      onboardingDone: true,
    });

    return user;
  }

  @Delete('users/:userId')
  async deleteUser(@Param('userId') userId: string) {
    return this.usersService.delete(userId);
  }

  @Get('hospitals')
  async getAllHospitals() {
    return this.hospitalRepository.find({
      relations: ['user', 'staff'],
    });
  }
}


