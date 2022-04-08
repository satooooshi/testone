import Faker from 'faker';
import { Wiki } from 'src/entities/wiki.entity';
import { define } from 'typeorm-seeding';

define(Wiki, (faker: typeof Faker) => {
  const title = faker.name.title();
  const body = faker.name.title();
  const createdAt = faker.date.past();
  const updatedAt = new Date();

  const newQuestion = new Wiki();
  newQuestion.title = title;
  newQuestion.body = body;
  newQuestion.createdAt = createdAt;
  newQuestion.updatedAt = updatedAt;

  return newQuestion;
});
