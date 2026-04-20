import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { Hospital } from '../../hospitals/entities/hospital.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';

@Entity('bills')
export class Bill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientId: string;

  @ManyToOne(() => Patient, (patient) => patient.bills)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column()
  hospitalId: string;

  @ManyToOne(() => Hospital, (hospital) => hospital.bills)
  @JoinColumn({ name: 'hospitalId' })
  hospital: Hospital;

  @Column({ nullable: true })
  appointmentId: string;

  @OneToOne(() => Appointment, (appointment) => appointment.bill)
  @JoinColumn({ name: 'appointmentId' })
  appointment: Appointment;

  @Column({ type: 'float' })
  amount: number;

  @Column({ type: 'json' })
  items: any; // Detailed breakdown

  @Column({ default: 'UNPAID' })
  status: string; // PAID, UNPAID

  @Column({ unique: true })
  invoiceNumber: string;

  @CreateDateColumn()
  date: Date;
}
