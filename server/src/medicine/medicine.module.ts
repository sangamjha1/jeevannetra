import { Module } from '@nestjs/common';
import { MedicineSearchService } from './medicine.service';
import { MedicineController } from './medicine.controller';

@Module({
  providers: [MedicineSearchService],
  controllers: [MedicineController],
  exports: [MedicineSearchService],
})
export class MedicineModule {}
