import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class OpenCashFlowDto {
  @ApiProperty({ example: 100.00, description: 'Saldo inicial do caixa' })
  @IsNumber()
  @Min(0)
  openingBalance: number;
}

export class CloseCashFlowDto {
  // Sem campos adicionais - apenas fecha o caixa
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
