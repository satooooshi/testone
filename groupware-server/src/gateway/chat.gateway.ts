import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Socket } from 'socket.io';
import { ChatMessage } from 'src/entities/chatMessage.entity';
// import { UserService } from 'src/modules/user/user.service';
// import { Server } from 'ws';

@WebSocketGateway()
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor() {} // private readonly jwtService: JwtService, // private readonly userService: UserService,
  @WebSocketServer() server: Server;

  private logger: Logger = new Logger('AppGateway');

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
    this.server.emit('msgToClient', 'connected');
  }

  @SubscribeMessage('message')
  public async handleMessage(client: Socket, payload: ChatMessage) {
    // const user: any = jwtDecode(payload.userToken);
    // const existUser = await this.userService.findById(user.id);
    // payload.message.sender = existUser;
    // payload.userToken = undefined;
    console.log('message');
    console.log(payload.content);
    console.log(payload.chatGroup?.id);
    console.log(payload.chatGroup?.id.toString());
    this.server
      .to(payload.chatGroup?.id.toString())
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
