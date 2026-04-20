import { IsNumber, IsOptional, IsString, IsJSON } from 'class-validator';

export class CreateDoctorDto {
  @IsString()
  hospitalId: string;

  @IsString()
  specialization: string;

  @IsString()
  licenseNumber: string;

  @IsString()
  qualification: string;

  @IsNumber()
  yearsOfExperience: number;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsOptional()
  availability?: any;
}

export class UpdateDoctorDto {
  @IsString()
  @IsOptional()
  specialization?: string;

  @IsString()
  @IsOptional()
  qualification?: string;

  @IsNumber()
  @IsOptional()
  yearsOfExperience?: number;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsOptional()
  availability?: any; // JSON
}
