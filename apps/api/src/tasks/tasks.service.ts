import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Enviar lembretes de agendamentos (a cada 10 minutos)
   * Notifica clientes 1h antes do agendamento
   */
  @Cron('*/10 * * * *')
  async handleAppointmentReminders() {
    this.logger.log('Executando cron: Lembretes de agendamentos');
    
    try {
      const result = await this.notificationsService.sendAppointmentReminders();
      this.logger.log(`Lembretes enviados: ${result.remindersSent}`);
    } catch (error) {
      this.logger.error('Erro ao enviar lembretes:', error);
    }
  }

  /**
   * Limpar tokens expirados de push notifications (diariamente às 3h)
   */
  @Cron('0 3 * * *')
  async cleanExpiredTokens() {
    this.logger.log('Executando cron: Limpeza de tokens expirados');
    
    // TODO: Implementar limpeza de tokens inativos há mais de 90 dias
    // await this.prisma.pushToken.deleteMany({
    //   where: {
    //     updatedAt: {
    //       lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    //     },
    //     isActive: false
    //   }
    // });
  }

  /**
   * Marcar agendamentos como NO_SHOW (a cada hora)
   * Agendamentos não comparecidos após 30 min do horário
   */
  @Cron(CronExpression.EVERY_HOUR)
  async markNoShowAppointments() {
    this.logger.log('Executando cron: Marcar NO_SHOW');
    
    // TODO: Implementar lógica para marcar NO_SHOW
    // const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
    // await this.prisma.appointment.updateMany({
    //   where: {
    //     status: 'CONFIRMED',
    //     scheduledAt: { lt: thirtyMinsAgo }
    //   },
    //   data: { status: 'NO_SHOW' }
    // });
  }

  /**
   * Desativar promoções expiradas (diariamente à meia-noite)
   */
  @Cron('0 0 * * *')
  async deactivateExpiredPromotions() {
    this.logger.log('Executando cron: Desativar promoções expiradas');
    
    // TODO: Implementar desativação de promoções
    // await this.prisma.promotion.updateMany({
    //   where: {
    //     endDate: { lt: new Date() },
    //     isActive: true
    //   },
    //   data: { isActive: false }
    // });
  }

  /**
   * Fechar caixas abertos há mais de 24h (diariamente às 2h)
   */
  @Cron('0 2 * * *')
  async closeOldCashFlows() {
    this.logger.log('Executando cron: Fechar caixas antigos');
    
    // TODO: Implementar fechamento automático de caixa
    // const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    // const openCashFlows = await this.prisma.cashFlow.findMany({
    //   where: {
    //     status: 'OPEN',
    //     openedAt: { lt: yesterday }
    //   }
    // });
    
    // for (const cashFlow of openCashFlows) {
    //   await this.cashFlowService.close(cashFlow.id);
    // }
  }
}
