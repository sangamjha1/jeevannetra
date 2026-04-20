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
import { EmergencyRequest } from '../../emergency/entities/emergency-request.entity';

export enum StaffType {
  NURSE = 'NURSE',
  AMBULANCE_DRIVER = 'AMBULANCE_DRIVER',
  WARD_BOY = 'WARD_BOY',
  ICU_STAFF = 'ICU_STAFF',
  OT_STAFF = 'OT_STAFF',
  OPD_STAFF = 'OPD_STAFF',
  DOCTOR = 'DOCTOR',
  SURGEON = 'SURGEON',
  ANESTHETIST = 'ANESTHETIST',
  PHYSIOTHERAPIST = 'PHYSIOTHERAPIST',
  LAB_TECHNICIAN = 'LAB_TECHNICIAN',
  RECEPTIONIST = 'RECEPTIONIST',
  SECURITY = 'SECURITY',
}

@Entity('staff')
export class Staff {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @OneToOne(() => User, (user) => user.staffProfile)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  hospitalId: string;

  @ManyToOne(() => Hospital, (hospital) => hospital.staff)
  @JoinColumn({ name: 'hospitalId' })
  hospital: Hospital;

  @Column({
    type: 'enum',
    enum: StaffType,
  })
  type: StaffType;

  @Column({ type: 'json', nullable: true })
  tasks: any;

  @OneToMany(() => EmergencyRequest, (request) => request.staff)
  emergencyResponse: EmergencyRequest[];
}
