import { IsDateString, IsString, IsOptional, IsEnum } from 'class-validator';
import { AppointmentStatus } from '../entities/appointment.entity';

export class CreateAppointmentDto {
  @IsString()
  doctorId: string;

  @IsString()
  @IsOptional()
  hospitalId?: string;

  @IsString()
  @IsOptional()
  bedId?: string;

  @IsDateString()
  date: string;

  @IsString()
  reason: string;
}

export class UpdateAppointmentDto {
  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  reason?: string;
}
