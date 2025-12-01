import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export enum PaymentMethod {
  CASH = 'CASH',
  PIX = 'PIX',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
}

export class CreateTransactionDto {
  @ApiProperty({ enum: TransactionType, example: 'INCOME' })
  @IsEnum(TransactionType)
  @IsNotEmpty()
  type: TransactionType;

  @ApiProperty({ example: 'Serviço' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 150.00 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: 'Corte de cabelo - Cliente João' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'user-id-123' })
  @IsString()
  @IsNotEmpty()
  createdBy: string;

  @ApiProperty({ example: 'appointment-id-123', required: false })
  @IsString()
  @IsOptional()
  appointmentId?: string;

  @ApiProperty({ enum: PaymentMethod, required: false })
  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;
}

export class UpdateTransactionDto {
  @ApiProperty({ required: false, enum: TransactionType })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, enum: PaymentMethod })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;
}

export class TransactionFiltersDto {
  @ApiProperty({ required: false, enum: TransactionType })
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ required: false, example: '2024-02-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false, example: '2024-02-29' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
