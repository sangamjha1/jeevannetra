import { Controller, Get, Post, Patch, Body, UseGuards, Request, Param } from '@nestjs/common';
import { EmergencyService } from './emergency.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/entities/user.entity';
import { CreateEmergencyDto, UpdateEmergencyDto } from './dto/emergency.dto';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Controller('emergency')
export class EmergencyController {
  constructor(
    private emergencyService: EmergencyService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PATIENT)
  async trigger(@Request() req: AuthenticatedRequest, @Body() createEmergencyDto: CreateEmergencyDto) {
    return this.emergencyService.create(req.user.userId, createEmergencyDto);
  }

  @Post('trigger')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PATIENT)
  async triggerAlias(@Request() req: AuthenticatedRequest, @Body() createEmergencyDto: CreateEmergencyDto) {
    return this.emergencyService.create(req.user.userId, createEmergencyDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STAFF, Role.ADMIN, Role.HOSPITAL)
  async getAll() {
    return this.emergencyService.findAll();
  }

  @Get('active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STAFF, Role.ADMIN)
  async getActive() {
    return this.emergencyService.findActive();
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STAFF, Role.ADMIN, Role.HOSPITAL)
  async update(@Param('id') id: string, @Body() updateEmergencyDto: UpdateEmergencyDto) {
    return this.emergencyService.update(id, updateEmergencyDto);
  }

  @Patch(':id/respond')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STAFF, Role.ADMIN, Role.HOSPITAL)
  async respond(@Param('id') id: string) {
    return this.emergencyService.update(id, { status: 'DISPATCHED' });
  }

  @Post('accident/report')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PATIENT)
  async reportAccident(@Request() req: AuthenticatedRequest, @Body() body: any) {
    return this.emergencyService.reportAccident(
      req.user.userId,
      body.latitude,
      body.longitude,
      body.severity || 'MEDIUM',
    );
  }

  @Get('accident/reports')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STAFF, Role.ADMIN)
  async getAccidentReports() {
    return this.emergencyService.getAccidentReports();
  }

  @Post('auto-call')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PATIENT)
  async makeEmergencyCall(@Request() req: AuthenticatedRequest, @Body() body: any) {
    // Get user details
    const user = await this.userRepository.findOne({
      where: { id: req.user.userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Trigger both SMS and CallMeBot
    return this.emergencyService.triggerEmergency(
      req.user.userId,
      user,
      body.latitude || 0,
      body.longitude || 0,
    );
  }
}
