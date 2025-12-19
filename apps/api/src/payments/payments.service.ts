import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePixPaymentDto } from './dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Criar pagamento Pix (Mock - substituir por integração real)
   * 
   * Para integração real com Mercado Pago:
   * 1. npm install mercadopago
   * 2. Configurar credenciais no .env
   * 3. Substituir lógica mock pela SDK do Mercado Pago
   */
  async createPixPayment(dto: CreatePixPaymentDto, tenantId: string) {
    const { appointmentId, amount, payerEmail, payerName, payerDocument } = dto;

    // Validar agendamento
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        tenantId,
      },
      include: {
        service: true,
        barber: {
          include: {
            user: { select: { name: true } },
          },
        },
        customer: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    // Validar status do agendamento
    if (appointment.status === 'CANCELLED') {
      throw new BadRequestException(
        'Não é possível pagar um agendamento cancelado',
      );
    }

    if (appointment.status === 'COMPLETED') {
      throw new BadRequestException('Este agendamento já foi concluído');
    }

    // Validar valor
    if (amount !== appointment.service.price) {
      throw new BadRequestException(
        `O valor deve ser R$ ${appointment.service.price.toFixed(2)}`,
      );
    }

    // ============================================
    // MOCK: Simulação de integração com Pix
    // ============================================
    // Em produção, substituir por SDK do Mercado Pago, Stripe, etc.
    
    const paymentId = `pix_${randomUUID()}`;
    
    // Simulação de QR Code (Base64)
    const qrCodeBase64 = this.generateMockQRCode(paymentId, amount);
    
    // Simulação de Pix Copia e Cola
    const qrCodeText = this.generatePixCopyPaste(
      amount,
      payerName || appointment.customer?.user.name || 'Cliente',
      paymentId,
    );

    // Salvar transação como PENDING
    const transaction = await this.prisma.transaction.create({
      data: {
        tenantId,
        appointmentId,
        type: 'INCOME',
        amount,
        category: 'Serviço',
        paymentMethod: 'PIX',
        paymentStatus: 'PENDING',
        description: `Pagamento Pix - ${appointment.service.name}`,
        userId: appointment.customer?.userId || null,
      },
    });

    this.logger.log(`Pagamento Pix criado: ${paymentId} - R$ ${amount}`);

    return {
      paymentId,
      transactionId: transaction.id,
      status: 'PENDING',
      amount,
      qrCode: qrCodeBase64,
      qrCodeText,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos
      appointment: {
        id: appointment.id,
        service: appointment.service.name,
        barber: appointment.barber.user.name,
        scheduledAt: appointment.scheduledAt,
      },
      message: 'QR Code gerado com sucesso. Pagamento expira em 30 minutos.',
    };
  }

  /**
   * Consultar status de um pagamento
   */
  async getPaymentStatus(paymentId: string, tenantId: string) {
    // Em produção: consultar API do gateway de pagamento
    
    // Mock: buscar transaction no banco
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        tenantId,
        description: {
          contains: paymentId,
        },
      },
      include: {
        appointment: {
          include: {
            service: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    return {
      paymentId,
      status: transaction.paymentStatus,
      amount: transaction.amount,
      paidAt: transaction.paymentStatus === 'PAID' ? transaction.createdAt : null,
      appointment: transaction.appointment
        ? {
            id: transaction.appointment.id,
            service: transaction.appointment.service.name,
            scheduledAt: transaction.appointment.scheduledAt,
          }
        : null,
    };
  }

  /**
   * Processar webhook de confirmação de pagamento
   * 
   * Este endpoint deve ser chamado pelo gateway de pagamento quando o status mudar
   */
  async processWebhook(payload: any) {
    this.logger.log('Webhook recebido', JSON.stringify(payload));

    // ============================================
    // MOCK: Processamento de webhook
    // ============================================
    // Em produção: validar assinatura do webhook, processar dados reais
    
    const { paymentId, status } = payload;

    if (!paymentId) {
      throw new BadRequestException('paymentId é obrigatório no webhook');
    }

    // Buscar transaction
    const transaction = await this.prisma.transaction.findFirst({
      where: {
        description: {
          contains: paymentId,
        },
      },
      include: {
        appointment: true,
      },
    });

    if (!transaction) {
      this.logger.warn(`Transaction não encontrada para paymentId: ${paymentId}`);
      return { message: 'Transaction não encontrada' };
    }

    // Atualizar status da transação
    if (status === 'approved' || status === 'PAID') {
      await this.confirmPayment(transaction.id, transaction.tenantId);
      return { message: 'Pagamento confirmado com sucesso' };
    }

    if (status === 'rejected' || status === 'FAILED') {
      await this.prisma.transaction.update({
        where: { id: transaction.id },
        data: { paymentStatus: 'FAILED' },
      });
      
      this.logger.warn(`Pagamento falhou: ${paymentId}`);
      return { message: 'Pagamento falhou' };
    }

    return { message: 'Webhook processado' };
  }

  /**
   * Confirmar pagamento manualmente (para testes)
   */
  async confirmPayment(transactionId: string, tenantId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id: transactionId, tenantId },
      include: { appointment: true },
    });

    if (!transaction) {
      throw new NotFoundException('Transação não encontrada');
    }

    if (transaction.paymentStatus === 'PAID') {
      throw new BadRequestException('Pagamento já foi confirmado');
    }

    // Atualizar transação
    await this.prisma.transaction.update({
      where: { id: transactionId },
      data: { paymentStatus: 'PAID' },
    });

    // Atualizar status do agendamento
    if (transaction.appointmentId) {
      await this.prisma.appointment.update({
        where: { id: transaction.appointmentId },
        data: { status: 'CONFIRMED' },
      });

      this.logger.log(`Agendamento ${transaction.appointmentId} confirmado via pagamento`);
    }

    this.logger.log(`Pagamento confirmado: Transaction ${transactionId}`);

    return {
      message: 'Pagamento confirmado com sucesso',
      transactionId,
      appointmentId: transaction.appointmentId,
      status: 'PAID',
    };
  }

  /**
   * Gerar QR Code mock (Base64)
   * Em produção: usar biblioteca qrcode ou API do gateway
   */
  private generateMockQRCode(paymentId: string, amount: number): string {
    // Mock: SVG simples como Base64
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="white"/>
        <rect x="20" y="20" width="160" height="160" fill="black"/>
        <rect x="30" y="30" width="140" height="140" fill="white"/>
        <text x="100" y="95" text-anchor="middle" font-size="12" fill="black">MOCK QR CODE</text>
        <text x="100" y="110" text-anchor="middle" font-size="10" fill="black">R$ ${amount.toFixed(2)}</text>
        <text x="100" y="125" text-anchor="middle" font-size="8" fill="gray">${paymentId.substring(0, 12)}...</text>
      </svg>
    `.trim();
    
    return Buffer.from(svg).toString('base64');
  }

  /**
   * Gerar Pix Copia e Cola mock
   * Em produção: retornado pela API do gateway
   */
  private generatePixCopyPaste(amount: number, payerName: string, paymentId: string): string {
    // Mock: formato simplificado
    const timestamp = Date.now();
    return `00020126360014BR.GOV.BCB.PIX0114+5511999999999520400005303986540${amount.toFixed(2)}5802BR5925${payerName}6009SAO PAULO62070503***${paymentId.substring(0, 8)}6304${timestamp}`;
  }
}
