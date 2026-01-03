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
   * Criar pagamento Pix (Mock)
   */
  async createPixPayment(dto: CreatePixPaymentDto, tenantId: string) {
    const { appointmentId, amount, payerEmail, payerName, payerDocument } = dto;

    // Validar agendamento com include correto
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

    // Gerar IDs de pagamento mock
    const paymentId = `pix_${randomUUID()}`;
    
    // Simulação de QR Code (Base64)
    const qrCodeBase64 = this.generateMockQRCode(paymentId, amount);
    
    // Simulação de Pix Copia e Cola
    const qrCodeText = this.generatePixCopyPaste(
      amount,
      payerName || 'Cliente',
      paymentId,
    );

    // Salvar transação
    const transaction = await this.prisma.transaction.create({
      data: {
        tenantId,
        appointmentId,
        type: 'INCOME',
        amount,
        category: 'Serviço',
        paymentMethod: 'PIX',
        description: `Pagamento Pix [${paymentId}] - ${appointment.service.name}`,
        createdBy: appointment.customerId || appointment.barberId,
      },
    });

    // Criar registro de Payment
    await this.prisma.payment.create({
      data: {
        appointmentId,
        amount,
        method: 'PIX',
        status: 'PENDING',
        pixKey: paymentId,
        pixQrCode: qrCodeBase64,
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
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
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
    // Buscar payment no banco
    const payment = await this.prisma.payment.findFirst({
      where: {
        pixKey: paymentId,
      },
      include: {
        appointment: {
          include: {
            service: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    return {
      paymentId,
      status: payment.status,
      amount: payment.amount,
      paidAt: payment.paidAt,
      appointment: payment.appointment
        ? {
            id: payment.appointment.id,
            service: payment.appointment.service.name,
            scheduledAt: payment.appointment.scheduledAt,
          }
        : null,
    };
  }

  /**
   * Processar webhook de confirmação de pagamento
   */
  async processWebhook(payload: any) {
    this.logger.log('Webhook recebido', JSON.stringify(payload));

    const { paymentId, status } = payload;

    if (!paymentId) {
      throw new BadRequestException('paymentId é obrigatório no webhook');
    }

    // Buscar payment
    const payment = await this.prisma.payment.findFirst({
      where: {
        pixKey: paymentId,
      },
      include: {
        appointment: true,
      },
    });

    if (!payment) {
      this.logger.warn(`Payment não encontrado para paymentId: ${paymentId}`);
      return { message: 'Payment não encontrado' };
    }

    // Atualizar status do pagamento
    if (status === 'approved' || status === 'PAID') {
      await this.confirmPayment(payment.id, payment.appointment?.tenantId || '');
      return { message: 'Pagamento confirmado com sucesso' };
    }

    if (status === 'rejected' || status === 'FAILED') {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      });
      
      this.logger.warn(`Pagamento falhou: ${paymentId}`);
      return { message: 'Pagamento falhou' };
    }

    return { message: 'Webhook processado' };
  }

  /**
   * Confirmar pagamento manualmente
   */
  async confirmPayment(paymentId: string, tenantId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId },
      include: { appointment: true },
    });

    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    if (payment.status === 'PAID') {
      throw new BadRequestException('Pagamento já foi confirmado');
    }

    // Atualizar payment
    await this.prisma.payment.update({
      where: { id: paymentId },
      data: { 
        status: 'PAID',
        paidAt: new Date(),
      },
    });

    // Atualizar status do agendamento
    if (payment.appointmentId) {
      await this.prisma.appointment.update({
        where: { id: payment.appointmentId },
        data: { status: 'CONFIRMED' },
      });

      this.logger.log(`Agendamento ${payment.appointmentId} confirmado via pagamento`);
    }

    this.logger.log(`Pagamento confirmado: ${paymentId}`);

    return {
      message: 'Pagamento confirmado com sucesso',
      paymentId,
      appointmentId: payment.appointmentId,
      status: 'PAID',
    };
  }

  /**
   * Gerar QR Code mock (Base64)
   */
  private generateMockQRCode(paymentId: string, amount: number): string {
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
   */
  private generatePixCopyPaste(amount: number, payerName: string, paymentId: string): string {
    const timestamp = Date.now();
    return `00020126360014BR.GOV.BCB.PIX0114+5511999999999520400005303986540${amount.toFixed(2)}5802BR5925${payerName}6009SAO PAULO62070503***${paymentId.substring(0, 8)}6304${timestamp}`;
  }
}
