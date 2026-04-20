import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum AccidentSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

@Entity('accident_reports')
export class AccidentReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'float' })
  latitude: number;

  @Column({ type: 'float' })
  longitude: number;

  @Column({
    type: 'enum',
    enum: AccidentSeverity,
    default: AccidentSeverity.MEDIUM,
  })
  severity: AccidentSeverity;

  @Column({ nullable: true })
  description: string;

  @Column({ default: false })
  alertsSent: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
