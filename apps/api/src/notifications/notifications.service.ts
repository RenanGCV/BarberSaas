import {
    Injectable,
    Logger,
    NotFoundException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BroadcastNotificationDto, RegisterPushTokenDto, SendNotificationDto } from './dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Enviar notificação para um usuário
   * 
   * MOCK - Para integração real com Firebase:
   * 1. npm install firebase-admin
   * 2. Configurar credenciais no .env
   * 3. Inicializar Firebase Admin SDK
   * 4. Substituir lógica mock pela SDK do Firebase
   */
  async sendNotification(dto: SendNotificationDto, tenantId: string) {
    const { userId, title, body, data } = dto;

    // Validar usuário
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId, isActive: true },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Buscar tokens do usuário
    const pushTokens = await this.prisma.pushToken.findMany({
      where: { userId, isActive: true },
    });

    if (pushTokens.length === 0) {
      this.logger.warn(`Usuário ${userId} não possui tokens de push`);
      return {
        sent: false,
        message: 'Usuário não possui dispositivos registrados',
        userId,
      };
    }

    // ============================================
    // MOCK: Simulação de envio via Firebase FCM
    // ============================================
    // Em produção, usar Firebase Admin SDK:
    /*
    import * as admin from 'firebase-admin';
    
    const tokens = pushTokens.map(pt => pt.token);
    
    const message = {
      notification: { title, body },
      data: data || {},
      tokens,
    };
    
    const response = await admin.messaging().sendMulticast(message);
    */

    // Mock: simular envio bem-sucedido
    const mockResponse = {
      successCount: pushTokens.length,
      failureCount: 0,
      tokens: pushTokens.map(pt => pt.token),
    };

    this.logger.log(
      `[MOCK] Notificação enviada para ${user.name}: "${title}"`,
    );

    // Salvar histórico de notificação (opcional)
    // Poderia criar um modelo Notification para rastrear

    return {
      sent: true,
      successCount: mockResponse.successCount,
      failureCount: mockResponse.failureCount,
      userId,
      userName: user.name,
      title,
      body,
      devicesNotified: pushTokens.length,
    };
  }

  /**
   * Enviar notificação para múltiplos usuários
   */
  async broadcastNotification(dto: BroadcastNotificationDto, tenantId: string) {
    const { userIds, title, body, data } = dto;

    // Validar usuários
    const users = await this.prisma.user.findMany({
      where: {
        id: { in: userIds },
        tenantId,
        isActive: true,
      },
      include: {
        pushTokens: {
          where: { isActive: true },
        },
      },
    });

    if (users.length === 0) {
      throw new NotFoundException('Nenhum usuário encontrado');
    }

    const allTokens = users.flatMap(u => u.pushTokens.map(pt => pt.token));

    if (allTokens.length === 0) {
      return {
        sent: false,
        message: 'Nenhum dispositivo registrado encontrado',
        usersFound: users.length,
      };
    }

    // ============================================
    // MOCK: Broadcast via Firebase FCM
    // ============================================
    // Em produção:
    /*
    const message = {
      notification: { title, body },
      data: data || {},
      tokens: allTokens,
    };
    
    const response = await admin.messaging().sendMulticast(message);
    */

    this.logger.log(
      `[MOCK] Broadcast enviado para ${users.length} usuários: "${title}"`,
    );

    return {
      sent: true,
      usersNotified: users.length,
      devicesNotified: allTokens.length,
      successCount: allTokens.length,
      failureCount: 0,
      title,
      body,
    };
  }

  /**
   * Registrar token de push de um dispositivo
   */
  async registerPushToken(
    dto: RegisterPushTokenDto,
    userId: string,
    tenantId: string,
  ) {
    const { token, platform } = dto;

    // Validar usuário
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId, isActive: true },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verificar se token já existe
    const existing = await this.prisma.pushToken.findFirst({
      where: { userId, token },
    });

    if (existing) {
      // Atualizar se inativo
      if (!existing.isActive) {
        await this.prisma.pushToken.update({
          where: { id: existing.id },
          data: { isActive: true, platform },
        });

        return {
          message: 'Token reativado com sucesso',
          tokenId: existing.id,
        };
      }

      return {
        message: 'Token já registrado',
        tokenId: existing.id,
      };
    }

    // Criar novo token
    const pushToken = await this.prisma.pushToken.create({
      data: {
        userId,
        token,
        platform,
      },
    });

    this.logger.log(`Push token registrado para usuário ${user.name}`);

    return {
      message: 'Token registrado com sucesso',
      tokenId: pushToken.id,
      platform: pushToken.platform,
    };
  }

  /**
   * Remover token de push (logout do dispositivo)
   */
  async removePushToken(token: string, userId: string) {
    const pushToken = await this.prisma.pushToken.findFirst({
      where: { userId, token },
    });

    if (!pushToken) {
      throw new NotFoundException('Token não encontrado');
    }

    await this.prisma.pushToken.update({
      where: { id: pushToken.id },
      data: { isActive: false },
    });

    return {
      message: 'Token removido com sucesso',
      tokenId: pushToken.id,
    };
  }

  /**
   * Listar notificações do usuário (se houver modelo de histórico)
   */
  async getMyNotifications(userId: string, tenantId: string) {
    // Mock: retornar array vazio
    // Em produção: criar modelo Notification e buscar histórico
    
    return {
      notifications: [],
      message: 'Histórico de notificações não implementado ainda',
    };
  }

  /**
   * Marcar notificação como lida
   */
  async markAsRead(notificationId: string, userId: string) {
    // Mock: funcionalidade para quando criar modelo Notification
    return {
      message: 'Funcionalidade não implementada',
      notificationId,
    };
  }

  /**
   * Notificações automáticas - helpers para outros módulos
   */

  /**
   * Notificar agendamento confirmado
   */
  async notifyAppointmentConfirmed(appointmentId: string, tenantId: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id: appointmentId, tenantId },
      include: {
        service: true,
        barber: { include: { user: true } },
        customer: { include: { user: true } },
      },
    });

    if (!appointment || !appointment.customer) {
      return;
    }

    const scheduledDate = new Date(appointment.scheduledAt).toLocaleDateString('pt-BR');
    const scheduledTime = new Date(appointment.scheduledAt).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    await this.sendNotification(
      {
        userId: appointment.customer.userId,
        title: '✅ Agendamento Confirmado',
        body: `Seu agendamento de ${appointment.service.name} com ${appointment.barber.user.name} está confirmado para ${scheduledDate} às ${scheduledTime}`,
        data: {
          type: 'appointment_confirmed',
          appointmentId,
        },
      },
      tenantId,
    );
  }

  /**
   * Notificar agendamento cancelado
   */
  async notifyAppointmentCancelled(appointmentId: string, tenantId: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id: appointmentId, tenantId },
      include: {
        service: true,
        barber: { include: { user: true } },
        customer: { include: { user: true } },
      },
    });

    if (!appointment || !appointment.customer) {
      return;
    }

    await this.sendNotification(
      {
        userId: appointment.customer.userId,
        title: '❌ Agendamento Cancelado',
        body: `Seu agendamento de ${appointment.service.name} foi cancelado`,
        data: {
          type: 'appointment_cancelled',
          appointmentId,
        },
      },
      tenantId,
    );
  }

  /**
   * Notificar lembrete de agendamento (1h antes)
   * Este método seria chamado por um cron job
   */
  async sendAppointmentReminders() {
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
    const oneHourFiveMinsFromNow = new Date(Date.now() + 65 * 60 * 1000);

    // Buscar agendamentos nas próximas 1h
    const upcomingAppointments = await this.prisma.appointment.findMany({
      where: {
        scheduledAt: {
          gte: oneHourFromNow,
          lte: oneHourFiveMinsFromNow,
        },
        status: {
          in: ['CONFIRMED', 'PENDING'],
        },
      },
      include: {
        service: true,
        barber: { include: { user: true } },
        customer: { include: { user: true } },
      },
    });

    this.logger.log(
      `Enviando ${upcomingAppointments.length} lembretes de agendamento`,
    );

    for (const appointment of upcomingAppointments) {
      if (!appointment.customer) continue;

      const scheduledTime = new Date(appointment.scheduledAt).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });

      await this.sendNotification(
        {
          userId: appointment.customer.userId,
          title: '⏰ Lembrete de Agendamento',
          body: `Seu agendamento de ${appointment.service.name} com ${appointment.barber.user.name} é daqui a 1 hora (${scheduledTime})`,
          data: {
            type: 'appointment_reminder',
            appointmentId: appointment.id,
          },
        },
        appointment.tenantId,
      );
    }

    return {
      remindersSent: upcomingAppointments.length,
    };
  }
}
