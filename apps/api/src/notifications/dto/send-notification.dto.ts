import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class SendNotificationDto {
  @ApiProperty({ description: 'ID do usuário destinatário' })
  @IsNotEmpty({ message: 'O ID do usuário é obrigatório' })
  @IsUUID('4', { message: 'ID do usuário inválido' })
  userId: string;

  @ApiProperty({ description: 'Título da notificação' })
  @IsNotEmpty({ message: 'O título é obrigatório' })
  @IsString({ message: 'O título deve ser texto' })
  title: string;

  @ApiProperty({ description: 'Corpo da notificação' })
  @IsNotEmpty({ message: 'O corpo é obrigatório' })
  @IsString({ message: 'O corpo deve ser texto' })
  body: string;

  @ApiPropertyOptional({ description: 'Dados adicionais (JSON)' })
  @IsOptional()
  @IsObject({ message: 'Data deve ser um objeto' })
  data?: Record<string, any>;
}
