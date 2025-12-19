import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCouponDto {
  @ApiProperty({
    example: 'BLACKFRIDAY30',
    description: 'Código do cupom (maiúsculas)',
  })
  @IsNotEmpty({ message: 'Código do cupom é obrigatório' })
  @IsString({ message: 'Código deve ser texto' })
  @MinLength(4, { message: 'Código deve ter pelo menos 4 caracteres' })
  @MaxLength(20, { message: 'Código não pode exceder 20 caracteres' })
  code: string;

  @ApiProperty({
    example: 'promotion-uuid',
    description: 'ID da promoção vinculada',
  })
  @IsNotEmpty({ message: 'ID da promoção é obrigatório' })
  @IsString({ message: 'ID da promoção inválido' })
  promotionId: string;
}
