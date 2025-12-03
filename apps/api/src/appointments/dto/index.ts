import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { IsBusinessHours, IsFutureDate, IsQuarterHour } from '../../common/decorators/time-validation.decorator';

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
  @IsString({ message: 'O ID do serviço deve ser um texto válido' })
  @IsNotEmpty({ message: 'O serviço é obrigatório' })
  serviceId: string;

  @ApiProperty({ example: 'barber-id-123' })
  @IsString({ message: 'O ID do barbeiro deve ser um texto válido' })
  @IsNotEmpty({ message: 'O barbeiro é obrigatório' })
  barberId: string;

  @ApiProperty({ example: '2024-02-15T14:00:00Z' })
  @IsDateString({}, { message: 'A data deve estar no formato ISO 8601 (YYYY-MM-DDTHH:mm:ss)' })
  @IsFutureDate({ message: 'O agendamento deve ser para uma data e horário futuros' })
  @IsQuarterHour({ message: 'O horário deve ser em intervalos de 15 minutos (ex: 09:00, 09:15, 09:30, 09:45)' })
  @IsBusinessHours({ message: 'O horário deve estar entre 09:00 e 20:00' })
  @IsNotEmpty({ message: 'A data e hora do agendamento são obrigatórias' })
  scheduledAt: string;

  @ApiProperty({ example: 'Gostaria de um corte degradê', required: false })
  @IsString({ message: 'As observações devem ser um texto válido' })
  @MaxLength(500, { message: 'As observações devem ter no máximo 500 caracteres' })
  @Transform(({ value }) => value?.trim())
  @IsOptional()
  notes?: string;
}

export class UpdateAppointmentDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString({}, { message: 'A data deve estar no formato ISO 8601 (YYYY-MM-DDTHH:mm:ss)' })
  @IsFutureDate({ message: 'O agendamento deve ser para uma data e horário futuros' })
  @IsQuarterHour({ message: 'O horário deve ser em intervalos de 15 minutos (ex: 09:00, 09:15, 09:30, 09:45)' })
  @IsBusinessHours({ message: 'O horário deve estar entre 09:00 e 20:00' })
  scheduledAt?: string;

  @ApiProperty({ required: false, enum: AppointmentStatus })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'As observações devem ser um texto válido' })
  @MaxLength(500, { message: 'As observações devem ter no máximo 500 caracteres' })
  @Transform(({ value }) => value?.trim())
  notes?: string;
}

export class ChangeStatusDto {
  @ApiProperty({ enum: AppointmentStatus })
  @IsEnum(AppointmentStatus, { message: 'Status inválido. Use: PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED ou NO_SHOW' })
  @IsNotEmpty({ message: 'O status é obrigatório' })
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
