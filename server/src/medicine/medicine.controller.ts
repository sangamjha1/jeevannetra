import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { MedicineSearchService } from './medicine.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('medicine')
@UseGuards(JwtAuthGuard)
export class MedicineController {
  constructor(private medicineSearchService: MedicineSearchService) {}

  @Get('search')
  async search(@Query('q') query: string) {
    return this.medicineSearchService.search(query);
  }

  @Get('details/:name')
  async getDetails(@Param('name') name: string) {
    return this.medicineSearchService.getDetails(name);
  }
}
