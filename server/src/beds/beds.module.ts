import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BedsService } from './beds.service';
import { BedsController } from './beds.controller';
import { Bed } from './entities/bed.entity';
import { Hospital } from '../hospitals/entities/hospital.entity';
import { Staff } from '../staff/entities/staff.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bed, Hospital, Staff])],
  providers: [BedsService],
  controllers: [BedsController],
  exports: [BedsService],
})
export class BedsModule {}
