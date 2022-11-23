import { Tag } from 'src/entities/tag.entity';
import { define } from 'typeorm-seeding';
import * as faker from 'faker';

define(Tag, () => {
  const name = faker.unique(faker.hacker.noun);
  const newTag = new Tag();
  newTag.name = name;

  return newTag;
});
