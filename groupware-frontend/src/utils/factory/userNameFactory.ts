import { User } from 'src/types';

export const userNameFactory = (user?: Partial<User>) => {
  if (!user || !user.lastName || !user.firstName) {
    return '';
  }
  if (!user.existence) {
    return 'ボールドくん';
  }
  return `${user.lastName} ${user.firstName}`;
};
