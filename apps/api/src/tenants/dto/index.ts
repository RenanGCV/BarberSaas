import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateTenantDto {
  @ApiProperty({ example: 'Barbearia Premium' })
  @IsString({ message: 'O nome da barbearia deve ser um texto válido' })
  @IsNotEmpty({ message: 'O nome da barbearia é obrigatório' })
  @MaxLength(100, { message: 'O nome deve ter no máximo 100 caracteres' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({ example: '(11) 98765-4321' })
  @IsString({ message: 'O telefone deve ser um texto válido' })
  @IsNotEmpty({ message: 'O telefone é obrigatório' })
  @Matches(/^\(?\d{2}\)?\s?9?\d{4}-?\d{4}$/, {
    message: 'Telefone inválido. Use o formato: (11) 98765-4321 ou 11987654321'
  })
  phone: string;

  @ApiProperty({ example: 'Rua das Flores, 123' })
  @IsString({ message: 'O endereço deve ser um texto válido' })
  @IsNotEmpty({ message: 'O endereço é obrigatório' })
  address: string;

  @ApiProperty({ example: 'São Paulo' })
  @IsString({ message: 'A cidade deve ser um texto válido' })
  @IsNotEmpty({ message: 'A cidade é obrigatória' })
  city: string;

  @ApiProperty({ example: 'SP' })
  @IsString({ message: 'O estado deve ser um texto válido' })
  @IsNotEmpty({ message: 'O estado é obrigatório' })
  state: string;

  @ApiProperty({ example: '01234-567' })
  @IsString({ message: 'O CEP deve ser um texto válido' })
  @IsNotEmpty({ message: 'O CEP é obrigatório' })
  @Matches(/^\d{5}-?\d{3}$/, { message: 'CEP inválido. Use o formato: 01234-567' })
  zipCode: string;

  @ApiProperty({ example: -23.5505, required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ example: -46.6333, required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({ example: '09:00' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Formato de hora inválido. Use HH:MM' })
  openTime: string;

  @ApiProperty({ example: '20:00' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Formato de hora inválido. Use HH:MM' })
  closeTime: string;
}

export class UpdateTenantDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Formato de hora inválido. Use HH:MM' })
  openTime?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, { message: 'Formato de hora inválido. Use HH:MM' })
  closeTime?: string;
}

export class SearchNearbyDto {
  @ApiProperty({ example: -23.5505 })
  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @ApiProperty({ example: -46.6333 })
  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @ApiProperty({ example: 10, required: false, description: 'Raio em km' })
  @IsOptional()
  @IsNumber()
  radius?: number;
}
