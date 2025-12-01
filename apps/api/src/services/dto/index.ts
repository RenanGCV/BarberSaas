import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({ example: 'Corte Tradicional' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Corte masculino tradicional com máquina e tesoura' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 45.00 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 30, description: 'Duração em minutos' })
  @IsNumber()
  @Min(5)
  duration: number;

  @ApiProperty({ example: ['barber-id-1', 'barber-id-2'], required: false })
  @IsArray()
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
