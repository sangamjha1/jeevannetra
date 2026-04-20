import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { Patient } from '../../patients/entities/patient.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';

@Entity('prescriptions')
export class Prescription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  appointmentId: string;

  @OneToOne(() => Appointment, (appointment) => appointment.prescription)
  @JoinColumn({ name: 'appointmentId' })
  appointment: Appointment;

  @Column()
  patientId: string;

  @ManyToOne(() => Patient, (patient) => patient.prescriptions)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column()
  doctorId: string;

  @ManyToOne(() => Doctor, (doctor) => doctor.prescriptions)
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;

  @Column()
  diagnosis: string;

  @Column({ type: 'json' })
  medicines: any; // {name, dosage, duration, frequency}[]

  @Column({ nullable: true })
  instructions: string;

  @CreateDateColumn()
  date: Date;
}
