import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class BroadcastNotificationDto {
  @ApiProperty({ description: 'IDs dos usuários destinatários', type: [String] })
  @IsNotEmpty({ message: 'A lista de usuários é obrigatória' })
  @IsArray({ message: 'userIds deve ser um array' })
  @IsString({ each: true, message: 'Cada ID deve ser texto' })
  userIds: string[];

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
