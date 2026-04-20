import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { BedsService } from './beds.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/entities/user.entity';
import { BedStatus, BedType } from './entities/bed.entity';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

@Controller('beds')
export class BedsController {
  constructor(private readonly bedsService: BedsService) {}

  @Get('hospital/:hospitalId')
  async getBedsByHospital(@Param('hospitalId') hospitalId: string) {
    return this.bedsService.findByHospitalId(hospitalId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STAFF, Role.HOSPITAL, Role.ADMIN)
  async getBeds(@Request() req: AuthenticatedRequest) {
    return this.bedsService.findByUserScope(req.user.userId, req.user.role as Role);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HOSPITAL, Role.ADMIN)
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() body: { type?: BedType; pricePerDay?: number },
  ) {
    return this.bedsService.createForHospital(req.user.userId, body);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STAFF, Role.HOSPITAL, Role.ADMIN)
  async updateStatus(@Param('id') id: string, @Body() body: { status: BedStatus }) {
    return this.bedsService.updateStatus(id, body.status);
  }
}
