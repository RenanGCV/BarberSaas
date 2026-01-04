import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

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
  @IsEnum(TransactionType, { message: 'Tipo inválido. Use INCOME ou EXPENSE' })
  @IsNotEmpty({ message: 'O tipo da transação é obrigatório' })
  type: TransactionType;

  @ApiProperty({ example: 'Serviço' })
  @IsString({ message: 'A categoria deve ser um texto válido' })
  @MaxLength(100, { message: 'A categoria deve ter no máximo 100 caracteres' })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'A categoria é obrigatória' })
  category: string;

  @ApiProperty({ example: 150.00 })
  @IsNumber({}, { message: 'O valor deve ser um número válido' })
  @Min(0, { message: 'O valor não pode ser negativo' })
  amount: number;

  @ApiProperty({ example: 'Corte de cabelo - Cliente João', required: false })
  @IsString({ message: 'A descrição deve ser um texto válido' })
  @MaxLength(500, { message: 'A descrição deve ter no máximo 500 caracteres' })
  @Transform(({ value }) => value?.trim())
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'user-id-123', required: false, description: 'Preenchido automaticamente com o usuário logado' })
  @IsString({ message: 'O ID do criador deve ser um texto válido' })
  @IsOptional()
  createdBy?: string;

  @ApiProperty({ example: 'appointment-id-123', required: false })
  @IsString({ message: 'O ID do agendamento deve ser um texto válido' })
  @IsOptional()
  appointmentId?: string;

  @ApiProperty({ enum: PaymentMethod, required: false })
  @IsEnum(PaymentMethod, { message: 'Método de pagamento inválido. Use: CASH, PIX, CREDIT_CARD ou DEBIT_CARD' })
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
  @IsString({ message: 'A categoria deve ser um texto válido' })
  @MaxLength(100, { message: 'A categoria deve ter no máximo 100 caracteres' })
  @Transform(({ value }) => value?.trim())
  category?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber({}, { message: 'O valor deve ser um número válido' })
  @Min(0, { message: 'O valor não pode ser negativo' })
  amount?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'A descrição deve ser um texto válido' })
  @MaxLength(500, { message: 'A descrição deve ter no máximo 500 caracteres' })
  @Transform(({ value }) => value?.trim())
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
