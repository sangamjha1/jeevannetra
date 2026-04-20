import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { Appointment } from './entities/appointment.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { Hospital } from '../hospitals/entities/hospital.entity';
import { Bed } from '../beds/entities/bed.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, Patient, Doctor, Hospital, Bed])],
  providers: [AppointmentsService],
  controllers: [AppointmentsController],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
