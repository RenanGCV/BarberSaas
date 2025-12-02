import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

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
  handleJoinTenant(@MessageBody() tenantId: string, @ConnectedSocket() client: Socket) {
    client.join(`tenant:${tenantId}`);
    this.logger.log(`Cliente ${client.id} entrou na sala tenant:${tenantId}`);
    return { event: 'joined', data: { tenantId } };
  }

  // Cliente se junta à sala do barbeiro
  @SubscribeMessage('join-barber')
  handleJoinBarber(@MessageBody() barberId: string, @ConnectedSocket() client: Socket) {
    client.join(`barber:${barberId}`);
    this.logger.log(`Cliente ${client.id} entrou na sala barber:${barberId}`);
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
