import { Controller, Get, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/entities/user.entity';
import { CreatePrescriptionDto } from './dto/prescription.dto';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

@Controller('prescriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PrescriptionsController {
  constructor(private prescriptionsService: PrescriptionsService) {}

  @Post()
  @Roles(Role.DOCTOR)
  async create(@Request() req: AuthenticatedRequest, @Body() createPrescriptionDto: CreatePrescriptionDto) {
    return this.prescriptionsService.create(req.user.userId, createPrescriptionDto);
  }

  @Get('patient')
  @Roles(Role.PATIENT)
  async getByPatient(@Request() req: AuthenticatedRequest) {
    return this.prescriptionsService.findByPatient(req.user.userId);
  }

  @Get('doctor')
  @Roles(Role.DOCTOR)
  async getByDoctor(@Request() req: AuthenticatedRequest) {
    return this.prescriptionsService.findByDoctor(req.user.userId);
  }

  @Get('hospital/all')
  @Roles(Role.HOSPITAL)
  async getByHospital(@Request() req: AuthenticatedRequest) {
    return this.prescriptionsService.findByHospital(req.user.userId);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.prescriptionsService.findOne(id);
  }
}
