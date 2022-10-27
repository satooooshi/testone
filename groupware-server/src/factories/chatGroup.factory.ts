import Faker from 'faker';
import { ChatGroup, RoomType } from 'src/entities/chatGroup.entity';
import { define } from 'typeorm-seeding';

define(ChatGroup, (faker: typeof Faker) => {
  const chatGroup = new ChatGroup();
  // chatGroup.name = '';
  // chatGroup.roomType = RoomType.TALK_ROOM;
  // chatGroup.roomType = RoomType.PERSONAL;
  chatGroup.roomType = RoomType.GROUP;
  chatGroup.name = faker.company.companyName();
  chatGroup.imageURL =
    'https://storage.googleapis.com/groupware-bucket-development/1659514315874/';

  return chatGroup;
});
