import { User } from 'src/types';

export const userNameFactory = (user: User) => {
  return `${user.lastName} ${user.firstName}`;
};
