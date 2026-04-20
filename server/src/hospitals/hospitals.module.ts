import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HospitalsService } from './hospitals.service';
import { HospitalsController } from './hospitals.controller';
import { Hospital } from './entities/hospital.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Hospital])],
  providers: [HospitalsService],
  controllers: [HospitalsController],
  exports: [HospitalsService],
})
export class HospitalsModule {}
