import { IsString, IsArray, ValidateNested, IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class MedicineDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  dosage: string;

  @IsString()
  @IsNotEmpty()
  duration: string;

  @IsString()
  @IsNotEmpty()
  frequency: string;
}

export class CreatePrescriptionDto {
  @IsString()
  @IsNotEmpty()
  appointmentId: string;

  @IsString()
  @IsNotEmpty()
  patientId: string;

  @IsString()
  @IsNotEmpty()
  diagnosis: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicineDto)
  medicines: MedicineDto[];

  @IsString()
  @IsOptional()
  instructions?: string;
}
