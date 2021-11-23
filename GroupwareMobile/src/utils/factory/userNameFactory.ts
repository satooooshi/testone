import {User} from '../../types';

export const userNameFactory = (user: Partial<User> | undefined) => {
  if (!user || !user.existence) {
    return 'ボールドくん';
  }
  return `${user.lastName} ${user.firstName}`;
};
