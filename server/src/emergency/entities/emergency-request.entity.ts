import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Staff } from '../../staff/entities/staff.entity';

export enum EmergencyStatus {
  PENDING = 'PENDING',
  DISPATCHED = 'DISPATCHED',
  COMPLETED = 'COMPLETED',
}

@Entity('emergency_requests')
export class EmergencyRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.emergencySignals)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'float' })
  latitude: number;

  @Column({ type: 'float' })
  longitude: number;

  @Column({
    type: 'enum',
    enum: EmergencyStatus,
    default: EmergencyStatus.PENDING,
  })
  status: EmergencyStatus;

  @Column({ nullable: true })
  staffId: string;

  @ManyToOne(() => Staff, (staff) => staff.emergencyResponse)
  @JoinColumn({ name: 'staffId' })
  staff: Staff;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
