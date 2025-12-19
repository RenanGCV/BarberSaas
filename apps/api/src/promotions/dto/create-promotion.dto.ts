import { ApiProperty } from '@nestjs/swagger';
import {
    IsArray,
    IsDateString,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    Max,
    Min
} from 'class-validator';

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  FREE_SERVICE = 'FREE_SERVICE',
}

export class CreatePromotionDto {
  @ApiProperty({ example: 'Black Friday - 30% OFF', description: 'Nome da promoção' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString({ message: 'Nome deve ser texto' })
  name: string;

  @ApiProperty({
    example: 'Desconto especial de Black Friday em todos os serviços',
    description: 'Descrição da promoção',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Descrição deve ser texto' })
  description?: string;

  @ApiProperty({
    enum: DiscountType,
    example: DiscountType.PERCENTAGE,
    description: 'Tipo de desconto',
  })
  @IsNotEmpty({ message: 'Tipo de desconto é obrigatório' })
  @IsEnum(DiscountType, { message: 'Tipo de desconto inválido' })
  discountType: DiscountType;

  @ApiProperty({
    example: 30,
    description: 'Valor do desconto (% ou R$)',
  })
  @IsNotEmpty({ message: 'Valor do desconto é obrigatório' })
  @IsNumber({}, { message: 'Valor do desconto deve ser número' })
  @Min(0, { message: 'Valor do desconto não pode ser negativo' })
  @Max(100, { message: 'Desconto percentual não pode exceder 100%' })
  discountValue: number;

  @ApiProperty({
    example: '2024-12-01T00:00:00Z',
    description: 'Data de início da promoção',
  })
  @IsNotEmpty({ message: 'Data de início é obrigatória' })
  @IsDateString({}, { message: 'Data de início inválida' })
  startDate: string;

  @ApiProperty({
    example: '2024-12-31T23:59:59Z',
    description: 'Data de término da promoção',
  })
  @IsNotEmpty({ message: 'Data de término é obrigatória' })
  @IsDateString({}, { message: 'Data de término inválida' })
  endDate: string;

  @ApiProperty({
    example: ['service-uuid-1', 'service-uuid-2'],
    description: 'IDs dos serviços incluídos na promoção (vazio = todos)',
    required: false,
  })
  @IsOptional()
  @IsArray({ message: 'Serviços deve ser um array' })
  @IsUUID('4', { each: true, message: 'IDs de serviços inválidos' })
  serviceIds?: string[];

  @ApiProperty({
    example: 100,
    description: 'Quantidade máxima de usos da promoção (opcional)',
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Quantidade máxima deve ser número' })
  @Min(1, { message: 'Quantidade máxima deve ser pelo menos 1' })
  maxUses?: number;

  @ApiProperty({
    example: true,
    description: 'Se a promoção está ativa',
    required: false,
    default: true,
  })
  @IsOptional()
  isActive?: boolean;
}
