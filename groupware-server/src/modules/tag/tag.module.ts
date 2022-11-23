import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from 'src/entities/tag.entity';
import { UserTag } from 'src/entities/userTag.entity';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';

@Module({
  imports: [TypeOrmModule.forFeature([Tag, UserTag])],
  controllers: [TagController],
  providers: [TagService],
})
export class TagModule {}
