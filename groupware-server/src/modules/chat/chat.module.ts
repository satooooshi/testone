import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGroup } from 'src/entities/chatGroup.entity';
import { ChatMessage } from 'src/entities/chatMessage.entity';
import { LastReadChatTime } from 'src/entities/lastReadChatTime.entity';
import { User } from 'src/entities/user.entity';
import { NotificationModule } from '../notification/notification.module';
import { UserModule } from '../user/user.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [
    UserModule,
    NotificationModule,
    ConfigModule,
    TypeOrmModule.forFeature([User, ChatMessage, ChatGroup, LastReadChatTime]),
  ],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
