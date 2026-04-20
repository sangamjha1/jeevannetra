import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PatientsModule } from './patients/patients.module';
import { DoctorsModule } from './doctors/doctors.module';
import { HospitalsModule } from './hospitals/hospitals.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';
import { BillsModule } from './bills/bills.module';
import { BedsModule } from './beds/beds.module';
import { StaffModule } from './staff/staff.module';
import { EmergencyModule } from './emergency/emergency.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MedicineModule } from './medicine/medicine.module';
import { ResourcesModule } from './resources/resources.module';
import { HealthController } from './health.controller';

// Entities
import { User } from './users/entities/user.entity';
import { Hospital } from './hospitals/entities/hospital.entity';
import { Patient } from './patients/entities/patient.entity';
import { Doctor } from './doctors/entities/doctor.entity';
import { Staff } from './staff/entities/staff.entity';
import { Appointment } from './appointments/entities/appointment.entity';
import { Prescription } from './prescriptions/entities/prescription.entity';
import { Bill } from './bills/entities/bill.entity';
import { Bed } from './beds/entities/bed.entity';
import { EmergencyRequest } from './emergency/entities/emergency-request.entity';
import { AccidentReport } from './emergency/entities/accident-report.entity';
import { Notification } from './notifications/entities/notification.entity';
import { MedicalHistory } from './patients/entities/medical-history.entity';
import { BloodBank } from './resources/entities/blood-bank.entity';
import { ResourceHospital } from './resources/entities/resource-hospital.entity';
import { PoliceStation } from './resources/entities/police-station.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [
        User,
        Hospital,
        Patient,
        Doctor,
        Staff,
        Appointment,
        Prescription,
        Bill,
        Bed,
        EmergencyRequest,
        AccidentReport,
        Notification,
        MedicalHistory,
        BloodBank,
        ResourceHospital,
        PoliceStation,
      ],
      synchronize: true, // Only for development
      ssl: {
        rejectUnauthorized: false, // Required for Neon
      },
    }),
    AuthModule,
    UsersModule,
    PatientsModule,
    DoctorsModule,
    HospitalsModule,
    AppointmentsModule,
    PrescriptionsModule,
    BillsModule,
    BedsModule,
    StaffModule,
    EmergencyModule,
    NotificationsModule,
    MedicineModule,
    ResourcesModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
