import Faker from 'faker';
import { ChatGroup } from 'src/entities/chatGroup.entity';
import { define } from 'typeorm-seeding';

define(ChatGroup, (faker: typeof Faker) => {
  const chatGroup = new ChatGroup();
  chatGroup.name = faker.company.companyName();
  chatGroup.imageURL = faker.image.imageUrl();

  return chatGroup;
});
