import { Test, TestingModule } from '@nestjs/testing';
import { EventScheduleService } from './event.service';

describe('EventService', () => {
  let service: EventScheduleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventScheduleService],
    }).compile();

    service = module.get<EventScheduleService>(EventScheduleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
