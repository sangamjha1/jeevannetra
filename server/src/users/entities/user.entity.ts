import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { Staff } from '../../staff/entities/staff.entity';
import { Hospital } from '../../hospitals/entities/hospital.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { EmergencyRequest } from '../../emergency/entities/emergency-request.entity';

export enum Role {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  STAFF = 'STAFF',
  HOSPITAL = 'HOSPITAL',
  ADMIN = 'ADMIN',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.PATIENT,
  })
  role: Role;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ type: 'timestamp', nullable: true })
  dateOfBirth: Date;

  @Column({ type: 'text', nullable: true })
  refreshToken: string | null;

  @Column({ default: false })
  onboardingDone: boolean;

  @Column({ type: 'json', nullable: true })
  emergencyContacts: Array<{ name: string; phone: string }>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Patient, (patient) => patient.user)
  patientProfile: Patient;

  @OneToOne(() => Doctor, (doctor) => doctor.user)
  doctorProfile: Doctor;

  @OneToOne(() => Staff, (staff) => staff.user)
  staffProfile: Staff;

  @OneToOne(() => Hospital, (hospital) => hospital.user)
  hospitalProfile: Hospital;

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => EmergencyRequest, (request) => request.user)
  emergencySignals: EmergencyRequest[];
}
