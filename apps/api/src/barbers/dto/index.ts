import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateBarberDto {
  @ApiProperty({ example: 'user-id-123' })
  @IsString({ message: 'O ID do usuário deve ser um texto válido' })
  @IsNotEmpty({ message: 'O usuário é obrigatório' })
  userId: string;

  @ApiProperty({ example: ['Corte tradicional', 'Barba'] })
  @IsArray({ message: 'Especialidades devem ser uma lista de textos' })
  @IsOptional()
  specialties?: string[];

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
  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  specialties?: string[];

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
