import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { StorageModule } from '../storage/storage.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [StorageModule, TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
