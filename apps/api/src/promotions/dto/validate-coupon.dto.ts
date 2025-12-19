import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ValidateCouponDto {
  @ApiProperty({
    example: 'BLACKFRIDAY30',
    description: 'Código do cupom',
  })
  @IsNotEmpty({ message: 'Código do cupom é obrigatório' })
  @IsString({ message: 'Código deve ser texto' })
  code: string;

  @ApiProperty({
    example: 'service-uuid',
    description: 'ID do serviço (para validar se cupom é válido para o serviço)',
    required: false,
  })
  serviceId?: string;
}
