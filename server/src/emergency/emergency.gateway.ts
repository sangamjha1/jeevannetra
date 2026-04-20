import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { EmergencyService } from './emergency.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EmergencyGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(EmergencyGateway.name);

  constructor(private emergencyService: EmergencyService) {}

  afterInit(server: Server) {
    this.logger.log('🚑 Emergency Gateway Initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`🔗 Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`❌ Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('trigger_emergency')
  async handleEmergency(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    // This will be called from the frontend when a patient hits the emergency button
    const emergencyRequest = await this.emergencyService.create(data.userId, {
      latitude: data.latitude,
      longitude: data.longitude,
    });

    // Notify all staff members
    this.server.emit('emergency_alert', emergencyRequest);
    return emergencyRequest;
  }

  @SubscribeMessage('respond_to_emergency')
  async handleResponse(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    const updatedRequest = await this.emergencyService.update(data.id, {
      status: 'DISPATCHED',
      staffId: data.staffId,
    });

    // Notify all staff and the patient
    this.server.emit('emergency_updated', updatedRequest);
    return updatedRequest;
  }
}
