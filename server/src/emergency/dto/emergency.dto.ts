import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateEmergencyDto {
  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsString()
  @IsOptional()
  message?: string;
}

export class UpdateEmergencyDto {
  @IsString()
  status: string; // PENDING, DISPATCHED, COMPLETED

  @IsString()
  @IsOptional()
  staffId?: string;
}
