import { Test, TestingModule } from '@nestjs/testing';
import { TopNewsService } from './top-news.service';

describe('TopNewsService', () => {
  let service: TopNewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TopNewsService],
    }).compile();

    service = module.get<TopNewsService>(TopNewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
