import { Controller, Get, Post, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/entities/user.entity';
import { CreatePatientDto, UpdatePatientDto } from './dto/patient.dto';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatientsController {
  constructor(private patientsService: PatientsService) {}

  @Get()
  @Roles(Role.DOCTOR, Role.STAFF, Role.HOSPITAL, Role.ADMIN)
  async getAllPatients() {
    return this.patientsService.findAll();
  }

  @Get('profile')
  @Roles(Role.PATIENT)
  async getProfile(@Request() req: AuthenticatedRequest) {
    return this.patientsService.findOne(req.user.userId);
  }

  @Post('profile')
  @Roles(Role.PATIENT)
  async createProfile(@Request() req: AuthenticatedRequest, @Body() createPatientDto: CreatePatientDto) {
    return this.patientsService.create(req.user.userId, createPatientDto);
  }

  @Patch('profile')
  @Roles(Role.PATIENT)
  async updateProfile(@Request() req: AuthenticatedRequest, @Body() updatePatientDto: UpdatePatientDto) {
    return this.patientsService.update(req.user.userId, updatePatientDto);
  }

  @Get('medical-history')
  @Roles(Role.PATIENT)
  async getMedicalHistory(@Request() req: AuthenticatedRequest) {
    return this.patientsService.getMedicalHistory(req.user.userId);
  }

  @Get('prescriptions')
  @Roles(Role.PATIENT)
  async getPrescriptions(@Request() req: AuthenticatedRequest) {
    return this.patientsService.getPrescriptions(req.user.userId);
  }

  @Get('bills')
  @Roles(Role.PATIENT)
  async getBills(@Request() req: AuthenticatedRequest) {
    return this.patientsService.getBills(req.user.userId);
  }
}
