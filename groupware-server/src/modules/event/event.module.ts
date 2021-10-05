import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventSchedule } from 'src/entities/event.entity';
import { EventComment } from 'src/entities/eventComment.entity';
import { EventFile } from 'src/entities/eventFile.entity';
import { EventVideo } from 'src/entities/eventVideo.entity';
import { Tag } from 'src/entities/tag.entity';
import { ChatModule } from '../chat/chat.module';
import { NotificationModule } from '../notification/notification.module';
import { UserModule } from '../user/user.module';
import { EventScheduleController } from './event.controller';
import { EventScheduleService } from './event.service';

@Module({
  imports: [
    ChatModule,
    UserModule,
    NotificationModule,
    ConfigModule,
    TypeOrmModule.forFeature([
      EventSchedule,
      EventFile,
      EventVideo,
      Tag,
      EventComment,
    ]),
  ],
  controllers: [EventScheduleController],
  providers: [EventScheduleService],
})
export class EventScheduleModule {}
