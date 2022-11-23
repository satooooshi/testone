import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventSchedule } from 'src/entities/event.entity';
import { EventComment } from 'src/entities/eventComment.entity';
import { EventFile } from 'src/entities/eventFile.entity';
import { EventIntroduction } from 'src/entities/eventIntroduction.entity';
import { EventVideo } from 'src/entities/eventVideo.entity';
import { SubmissionFile } from 'src/entities/submissionFiles.entity';
import { Tag } from 'src/entities/tag.entity';
import { UserJoiningEvent } from 'src/entities/userJoiningEvent.entity';
import { ChatModule } from '../chat/chat.module';
import { NotificationModule } from '../notification/notification.module';
import { StorageModule } from '../storage/storage.module';
import { UserModule } from '../user/user.module';
import { EventScheduleController } from './event.controller';
import { EventScheduleService } from './event.service';

@Module({
  imports: [
    StorageModule,
    ChatModule,
    UserModule,
    NotificationModule,
    ConfigModule,
    TypeOrmModule.forFeature([
      UserJoiningEvent,
      EventSchedule,
      EventIntroduction,
      EventFile,
      EventVideo,
      Tag,
      EventComment,
      SubmissionFile,
    ]),
  ],
  controllers: [EventScheduleController],
  providers: [EventScheduleService],
})
export class EventScheduleModule {}
