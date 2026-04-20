import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Hospital } from '../../hospitals/entities/hospital.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { Prescription } from '../../prescriptions/entities/prescription.entity';

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @OneToOne(() => User, (user) => user.doctorProfile)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  hospitalId: string;

  @ManyToOne(() => Hospital, (hospital) => hospital.doctors)
  @JoinColumn({ name: 'hospitalId' })
  hospital: Hospital;

  @Column()
  specialization: string;

  @Column({ unique: true })
  licenseNumber: string;

  @Column()
  qualification: string;

  @Column()
  yearsOfExperience: number;

  @Column({ nullable: true })
  bio: string;

  @Column({ type: 'json', nullable: true })
  availability: any;

  @OneToMany(() => Appointment, (appointment) => appointment.doctor)
  appointments: Appointment[];

  @OneToMany(() => Prescription, (prescription) => prescription.doctor)
  prescriptions: Prescription[];
}
