import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentTenant } from '../auth/decorators/current-tenant.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { BroadcastNotificationDto, RegisterPushTokenDto, SendNotificationDto } from './dto';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('send')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Enviar notificação para um usuário (Admin)' })
  @ApiResponse({ status: 200, description: 'Notificação enviada com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async sendNotification(
    @Body() dto: SendNotificationDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.notificationsService.sendNotification(dto, tenantId);
  }

  @Post('broadcast')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: 'Enviar notificação para múltiplos usuários (Broadcast)' })
  @ApiResponse({ status: 200, description: 'Broadcast enviado com sucesso' })
  @ApiResponse({ status: 404, description: 'Nenhum usuário encontrado' })
  async broadcastNotification(
    @Body() dto: BroadcastNotificationDto,
    @CurrentTenant() tenantId: string,
  ) {
    return this.notificationsService.broadcastNotification(dto, tenantId);
  }

  @Post('register-token')
  @ApiOperation({ summary: 'Registrar token de push notification (FCM)' })
  @ApiResponse({ status: 201, description: 'Token registrado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async registerPushToken(
    @Body() dto: RegisterPushTokenDto,
    @CurrentUser('id') userId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.notificationsService.registerPushToken(dto, userId, tenantId);
  }

  @Delete('token/:token')
  @ApiOperation({ summary: 'Remover token de push (logout do dispositivo)' })
  @ApiResponse({ status: 200, description: 'Token removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Token não encontrado' })
  async removePushToken(
    @Param('token') token: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.notificationsService.removePushToken(token, userId);
  }

  @Get('me')
  @ApiOperation({ summary: 'Listar minhas notificações (histórico)' })
  @ApiResponse({ status: 200, description: 'Lista de notificações retornada' })
  async getMyNotifications(
    @CurrentUser('id') userId: string,
    @CurrentTenant() tenantId: string,
  ) {
    return this.notificationsService.getMyNotifications(userId, tenantId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar notificação como lida' })
  @ApiResponse({ status: 200, description: 'Notificação marcada como lida' })
  async markAsRead(
    @Param('id') notificationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.notificationsService.markAsRead(notificationId, userId);
  }

  @Post('test/send-reminders')
  @Roles('OWNER', 'ADMIN')
  @ApiOperation({ summary: '[TESTE] Enviar lembretes de agendamentos (1h antes)' })
  @ApiResponse({ status: 200, description: 'Lembretes enviados' })
  async sendReminders() {
    return this.notificationsService.sendAppointmentReminders();
  }
}
