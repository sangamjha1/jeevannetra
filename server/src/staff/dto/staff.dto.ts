import { IsEnum, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { StaffType } from '../entities/staff.entity';

export class CreateStaffDto {
  @IsString()
  @IsNotEmpty()
  hospitalId: string;

  @IsEnum(StaffType)
  @IsNotEmpty()
  type: StaffType;

  @IsOptional()
  tasks?: any;
}

export class UpdateStaffDto {
  @IsEnum(StaffType)
  @IsNotEmpty()
  @IsOptional()
  type?: StaffType;

  @IsOptional()
  tasks?: any;
}
