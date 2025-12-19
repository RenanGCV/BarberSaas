import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class BlockScheduleDto {
  @ApiProperty({ description: 'ID do barbeiro' })
  @IsNotEmpty({ message: 'O ID do barbeiro é obrigatório' })
  @IsUUID('4', { message: 'ID do barbeiro inválido' })
  barberId: string;

  @ApiProperty({ description: 'Data e hora de início do bloqueio' })
  @IsNotEmpty({ message: 'A data e hora de início são obrigatórias' })
  @IsDateString({}, { message: 'Data e hora de início inválidas' })
  startTime: string;

  @ApiProperty({ description: 'Data e hora de fim do bloqueio' })
  @IsNotEmpty({ message: 'A data e hora de fim são obrigatórias' })
  @IsDateString({}, { message: 'Data e hora de fim inválidas' })
  endTime: string;

  @ApiPropertyOptional({ description: 'Motivo do bloqueio' })
  @IsOptional()
  @IsString({ message: 'O motivo deve ser um texto' })
  reason?: string;
}
