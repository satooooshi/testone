import Faker from 'faker';
import { EventSchedule } from 'src/entities/event.entity';
import { define } from 'typeorm-seeding';

define(EventSchedule, (faker: typeof Faker) => {
  const name = faker.name.title();
  const description = faker.name.title();
  const startAt = faker.date.future();
  const start = startAt;
  start.setDate(startAt.getDate() + 1);
  const endAt = start;
  const newEvent = new EventSchedule();

  newEvent.title = name;
  newEvent.description = description;
  newEvent.startAt = startAt;
  newEvent.endAt = endAt;
  return newEvent;
});
