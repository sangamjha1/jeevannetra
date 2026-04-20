import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('resource_hospitals')
export class ResourceHospital {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column({ type: 'float' })
  latitude: number;

  @Column({ type: 'float' })
  longitude: number;

  @Column()
  phone: string;

  @Column({ nullable: true })
  website: string;

  @Column('text', { array: true, default: () => "ARRAY['Emergency', 'ICU', 'Surgery', 'Cardiology']" })
  departments: string[];

  @Column({ type: 'integer', default: 50 })
  totalBeds: number;

  @Column({ type: 'integer', default: 10 })
  availableBeds: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
