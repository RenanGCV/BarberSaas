import { Logger } from '@nestjs/common';
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/appointments',
})
export class AppointmentsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('AppointmentsGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  // Cliente se junta à sala do tenant
  @SubscribeMessage('join-tenant')
  handleJoinTenant(@MessageBody() data: { tenantId: string; userId?: string }, @ConnectedSocket() client: Socket) {
    const { tenantId, userId } = data;
    
    // Validar se userId tem permissão para acessar este tenantId
    const userTenantId = (client.handshake as any).auth?.tenantId;
    const userRole = (client.handshake as any).auth?.role;
    
    // Verificação de segurança multi-tenant
    if (!userTenantId) {
      this.logger.warn(`Cliente ${client.id} tentou entrar sem tenant ID na autenticação`);
      return { event: 'error', data: { message: 'Autenticação de tenant obrigatória' } };
    }
    
    if (userTenantId !== tenantId) {
      this.logger.warn(`Cliente ${client.id} tentou entrar em tenant ${tenantId} mas pertence a ${userTenantId}`);
      return { event: 'error', data: { message: 'Acesso negado ao tenant solicitado' } };
    }
    
    client.join(`tenant:${tenantId}`);
    this.logger.log(`Cliente ${client.id} (role: ${userRole}) entrou na sala tenant:${tenantId}`);
    return { event: 'joined', data: { tenantId } };
  }

  // Cliente se junta à sala do barbeiro
  @SubscribeMessage('join-barber')
  async handleJoinBarber(@MessageBody() data: { barberId: string; userId?: string }, @ConnectedSocket() client: Socket) {
    const { barberId, userId } = data;
    
    // Validar se userId é o próprio barbeiro ou admin do tenant
    const userTenantId = (client.handshake as any).auth?.tenantId;
    const userRole = (client.handshake as any).auth?.role;
    const authenticatedUserId = (client.handshake as any).auth?.userId;
    
    if (!userTenantId || !authenticatedUserId) {
      this.logger.warn(`Cliente ${client.id} tentou entrar em sala do barbeiro sem autenticação completa`);
      return { event: 'error', data: { message: 'Autenticação completa necessária' } };
    }
    
    // Verificar se é admin/owner ou o próprio barbeiro
    const isAdmin = ['ADMIN', 'OWNER'].includes(userRole);
    const isOwnBarber = userId === authenticatedUserId;
    
    if (!isAdmin && !isOwnBarber) {
      this.logger.warn(`Cliente ${client.id} (userId: ${authenticatedUserId}) tentou acessar sala do barbeiro ${barberId} sem permissão`);
      return { event: 'error', data: { message: 'Sem permissão para acessar esta sala de barbeiro' } };
    }
    
    client.join(`barber:${barberId}`);
    this.logger.log(`Cliente ${client.id} (role: ${userRole}) entrou na sala barber:${barberId}`);
    return { event: 'joined', data: { barberId } };
  }

  // Notificar sobre novo agendamento
  notifyAppointmentCreated(appointment: any) {
    this.logger.log(`Novo agendamento criado: ${appointment.id}`);
    
    // Notificar tenant
    this.server.to(`tenant:${appointment.tenantId}`).emit('appointment:created', appointment);
    
    // Notificar barbeiro específico
    this.server.to(`barber:${appointment.barberId}`).emit('appointment:created', appointment);
  }

  // Notificar sobre atualização de agendamento
  notifyAppointmentUpdated(appointment: any) {
    this.logger.log(`Agendamento atualizado: ${appointment.id}`);
    
    this.server.to(`tenant:${appointment.tenantId}`).emit('appointment:updated', appointment);
    this.server.to(`barber:${appointment.barberId}`).emit('appointment:updated', appointment);
  }

  // Notificar sobre mudança de status
  notifyAppointmentStatusChanged(appointment: any) {
    this.logger.log(`Status do agendamento alterado: ${appointment.id} -> ${appointment.status}`);
    
    this.server.to(`tenant:${appointment.tenantId}`).emit('appointment:status-changed', appointment);
    this.server.to(`barber:${appointment.barberId}`).emit('appointment:status-changed', appointment);
  }

  // Notificar sobre cancelamento
  notifyAppointmentCancelled(appointment: any) {
    this.logger.log(`Agendamento cancelado: ${appointment.id}`);
    
    this.server.to(`tenant:${appointment.tenantId}`).emit('appointment:cancelled', appointment);
    this.server.to(`barber:${appointment.barberId}`).emit('appointment:cancelled', appointment);
  }

  // Lembrete de agendamento (1h antes)
  notifyAppointmentReminder(appointment: any) {
    this.logger.log(`Lembrete de agendamento: ${appointment.id}`);
    
    // Notificar cliente (implementar quando tiver conexão do cliente)
    this.server.to(`customer:${appointment.customerId}`).emit('appointment:reminder', {
      id: appointment.id,
      scheduledAt: appointment.scheduledAt,
      barberName: appointment.barber.user.name,
      serviceName: appointment.service.name,
    });
  }
}
