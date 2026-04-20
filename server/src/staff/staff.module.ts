import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { Staff } from './entities/staff.entity';
import { Hospital } from '../hospitals/entities/hospital.entity';
import { UsersModule } from '../users/users.module';
import { HospitalsModule } from '../hospitals/hospitals.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Staff, Hospital]),
    UsersModule,
    HospitalsModule,
  ],
  providers: [StaffService],
  controllers: [StaffController],
  exports: [StaffService],
})
export class StaffModule {}
