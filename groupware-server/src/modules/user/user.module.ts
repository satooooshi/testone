import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { UserGoodForBoard } from 'src/entities/userGoodForBord.entity';
import { ChatModule } from '../chat/chat.module';
import { StorageModule } from '../storage/storage.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    StorageModule,
    ChatModule,
    TypeOrmModule.forFeature([User, UserGoodForBoard]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
