import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { Staff } from '../../staff/entities/staff.entity';
import { Bed } from '../../beds/entities/bed.entity';
import { Bill } from '../../bills/entities/bill.entity';

@Entity('hospitals')
export class Hospital {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  phone: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  userId: string;

  @OneToOne(() => User, (user) => user.hospitalProfile)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => Doctor, (doctor) => doctor.hospital)
  doctors: Doctor[];

  @OneToMany(() => Staff, (staff) => staff.hospital)
  staff: Staff[];

  @OneToMany(() => Bed, (bed) => bed.hospital)
  beds: Bed[];

  @OneToMany(() => Bill, (bill) => bill.hospital)
  bills: Bill[];

  @Column({ default: 0 })
  totalBeds: number;

  @Column({ default: 0 })
  availableBeds: number;
}
