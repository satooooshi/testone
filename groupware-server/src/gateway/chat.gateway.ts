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
import { ChatGroup } from 'src/entities/chatGroup.entity';
import { ChatMessage } from 'src/entities/chatMessage.entity';

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
    // this.server.emit('badgeClient', 'connected');
  }

  handleConnection(client: Socket) {
    // this.logger.log(`Client connected: ${client.id}`);
    this.server.emit('msgToClient', 'connected');
  }

  @SubscribeMessage('message')
  public async handleMessage(_: Socket, payload: ChatMessage) {
    // this.server.to(payload.chatGroup?.id.toString()).emit('badgeClient', {
    //   userId: payload.sender.id,
    //   groupId: payload.chatGroup.id,
    // });
    this.server
      .to(payload.chatGroup?.id.toString())
      .emit('msgToClient', { ...payload, isSender: false });
  }

  @SubscribeMessage('readReport')
  public async readMessage(
    _: Socket,
    data: { room: string; senderId: string },
  ) {
    this.server.to(data.room).emit('readMessageClient', data.senderId);
  }

  // @SubscribeMessage('editRoom')
  // public async editRoom(_: Socket, room: ChatGroup) {
  //   if (room.createdAt === room.updatedAt) {
  //     this.server.emit('editRoomClient', room);
  //   } else {
  //     this.server.to(room?.id.toString()).emit('editRoomClient', room);
  //   }
  // }

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
