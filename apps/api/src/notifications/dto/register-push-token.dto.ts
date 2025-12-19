import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterPushTokenDto {
  @ApiProperty({ description: 'Token do dispositivo (Firebase FCM)' })
  @IsNotEmpty({ message: 'O token é obrigatório' })
  @IsString({ message: 'O token deve ser texto' })
  token: string;

  @ApiProperty({ description: 'Plataforma (android, ios, web)' })
  @IsNotEmpty({ message: 'A plataforma é obrigatória' })
  @IsString({ message: 'A plataforma deve ser texto' })
  platform: string;
}
