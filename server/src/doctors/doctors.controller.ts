import { Controller, Get, Post, Patch, Body, UseGuards, Request, Param } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/entities/user.entity';
import { CreateDoctorDto, UpdateDoctorDto } from './dto/doctor.dto';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

@Controller('doctors')
export class DoctorsController {
  constructor(private doctorsService: DoctorsService) {}

  @Get()
  async getAll() {
    return this.doctorsService.findAll();
  }

  @Get('hospital/:hospitalId')
  async getByHospital(@Param('hospitalId') hospitalId: string) {
    return this.doctorsService.findByHospital(hospitalId);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOCTOR)
  async getProfile(@Request() req: AuthenticatedRequest) {
    return this.doctorsService.findOne(req.user.userId);
  }

  @Post('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOCTOR)
  async createProfile(@Request() req: AuthenticatedRequest, @Body() createDoctorDto: CreateDoctorDto) {
    return this.doctorsService.create(req.user.userId, createDoctorDto);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOCTOR)
  async updateProfile(@Request() req: AuthenticatedRequest, @Body() updateDoctorDto: UpdateDoctorDto) {
    return this.doctorsService.update(req.user.userId, updateDoctorDto);
  }
}
