import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({ example: 'Corte Tradicional' })
  @IsString({ message: 'O nome do serviço deve ser um texto válido' })
  @IsNotEmpty({ message: 'O nome do serviço é obrigatório' })
  @MaxLength(100, { message: 'O nome deve ter no máximo 100 caracteres' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({ example: 'Corte masculino tradicional com máquina e tesoura' })
  @IsString({ message: 'A descrição deve ser um texto válido' })
  @IsOptional()
  @MaxLength(500, { message: 'A descrição deve ter no máximo 500 caracteres' })
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiProperty({ example: 45.00 })
  @IsNumber({}, { message: 'O preço deve ser um número válido' })
  @Min(0, { message: 'O preço não pode ser negativo' })
  price: number;

  @ApiProperty({ example: 30, description: 'Duração em minutos' })
  @IsNumber({}, { message: 'A duração deve ser um número válido' })
  @Min(5, { message: 'A duração mínima é 5 minutos' })
  duration: number;

  @ApiProperty({ example: ['barber-id-1', 'barber-id-2'], required: false })
  @IsArray({ message: 'IDs dos barbeiros devem ser uma lista' })
  @IsOptional()
  barberIds?: string[];
}

export class UpdateServiceDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(5)
  duration?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  barberIds?: string[];
}
