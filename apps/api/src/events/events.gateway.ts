import { Logger } from '@nestjs/common';
import {
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
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('EventsGateway');
  private connectedClients = new Map<string, string>(); // socketId -> userId

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('join')
  handleJoin(client: Socket, payload: { userId: string; tenantId: string }) {
    this.connectedClients.set(client.id, payload.userId);
    client.join(`tenant:${payload.tenantId}`);
    client.join(`user:${payload.userId}`);
    
    this.logger.log(`Usuário ${payload.userId} entrou no room ${payload.tenantId}`);
  }

  /**
   * Notificar novo agendamento para barbeiros
   */
  notifyNewAppointment(tenantId: string, appointment: any) {
    this.server.to(`tenant:${tenantId}`).emit('appointment:new', appointment);
  }

  /**
   * Notificar atualização de agendamento
   */
  notifyAppointmentUpdate(tenantId: string, appointment: any) {
    this.server.to(`tenant:${tenantId}`).emit('appointment:update', appointment);
  }

  /**
   * Notificar cancelamento de agendamento
   */
  notifyAppointmentCancellation(userId: string, appointment: any) {
    this.server.to(`user:${userId}`).emit('appointment:cancelled', appointment);
  }

  /**
   * Notificar nova transação (caixa)
   */
  notifyCashFlowUpdate(tenantId: string, cashFlow: any) {
    this.server.to(`tenant:${tenantId}`).emit('cashflow:update', cashFlow);
  }

  /**
   * Broadcast para todos os clientes de um tenant
   */
  broadcastToTenant(tenantId: string, event: string, data: any) {
    this.server.to(`tenant:${tenantId}`).emit(event, data);
  }

  /**
   * Enviar para usuário específico
   */
  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }
}
