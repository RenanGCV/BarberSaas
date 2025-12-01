import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Matches } from 'class-validator';

export class CreateTenantDto {
  @ApiProperty({ example: 'Barbearia Premium' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '(11) 98765-4321' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'Rua das Flores, 123' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'São Paulo' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'SP' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: '01234-567' })
  @IsString()
  @IsNotEmpty()
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
