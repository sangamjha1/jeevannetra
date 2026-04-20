import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/entities/user.entity';

@Controller('resources')
export class ResourcesController {
  constructor(private resourcesService: ResourcesService) {}

  // BLOOD BANKS - Public endpoints
  @Get('blood-banks')
  async getAllBloodBanks() {
    return this.resourcesService.getAllBloodBanks();
  }

  @Get('blood-banks/nearest')
  async getNearestBloodBanks(
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
    @Query('radius') radius: string = '5',
  ) {
    return this.resourcesService.getNearestBloodBanks(
      parseFloat(latitude),
      parseFloat(longitude),
      parseFloat(radius),
    );
  }

  // HOSPITALS - Public endpoints
  @Get('hospitals')
  async getAllHospitals() {
    return this.resourcesService.getAllHospitals();
  }

  @Get('hospitals/nearest')
  async getNearestHospitals(
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
    @Query('radius') radius: string = '10',
  ) {
    return this.resourcesService.getNearestHospitals(
      parseFloat(latitude),
      parseFloat(longitude),
      parseFloat(radius),
    );
  }

  // POLICE STATIONS - Public endpoints
  @Get('police-stations')
  async getAllPoliceStations() {
    return this.resourcesService.getAllPoliceStations();
  }

  @Get('police-stations/nearest')
  async getNearestPoliceStations(
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
    @Query('radius') radius: string = '5',
  ) {
    return this.resourcesService.getNearestPoliceStations(
      parseFloat(latitude),
      parseFloat(longitude),
      parseFloat(radius),
    );
  }

  // ADMIN ENDPOINTS - Only for ADMIN role
  @Post('blood-banks')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async createBloodBank(@Body() data: any) {
    return this.resourcesService.createBloodBank(data);
  }

  @Patch('blood-banks/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateBloodBank(@Param('id') id: string, @Body() data: any) {
    return this.resourcesService.updateBloodBank(id, data);
  }

  @Delete('blood-banks/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async deleteBloodBank(@Param('id') id: string) {
    return this.resourcesService.deleteBloodBank(id);
  }

  @Post('hospitals')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async createHospital(@Body() data: any) {
    return this.resourcesService.createHospital(data);
  }

  @Patch('hospitals/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateHospital(@Param('id') id: string, @Body() data: any) {
    return this.resourcesService.updateHospital(id, data);
  }

  @Delete('hospitals/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async deleteHospital(@Param('id') id: string) {
    return this.resourcesService.deleteHospital(id);
  }

  @Post('police-stations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async createPoliceStation(@Body() data: any) {
    return this.resourcesService.createPoliceStation(data);
  }

  @Patch('police-stations/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updatePoliceStation(@Param('id') id: string, @Body() data: any) {
    return this.resourcesService.updatePoliceStation(id, data);
  }

  @Delete('police-stations/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async deletePoliceStation(@Param('id') id: string) {
    return this.resourcesService.deletePoliceStation(id);
  }
}
