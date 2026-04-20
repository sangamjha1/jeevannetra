import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Hospital } from '../../hospitals/entities/hospital.entity';

export enum BedType {
  GENERAL = 'GENERAL',
  ICU = 'ICU',
  PRIVATE = 'PRIVATE',
  VENTILATOR = 'VENTILATOR',
}

export enum BedStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
}

@Entity('beds')
export class Bed {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  hospitalId: string;

  @ManyToOne(() => Hospital, (hospital) => hospital.beds)
  @JoinColumn({ name: 'hospitalId' })
  hospital: Hospital;

  @Column({
    type: 'enum',
    enum: BedType,
    default: BedType.GENERAL,
  })
  type: BedType;

  @Column({
    type: 'enum',
    enum: BedStatus,
    default: BedStatus.AVAILABLE,
  })
  status: BedStatus;

  @Column({ type: 'float' })
  pricePerDay: number;
}
