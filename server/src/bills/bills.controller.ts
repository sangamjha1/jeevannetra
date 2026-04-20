import { Controller, Get, Post, Body, UseGuards, Request, Param, Patch, Res } from '@nestjs/common';
import { BillsService } from './bills.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/entities/user.entity';
import { CreateBillDto, UpdateBillStatusDto } from './dto/bill.dto';
import type { Response } from 'express';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

@Controller('bills')
export class BillsController {
  constructor(private billsService: BillsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HOSPITAL, Role.ADMIN)
  async create(@Body() createBillDto: CreateBillDto) {
    return this.billsService.create(createBillDto);
  }

  @Get('patient')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PATIENT)
  async getByPatient(@Request() req: AuthenticatedRequest) {
    return this.billsService.findByPatient(req.user.userId);
  }

  @Get('hospital')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HOSPITAL)
  async getByHospital(@Request() req: AuthenticatedRequest) {
    return this.billsService.findByHospital(req.user.userId);
  }

  @Get('doctor')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOCTOR)
  async getByDoctor(@Request() req: AuthenticatedRequest) {
    return this.billsService.findByDoctor(req.user.userId);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getAll() {
    return this.billsService.findAll();
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.HOSPITAL, Role.ADMIN)
  async updateStatus(@Param('id') id: string, @Body() updateBillStatusDto: UpdateBillStatusDto) {
    return this.billsService.updateStatus(id, updateBillStatusDto);
  }

  @Get(':id/pdf')
  @UseGuards(JwtAuthGuard) // Any logged in relevant user can download their pdf
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${id}.pdf`);
    return this.billsService.generatePdf(id, res);
  }
}
