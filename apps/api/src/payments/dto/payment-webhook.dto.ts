import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class PaymentWebhookDto {
  @ApiProperty({ description: 'Tipo de ação do webhook' })
  @IsNotEmpty()
  @IsString()
  action: string;

  @ApiProperty({ description: 'ID do pagamento' })
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({ description: 'Dados do pagamento' })
  @IsObject()
  data: any;
}
