import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TopNews } from 'src/entities/topNews.entity';
import JwtAuthenticationGuard from '../auth/jwtAuthentication.guard';
import { TopNewsService } from './top-news.service';

export type GetTopNewsQuery = {
  page?: string;
};
export type GetTopNewsResult = {
  pageCount?: number;
  news: TopNews[];
};

@Controller('top-news')
export class TopNewsController {
  constructor(private readonly topNewsService: TopNewsService) {}

  @Get('/')
  @UseGuards(JwtAuthenticationGuard)
  async getTopNews(@Query() query: GetTopNewsQuery): Promise<GetTopNewsResult> {
    return await this.topNewsService.getTopNews(query);
  }

  @Post('/')
  @UseGuards(JwtAuthenticationGuard)
  async createNews(@Body() news: Partial<TopNews>): Promise<TopNews> {
    return await this.topNewsService.saveNews(news);
  }

  @Patch('/')
  @UseGuards(JwtAuthenticationGuard)
  async updateNews(@Body() news: TopNews): Promise<TopNews> {
    return await this.topNewsService.saveNews(news);
  }

  @Delete('/:id')
  @UseGuards(JwtAuthenticationGuard)
  async deleteNews(@Param('id') id: number) {
    await this.topNewsService.deleteNews(id);
    return id;
  }
}
