import {
    Body,
    Controller,
    Get,
    HttpCode,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../tenants/current-tenant.decorator';
import { CreatePixPaymentDto } from './dto';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('pix')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar pagamento Pix (gerar QR Code)' })
  @ApiResponse({
    status: 201,
    description: 'QR Code gerado com sucesso',
    schema: {
      example: {
        paymentId: 'pix_123abc',
        transactionId: 'uuid',
        status: 'PENDING',
        amount: 50.0,
        qrCode: 'base64_string',
        qrCodeText: 'pix_copy_paste_string',
        expiresAt: '2025-12-20T11:00:00Z',
        appointment: {
          id: 'uuid',
          service: 'Corte de Cabelo',
          barber: 'João Silva',
          scheduledAt: '2025-12-20T10:00:00Z',
        },
        message: 'QR Code gerado com sucesso. Pagamento expira em 30 minutos.',
      },
    },
  })
  async createPixPayment(
    @Body() dto: CreatePixPaymentDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.paymentsService.createPixPayment(dto, tenantId);
  }

  @Get(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar status de um pagamento' })
  @ApiResponse({
    status: 200,
    description: 'Status do pagamento retornado',
  })
  async getPaymentStatus(
    @Param('id') paymentId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.paymentsService.getPaymentStatus(paymentId, tenantId);
  }

  @Post('webhook')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Webhook para confirmação de pagamento (chamado pelo gateway)',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processado com sucesso',
  })
  async processWebhook(@Body() payload: any) {
    return this.paymentsService.processWebhook(payload);
  }

  @Post(':id/confirm')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Confirmar pagamento manualmente (apenas para testes)',
  })
  @ApiResponse({
    status: 200,
    description: 'Pagamento confirmado com sucesso',
  })
  async confirmPayment(
    @Param('id') transactionId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.paymentsService.confirmPayment(transactionId, tenantId);
  }
}
