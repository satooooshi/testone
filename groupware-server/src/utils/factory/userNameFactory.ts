import { User } from 'src/entities/user.entity';

export const userNameFactory = (user: User) => {
  return `${user.lastName} ${user.firstName}`;
};
