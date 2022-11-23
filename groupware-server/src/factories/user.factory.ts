import * as faker from 'faker';
import { define } from 'typeorm-seeding';
import { User, UserRole } from 'src/entities/user.entity';
import { hashSync } from 'bcrypt';

define(User, (): User => {
  const user = new User();
  const userRoleArray = [UserRole.COMMON, UserRole.ADMIN, UserRole.INFLUENCER];
  user.email = faker.internet.email();
  user.lastName = faker.name.lastName();
  user.firstName = faker.name.firstName();
  user.lastNameKana = 'ン';
  user.firstNameKana = 'ン';
  (user.password = hashSync('password', 10)),
    (user.role =
      userRoleArray[Math.floor(Math.random() * userRoleArray.length)]);
  user.verifiedAt = new Date();
  user.avatarUrl =
    'https://storage.googleapis.com/groupware-bucket-development/1659514315874/';
  user.existence = true;

  return user;
});
