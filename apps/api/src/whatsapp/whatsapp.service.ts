import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private readonly apiUrl: string;
  private readonly apiToken: string;
  private readonly enabled: boolean;

  constructor(private configService: ConfigService) {
    // Configurações para WhatsApp Business API
    // Pode usar serviços como: Twilio, MessageBird, 360Dialog, etc.
    this.apiUrl = this.configService.get<string>('WHATSAPP_API_URL', '');
    this.apiToken = this.configService.get<string>('WHATSAPP_API_TOKEN', '');
    this.enabled = this.configService.get<boolean>('WHATSAPP_ENABLED', false);
  }

  /**
   * Envia mensagem de confirmação de agendamento para o barbeiro
   */
  async sendAppointmentConfirmationToBarbershop(data: {
    barberPhone: string;
    barbershopName: string;
    guestName: string;
    guestPhone: string;
    serviceName: string;
    scheduledAt: Date;
    appointmentId: string;
  }): Promise<void> {
    if (!this.enabled) {
      this.logger.warn('WhatsApp está desabilitado. Mensagem não enviada.');
      return;
    }

    const message = this.formatAppointmentMessage(data);
    await this.sendMessage(data.barberPhone, message);
  }

  /**
   * Envia confirmação para o cliente
   */
  async sendAppointmentConfirmationToGuest(data: {
    guestPhone: string;
    guestName: string;
    barbershopName: string;
    serviceName: string;
    scheduledAt: Date;
  }): Promise<void> {
    if (!this.enabled) {
      this.logger.warn('WhatsApp está desabilitado. Mensagem não enviada.');
      return;
    }

    const message = this.formatGuestConfirmationMessage(data);
    await this.sendMessage(data.guestPhone, message);
  }

  /**
   * Formata mensagem de agendamento para a barbearia
   */
  private formatAppointmentMessage(data: {
    barbershopName: string;
    guestName: string;
    guestPhone: string;
    serviceName: string;
    scheduledAt: Date;
    appointmentId: string;
  }): string {
    const dateFormatted = new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(data.scheduledAt);

    return `
🔔 *NOVO AGENDAMENTO - ${data.barbershopName}*

👤 *Cliente:* ${data.guestName}
📱 *Telefone:* ${data.guestPhone}
✂️ *Serviço:* ${data.serviceName}
📅 *Data/Hora:* ${dateFormatted}

🆔 ID: ${data.appointmentId}

_Cliente agendou sem cadastro. Entre em contato para confirmar._
    `.trim();
  }

  /**
   * Formata mensagem de confirmação para o cliente
   */
  private formatGuestConfirmationMessage(data: {
    guestName: string;
    barbershopName: string;
    serviceName: string;
    scheduledAt: Date;
  }): string {
    const dateFormatted = new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(data.scheduledAt);

    return `
✅ *Agendamento Realizado!*

Olá ${data.guestName}! 👋

Seu agendamento em *${data.barbershopName}* foi registrado:

✂️ *Serviço:* ${data.serviceName}
📅 *Data/Hora:* ${dateFormatted}

A barbearia entrará em contato para confirmar seu horário.

Obrigado! 💈
    `.trim();
  }

  /**
   * Envia mensagem via API do WhatsApp
   */
  private async sendMessage(phone: string, message: string): Promise<void> {
    try {
      // Formatar telefone (remover caracteres especiais)
      const cleanPhone = this.cleanPhoneNumber(phone);

      this.logger.log(`Enviando mensagem WhatsApp para ${cleanPhone}`);

      if (!this.apiUrl || !this.apiToken) {
        this.logger.warn(
          'WhatsApp API não configurada. Mensagem simulada:',
          { phone: cleanPhone, message },
        );
        return;
      }

      // Exemplo de integração com WhatsApp Business API
      // Adapte conforme o provedor escolhido (Twilio, 360Dialog, etc.)
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiToken}`,
        },
        body: JSON.stringify({
          to: cleanPhone,
          type: 'text',
          text: {
            body: message,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`WhatsApp API error: ${response.statusText}`);
      }

      this.logger.log(`Mensagem enviada com sucesso para ${cleanPhone}`);
    } catch (error) {
      this.logger.error('Erro ao enviar mensagem WhatsApp:', error);
      // Não lançar erro para não bloquear o agendamento
    }
  }

  /**
   * Limpa número de telefone (mantém apenas dígitos)
   */
  private cleanPhoneNumber(phone: string): string {
    // Remove tudo exceto números
    let cleaned = phone.replace(/\D/g, '');

    // Adiciona código do país se não tiver (Brasil +55)
    if (!cleaned.startsWith('55')) {
      cleaned = '55' + cleaned;
    }

    return cleaned;
  }

  /**
   * Valida formato de telefone brasileiro
   */
  validateBrazilianPhone(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '');
    
    // Formato: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
    // Com código país: 55 XX XXXXX-XXXX
    return /^(?:55)?[1-9]{2}9?\d{8}$/.test(cleaned);
  }
}
