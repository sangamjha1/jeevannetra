import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { Hospital } from '../../hospitals/entities/hospital.entity';
import { Bed } from '../../beds/entities/bed.entity';
import { Prescription } from '../../prescriptions/entities/prescription.entity';
import { Bill } from '../../bills/entities/bill.entity';

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientId: string;

  @ManyToOne(() => Patient, (patient) => patient.appointments)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column()
  doctorId: string;

  @ManyToOne(() => Doctor, (doctor) => doctor.appointments)
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;

  @Column({ nullable: true })
  hospitalId: string;

  @ManyToOne(() => Hospital, { nullable: true })
  @JoinColumn({ name: 'hospitalId' })
  hospital: Hospital;

  @Column({ nullable: true })
  bedId: string;

  @ManyToOne(() => Bed, { nullable: true })
  @JoinColumn({ name: 'bedId' })
  bed: Bed;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column()
  reason: string;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;

  @OneToOne(() => Prescription, (prescription) => prescription.appointment)
  prescription: Prescription;

  @OneToOne(() => Bill, (bill) => bill.appointment)
  bill: Bill;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
