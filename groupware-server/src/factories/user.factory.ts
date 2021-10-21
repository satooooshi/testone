import * as faker from 'faker';
import { define } from 'typeorm-seeding';
import { User, UserRole } from 'src/entities/user.entity';
import { hashSync } from 'bcrypt';

define(User, (): User => {
  const user = new User();
  const userRoleArray = [
    UserRole.COMMON,
    UserRole.ADMIN,
    UserRole.EXTERNAL_INSTRUCTOR,
    UserRole.INTERNAL_INSTRUCTOR,
    UserRole.COACH,
  ];
  user.email = faker.internet.email();
  user.lastName = faker.name.lastName();
  user.firstName = faker.name.firstName();
  (user.password = hashSync('password', 10)),
    (user.role =
      userRoleArray[Math.floor(Math.random() * userRoleArray.length)]);
  user.avatarUrl = faker.image.avatar();

  return user;
});
