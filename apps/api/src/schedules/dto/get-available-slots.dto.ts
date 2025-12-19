import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';

export class GetAvailableSlotsDto {
  @ApiProperty({ description: 'ID do barbeiro' })
  @IsNotEmpty({ message: 'O ID do barbeiro é obrigatório' })
  @IsUUID('4', { message: 'ID do barbeiro inválido' })
  barberId: string;

  @ApiProperty({ description: 'ID do serviço' })
  @IsNotEmpty({ message: 'O ID do serviço é obrigatório' })
  @IsUUID('4', { message: 'ID do serviço inválido' })
  serviceId: string;

  @ApiProperty({ description: 'Data para buscar slots disponíveis (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'A data é obrigatória' })
  @IsDateString({}, { message: 'Data inválida. Use o formato YYYY-MM-DD' })
  date: string;
}
