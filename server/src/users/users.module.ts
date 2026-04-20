import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController, AdminController } from './users.controller';
import { User } from './entities/user.entity';
import { Hospital } from '../hospitals/entities/hospital.entity';
import { Staff } from '../staff/entities/staff.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Prescription } from '../prescriptions/entities/prescription.entity';
import { Bill } from '../bills/entities/bill.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Hospital, Staff, Appointment, Prescription, Bill])],
  providers: [UsersService],
  controllers: [UsersController, AdminController],
  exports: [UsersService],
})
export class UsersModule {}
