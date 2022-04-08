import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TopNews } from 'src/entities/topNews.entity';
import { TopNewsController } from './top-news.controller';
import { TopNewsService } from './top-news.service';

@Module({
  imports: [TypeOrmModule.forFeature([TopNews])],
  controllers: [TopNewsController],
  providers: [TopNewsService],
})
export class TopNewsModule {}
