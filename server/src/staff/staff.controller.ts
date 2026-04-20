import { Controller, Get, Post, Body, UseGuards, Request, Param, Patch, Delete } from '@nestjs/common';
import { StaffService } from './staff.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/entities/user.entity';
import { CreateStaffDto, UpdateStaffDto } from './dto/staff.dto';
import { UsersService } from '../users/users.service';
import { HospitalsService } from '../hospitals/hospitals.service';
import * as bcrypt from 'bcrypt';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

@Controller('staff')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StaffController {
  constructor(
    private staffService: StaffService,
    private usersService: UsersService,
    private hospitalsService: HospitalsService,
  ) {}

  @Post()
  @Roles(Role.HOSPITAL, Role.ADMIN)
  async create(@Request() req: AuthenticatedRequest, @Body() createStaffDto: CreateStaffDto & { email?: string; firstName?: string; lastName?: string; phone?: string }) {
    let hospitalId = createStaffDto.hospitalId;
    let userId: string;

    // If HOSPITAL role, auto-get their hospital
    if (req.user.role === 'HOSPITAL') {
      const hospital = await this.hospitalsService.findOne(req.user.userId).catch(() => null);
      if (hospital) hospitalId = hospital.id;
    }

    // If email provided, create user account first
    if (createStaffDto.email) {
      let user = await this.usersService.findByEmail(createStaffDto.email).catch(() => null);
      if (!user) {
        const hashedPassword = await bcrypt.hash('Staff123!@', 10);
        user = await this.usersService.create({
          email: createStaffDto.email,
          password: hashedPassword,
          firstName: createStaffDto.firstName || 'Staff',
          lastName: createStaffDto.lastName || 'Member',
          phone: createStaffDto.phone,
          role: Role.STAFF,
          onboardingDone: true,
        });
      }
      userId = user.id;
    } else {
      throw new Error('Email is required to create staff');
    }

    return this.staffService.create(userId, {
      hospitalId,
      type: createStaffDto.type,
      tasks: createStaffDto.tasks,
    });
  }

  @Get('hospital')
  @Roles(Role.HOSPITAL)
  async getByHospital(@Request() req: AuthenticatedRequest) {
    return this.staffService.findByHospital(req.user.userId);
  }

  @Get('all')
  @Roles(Role.ADMIN)
  async getAll() {
    return this.staffService.findAll();
  }

  @Get('me')
  @Roles(Role.STAFF)
  async getMe(@Request() req: AuthenticatedRequest) {
    return this.staffService.findOne(req.user.userId);
  }

  @Patch('me/tasks')
  @Roles(Role.STAFF)
  async updateMyTasks(@Request() req: AuthenticatedRequest, @Body() tasks: any) {
    return this.staffService.updateTasks(req.user.userId, tasks);
  }

  @Patch(':userId')
  @Roles(Role.HOSPITAL, Role.ADMIN)
  async update(@Param('userId') userId: string, @Body() updateStaffDto: UpdateStaffDto) {
    return this.staffService.update(userId, updateStaffDto);
  }

  @Delete(':userId')
  @Roles(Role.HOSPITAL, Role.ADMIN)
  async remove(@Param('userId') userId: string) {
    return this.staffService.remove(userId);
  }
}
