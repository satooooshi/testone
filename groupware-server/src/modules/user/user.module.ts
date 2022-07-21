import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { UserGoodForBoard } from 'src/entities/userGoodForBord.entity';
import { ChatModule } from '../chat/chat.module';
import { StorageModule } from '../storage/storage.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { QAAnswer } from 'src/entities/qaAnswer.entity';
import { UserJoiningEvent } from 'src/entities/userJoiningEvent.entity';
import { Wiki } from 'src/entities/wiki.entity';

@Module({
  imports: [
    StorageModule,
    ChatModule,
    TypeOrmModule.forFeature([
      User,
      UserGoodForBoard,
      UserJoiningEvent,
      QAAnswer,
      Wiki,
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
