import { define } from 'typeorm-seeding';
import * as faker from 'faker';
import { UserTag } from 'src/entities/userTag.entity';

define(UserTag, () => {
  const name = faker.unique(faker.hacker.noun);
  const newTag = new UserTag();
  newTag.name = name;

  return newTag;
});
