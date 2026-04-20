import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcesService } from './resources.service';
import { ResourcesController } from './resources.controller';
import { BloodBank } from './entities/blood-bank.entity';
import { ResourceHospital } from './entities/resource-hospital.entity';
import { PoliceStation } from './entities/police-station.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BloodBank, ResourceHospital, PoliceStation]),
  ],
  providers: [ResourcesService],
  controllers: [ResourcesController],
  exports: [ResourcesService],
})
export class ResourcesModule {}
