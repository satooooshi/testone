import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Socket } from 'socket.io';
import { ChatMessage } from 'src/entities/chatMessage.entity';

type socketMessage = {
  chatMessage: ChatMessage;
  type: 'send' | 'edit' | 'delete';
};

@WebSocketGateway()
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  private logger: Logger = new Logger('AppGateway');

  afterInit() {
    // this.logger.log('Init');
  }

  handleDisconnect(client: Socket) {
    // this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket) {
    // this.logger.log(`Client connected: ${client.id}`);
    this.server.emit('msgToClient', 'connected');
  }

  @SubscribeMessage('message')
  public async handleMessage(_: Socket, payload: socketMessage) {
    payload.chatMessage.isSender = false;
    this.server
      .to(payload.chatMessage.chatGroup?.id.toString())
      .emit('msgToClient', payload);
  }

  @SubscribeMessage('joinRoom')
  public joinRoom(client: Socket, room: string): void {
    //@TODO dbにグループがなかったらエラーを吐く
    client.join(room);
    client.emit('joinedRoom', room);
  }

  @SubscribeMessage('leaveRoom')
  public leaveRoom(client: Socket, room: string): void {
    client.leave(room);
    client.emit('leftRoom', room);
  }
}
