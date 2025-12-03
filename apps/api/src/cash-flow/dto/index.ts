import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class OpenCashFlowDto {
  @ApiProperty({ example: 100.00, description: 'Saldo inicial do caixa' })
  @IsNumber({}, { message: 'O saldo inicial deve ser um número válido' })
  @Min(0, { message: 'O saldo inicial não pode ser negativo' })
  openingBalance: number;
}

export class CloseCashFlowDto {
  @ApiProperty({ example: 500.00, description: 'Total em dinheiro contado' })
  @IsNumber({}, { message: 'O total em dinheiro deve ser um número válido' })
  @Min(0, { message: 'O total em dinheiro não pode ser negativo' })
  countedCash: number;

  @ApiProperty({ example: 300.00, description: 'Total em Pix contado' })
  @IsNumber({}, { message: 'O total em Pix deve ser um número válido' })
  @Min(0, { message: 'O total em Pix não pode ser negativo' })
  countedPix: number;

  @ApiProperty({ example: 200.00, description: 'Total em cartão de débito contado' })
  @IsNumber({}, { message: 'O total em débito deve ser um número válido' })
  @Min(0, { message: 'O total em débito não pode ser negativo' })
  countedDebit: number;

  @ApiProperty({ example: 150.00, description: 'Total em cartão de crédito contado' })
  @IsNumber({}, { message: 'O total em crédito deve ser um número válido' })
  @Min(0, { message: 'O total em crédito não pode ser negativo' })
  countedCredit: number;

  @ApiProperty({
    example: 'Diferença de R$ 5,00 devido a troco dado errado. Cliente pagou em dinheiro mas sistema registrou Pix.',
    required: false,
    description: 'Observações sobre o fechamento do caixa'
  })
  @IsString({ message: 'As observações devem ser um texto válido' })
  @MaxLength(500, { message: 'As observações devem ter no máximo 500 caracteres' })
  @Transform(({ value }) => value?.trim())
  @IsOptional()
  observations?: string;
}

export class AddCashMovementDto {
  @ApiProperty({ example: 'INCOME' })
  @IsString()
  @IsNotEmpty()
  type: 'INCOME' | 'EXPENSE';

  @ApiProperty({ example: 50.00 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: 'Gorjeta do cliente' })
  @IsString({ message: 'A descrição deve ser um texto válido' })
  @MaxLength(500, { message: 'A descrição deve ter no máximo 500 caracteres' })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'A descrição é obrigatória' })
  description: string;

  @ApiProperty({ example: 'Categoria Outros' })
  @IsString({ message: 'A categoria deve ser um texto válido' })
  @MaxLength(100, { message: 'A categoria deve ter no máximo 100 caracteres' })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'A categoria é obrigatória' })
  category: string;
}
