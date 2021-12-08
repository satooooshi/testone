import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TopNews } from 'src/entities/topNews.entity';
import { Repository } from 'typeorm';
import { GetTopNewsQuery, GetTopNewsResult } from './top-news.controller';

@Injectable()
export class TopNewsService {
  constructor(
    @InjectRepository(TopNews)
    private readonly newsRepository: Repository<TopNews>,
  ) {}

  async getTopNews(query: GetTopNewsQuery): Promise<GetTopNewsResult> {
    const { page = 1 } = query;
    const limit = 20;
    const offset = (Number(page) - 1) * limit;
    const [news, count] = await this.newsRepository
      .createQueryBuilder('news')
      .select()
      .skip(offset)
      .take(limit)
      .orderBy('news.createdAt', 'DESC')
      .getManyAndCount();
    const pageCount =
      count % limit === 0 ? count / limit : Math.floor(count / limit) + 1;
    return { pageCount, news };
  }

  async saveNews(news: Partial<TopNews>): Promise<TopNews> {
    return await this.newsRepository.save(news);
  }

  async deleteNews(newsId: number) {
    await this.newsRepository.delete(newsId);
  }
}
