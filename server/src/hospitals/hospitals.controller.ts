import { Controller, Get, Post, Patch, Body, UseGuards, Request, Param } from '@nestjs/common';
import { HospitalsService } from './hospitals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/entities/user.entity';
import { CreateHospitalDto, UpdateHospitalDto } from './dto/hospital.dto';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

@Controller('hospitals')
export class HospitalsController {
  constructor(private hospitalsService: HospitalsService) {}

  @Get()
  async getAll() {
    return this.hospitalsService.findAll();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.hospitalsService.findOne(id);
  }

  @Get('profile/details')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HOSPITAL)
  async getProfile(@Request() req: AuthenticatedRequest) {
    return this.hospitalsService.findOne(req.user.userId);
  }

  @Post('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HOSPITAL)
  async createProfile(@Request() req: AuthenticatedRequest, @Body() createHospitalDto: CreateHospitalDto) {
    return this.hospitalsService.create(req.user.userId, createHospitalDto);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HOSPITAL)
  async updateProfile(@Request() req: AuthenticatedRequest, @Body() updateHospitalDto: UpdateHospitalDto) {
    return this.hospitalsService.update(req.user.userId, updateHospitalDto);
  }

  @Get('analytics/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HOSPITAL)
  async getStats(@Request() req: AuthenticatedRequest) {
    return this.hospitalsService.getResourceStats(req.user.userId);
  }
}
