import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { Prescription } from '../../prescriptions/entities/prescription.entity';
import { MedicalHistory } from '../../patients/entities/medical-history.entity';
import { Bill } from '../../bills/entities/bill.entity';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @OneToOne(() => User, (user) => user.patientProfile)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'float', nullable: true })
  weight: number;

  @Column({ type: 'float', nullable: true })
  height: number;

  @Column({ nullable: true })
  bloodGroup: string;

  @Column({ nullable: true })
  emergencyContact: string;

  @OneToMany(() => Appointment, (appointment) => appointment.patient)
  appointments: Appointment[];

  @OneToMany(() => Prescription, (prescription) => prescription.patient)
  prescriptions: Prescription[];

  @OneToMany(() => MedicalHistory, (history) => history.patient)
  medicalHistory: MedicalHistory[];

  @OneToMany(() => Bill, (bill) => bill.patient)
  bills: Bill[];
}
