import { IsString, IsNumber, IsArray, ValidateNested, IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class BillItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;
}

export class CreateBillDto {
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @IsString()
  @IsNotEmpty()
  hospitalId: string;

  @IsString()
  @IsOptional()
  appointmentId?: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BillItemDto)
  items: BillItemDto[];
}

export class UpdateBillStatusDto {
  @IsString()
  @IsNotEmpty()
  status: string; // PAID, UNPAID
}
