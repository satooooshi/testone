import { Test, TestingModule } from '@nestjs/testing';
import { TopNewsController } from './top-news.controller';

describe('TopNewsController', () => {
  let controller: TopNewsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TopNewsController],
    }).compile();

    controller = module.get<TopNewsController>(TopNewsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
