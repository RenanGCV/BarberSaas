import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateBarberDto {
  @ApiProperty({ example: 'user-id-123' })
  @IsString({ message: 'O ID do usuário deve ser um texto válido' })
  @IsNotEmpty({ message: 'O usuário é obrigatório' })
  userId: string;

  @ApiProperty({ example: ['Corte tradicional', 'Barba'], deprecated: true })
  @IsArray({ message: 'Especialidades devem ser uma lista de textos' })
  @IsOptional()
  specialties?: string[];

  @ApiProperty({ example: ['service-id-1', 'service-id-2'], description: 'IDs dos serviços que o barbeiro realiza' })
  @IsArray({ message: 'serviceIds deve ser um array de IDs de serviços' })
  @IsOptional()
  serviceIds?: string[];

  @ApiProperty({ example: 30, description: 'Porcentagem de comissão (0-100)' })
  @IsNumber({}, { message: 'A comissão deve ser um número' })
  @Min(0, { message: 'A comissão não pode ser negativa' })
  @Max(100, { message: 'A comissão não pode ser maior que 100%' })
  commission: number;

  @ApiProperty({ example: 'Segunda a Sexta: 09:00-18:00' })
  @IsString({ message: 'Horário de trabalho deve ser um texto válido' })
  @IsOptional()
  workingHours?: string;
}

export class UpdateBarberDto {
  @ApiProperty({ required: false, deprecated: true })
  @IsOptional()
  @IsArray()
  specialties?: string[];

  @ApiProperty({ required: false, description: 'IDs dos serviços que o barbeiro realiza' })
  @IsOptional()
  @IsArray()
  serviceIds?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  commission?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  workingHours?: string;
}

export class BarberAvailabilityDto {
  @ApiProperty({ example: '2024-02-15' })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: '14:00' })
  @IsString()
  @IsNotEmpty()
  time: string;
}
