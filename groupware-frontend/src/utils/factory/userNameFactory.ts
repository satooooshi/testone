import { User } from 'src/types';

export const userNameFactory = (user?: Partial<User>) => {
  if (!user || !user.lastName || !user.firstName) {
    return '';
  }
  return `${user.lastName} ${user.firstName}`;
};
