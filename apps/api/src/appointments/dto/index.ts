import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export class CreateAppointmentDto {
  @ApiProperty({ example: 'service-id-123' })
  @IsString()
  @IsNotEmpty()
  serviceId: string;

  @ApiProperty({ example: 'barber-id-123' })
  @IsString()
  @IsNotEmpty()
  barberId: string;

  @ApiProperty({ example: '2024-02-15T14:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  scheduledAt: string;

  @ApiProperty({ example: 'Gostaria de um corte degradê', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateAppointmentDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiProperty({ required: false, enum: AppointmentStatus })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ChangeStatusDto {
  @ApiProperty({ enum: AppointmentStatus })
  @IsEnum(AppointmentStatus)
  @IsNotEmpty()
  status: AppointmentStatus;
}

export class QueryAppointmentDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  barberId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiProperty({ required: false, enum: AppointmentStatus })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiProperty({ required: false, example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false, example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  page?: number;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  limit?: number;
}

export class CheckAvailabilityDto {
  @ApiProperty({ example: '2024-02-15' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: 'service-id-123' })
  @IsString()
  @IsNotEmpty()
  serviceId: string;
}
