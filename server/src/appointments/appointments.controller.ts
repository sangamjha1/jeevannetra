import { Controller, Get, Post, Patch, Body, UseGuards, Request, Param } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/entities/user.entity';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto/appointment.dto';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  @Post()
  @Roles(Role.PATIENT)
  async create(@Request() req: AuthenticatedRequest, @Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.create(req.user.userId, createAppointmentDto);
  }

  @Get('patient')
  @Roles(Role.PATIENT)
  async getByPatient(@Request() req: AuthenticatedRequest) {
    return this.appointmentsService.findByPatient(req.user.userId);
  }

  @Get('doctor')
  @Roles(Role.DOCTOR)
  async getByDoctor(@Request() req: AuthenticatedRequest) {
    return this.appointmentsService.findByDoctor(req.user.userId);
  }

  @Get('hospital/all')
  @Roles(Role.HOSPITAL)
  async getByHospital(@Request() req: AuthenticatedRequest) {
    return this.appointmentsService.findByHospital(req.user.userId);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.DOCTOR, Role.HOSPITAL, Role.PATIENT)
  async update(@Param('id') id: string, @Body() updateAppointmentDto: UpdateAppointmentDto) {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }
}
