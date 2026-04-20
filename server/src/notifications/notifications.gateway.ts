import { WebSocketGateway, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class NotificationsGateway {
  @WebSocketServer() server: Server;

  notifyUser(userId: string, data: any) {
    this.server.emit(`notification_${userId}`, data);
  }

  notifyRole(role: string, data: any) {
    this.server.emit(`role_${role}`, data);
  }

  notifyBroadcast(data: any) {
    this.server.emit('broadcast', data);
  }
}
