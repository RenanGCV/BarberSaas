import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class OpenCashFlowDto {
  @ApiProperty({ example: 100.00, description: 'Saldo inicial do caixa' })
  @IsNumber()
  @Min(0)
  openingBalance: number;
}

export class CloseCashFlowDto {
  @ApiProperty({ example: 500.00, description: 'Total em dinheiro contado' })
  @IsNumber()
  @Min(0)
  countedCash: number;

  @ApiProperty({ example: 300.00, description: 'Total em Pix contado' })
  @IsNumber()
  @Min(0)
  countedPix: number;

  @ApiProperty({ example: 200.00, description: 'Total em cartão de débito contado' })
  @IsNumber()
  @Min(0)
  countedDebit: number;

  @ApiProperty({ example: 150.00, description: 'Total em cartão de crédito contado' })
  @IsNumber()
  @Min(0)
  countedCredit: number;

  @ApiProperty({
    example: 'Diferença de R$ 5,00 devido a troco dado errado. Cliente pagou em dinheiro mas sistema registrou Pix.',
    required: false,
    description: 'Observações sobre o fechamento do caixa'
  })
  @IsString()
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
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'Categoria Outros' })
  @IsString()
  @IsNotEmpty()
  category: string;
}
