import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatAlbum } from 'src/entities/chatAlbum.entity';
import { ChatAlbumImage } from 'src/entities/chatAlbumImage.entity';
import { ChatGroup } from 'src/entities/chatGroup.entity';
import { ChatMessage } from 'src/entities/chatMessage.entity';
import { ChatNote } from 'src/entities/chatNote.entity';
import { ChatNoteImage } from 'src/entities/chatNoteImage.entity';
import { LastReadChatTime } from 'src/entities/lastReadChatTime.entity';
import { User } from 'src/entities/user.entity';
import { NotificationModule } from '../notification/notification.module';
import { StorageModule } from '../storage/storage.module';
import { UserModule } from '../user/user.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [
    StorageModule,
    UserModule,
    NotificationModule,
    ConfigModule,
    TypeOrmModule.forFeature([
      User,
      ChatMessage,
      ChatGroup,
      LastReadChatTime,
      ChatNote,
      ChatNoteImage,
      ChatAlbum,
      ChatAlbumImage,
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
