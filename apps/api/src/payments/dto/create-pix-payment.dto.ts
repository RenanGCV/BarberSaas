import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';

export class CreatePixPaymentDto {
  @ApiProperty({ description: 'ID do agendamento' })
  @IsNotEmpty({ message: 'O ID do agendamento é obrigatório' })
  @IsUUID('4', { message: 'ID do agendamento inválido' })
  appointmentId: string;

  @ApiProperty({ description: 'Valor do pagamento em reais', example: 50.00 })
  @IsNotEmpty({ message: 'O valor é obrigatório' })
  @IsNumber({}, { message: 'O valor deve ser um número' })
  @IsPositive({ message: 'O valor deve ser positivo' })
  amount: number;

  @ApiPropertyOptional({ description: 'Email do pagador' })
  @IsOptional()
  @IsString({ message: 'Email deve ser texto' })
  payerEmail?: string;

  @ApiPropertyOptional({ description: 'Nome do pagador' })
  @IsOptional()
  @IsString({ message: 'Nome deve ser texto' })
  payerName?: string;

  @ApiPropertyOptional({ description: 'CPF do pagador' })
  @IsOptional()
  @IsString({ message: 'CPF deve ser texto' })
  payerDocument?: string;
}
