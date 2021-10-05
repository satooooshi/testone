import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QAAnswer } from 'src/entities/qaAnswer.entity';
import { QAAnswerReply } from 'src/entities/qaAnswerReply.entity';
import { Wiki } from 'src/entities/qaQuestion.entity';
import { User } from 'src/entities/user.entity';
import { NotificationModule } from '../notification/notification.module';
import { WikiController } from './wiki.controller';
import { WikiService } from './wiki.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wiki, QAAnswer, QAAnswerReply, User]),
    NotificationModule,
    ConfigModule,
  ],
  controllers: [WikiController],
  providers: [WikiService],
})
export class WikiModule {}
