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
      where: { userId },
    });

    if (pushTokens.length === 0) {
      this.logger.warn(`Usuário ${userId} não possui tokens de push`);
      return {
        sent: false,
        message: 'Usuário não possui dispositivos registrados',
        userId,
      };
    }

    // Mock: simular envio bem-sucedido
    const mockResponse = {
      successCount: pushTokens.length,
      failureCount: 0,
      tokens: pushTokens.map(pt => pt.token),
    };

    this.logger.log(
      `[MOCK] Notificação enviada para ${user.name}: "${title}"`,
    );

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
    });

    if (users.length === 0) {
      throw new NotFoundException('Nenhum usuário encontrado');
    }

    // Buscar todos os tokens dos usuários
    const pushTokens = await this.prisma.pushToken.findMany({
      where: {
        userId: { in: users.map(u => u.id) },
      },
    });

    const allTokens = pushTokens.map(pt => pt.token);

    if (allTokens.length === 0) {
      return {
        sent: false,
        message: 'Nenhum dispositivo registrado encontrado',
        usersFound: users.length,
      };
    }

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
      where: { token },
    });

    if (existing) {
      // Atualizar device se necessário
      await this.prisma.pushToken.update({
        where: { id: existing.id },
        data: { device: platform },
      });

      return {
        message: 'Token atualizado com sucesso',
        tokenId: existing.id,
      };
    }

    // Criar novo token
    const pushToken = await this.prisma.pushToken.create({
      data: {
        userId,
        token,
        device: platform,
      },
    });

    this.logger.log(`Push token registrado para usuário ${user.name}`);

    return {
      message: 'Token registrado com sucesso',
      tokenId: pushToken.id,
      platform: pushToken.device,
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

    await this.prisma.pushToken.delete({
      where: { id: pushToken.id },
    });

    return {
      message: 'Token removido com sucesso',
      tokenId: pushToken.id,
    };
  }

  /**
   * Listar notificações do usuário (mock)
   */
  async getMyNotifications(userId: string, tenantId: string) {
    return {
      notifications: [],
      message: 'Histórico de notificações não implementado',
    };
  }

  /**
   * Marcar notificação como lida (mock)
   */
  async markAsRead(notificationId: string, userId: string) {
    return {
      message: 'Notificação marcada como lida',
      notificationId,
    };
  }

  /**
   * Enviar notificação de confirmação de agendamento
   */
  async sendAppointmentConfirmation(appointmentId: string, tenantId: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id: appointmentId },
      include: {
        service: true,
        barber: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    if (!appointment || !appointment.customerId) {
      throw new NotFoundException('Agendamento não encontrado ou cliente não definido');
    }

    const title = 'Agendamento Confirmado! ✅';
    const body = `Seu agendamento de ${appointment.service.name} com ${appointment.barber.user.name} foi confirmado para ${new Date(appointment.scheduledAt).toLocaleString('pt-BR')}.`;

    return this.sendNotification(
      { userId: appointment.customerId, title, body },
      tenantId,
    );
  }

  /**
   * Enviar lembrete de agendamento
   */
  async sendAppointmentReminder(appointmentId: string, tenantId: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id: appointmentId },
      include: {
        service: true,
        barber: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    if (!appointment || !appointment.customerId) {
      throw new NotFoundException('Agendamento não encontrado ou cliente não definido');
    }

    const title = 'Lembrete de Agendamento ⏰';
    const body = `Não esqueça: ${appointment.service.name} com ${appointment.barber.user.name} em breve!`;

    return this.sendNotification(
      { userId: appointment.customerId, title, body },
      tenantId,
    );
  }
}
