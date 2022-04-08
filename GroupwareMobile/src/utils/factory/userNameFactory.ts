import {User} from '../../types';

export const userNameFactory = (user: Partial<User> | undefined) => {
  if (!user || !user.existence) {
    return 'サンプル';
  }
  return `${user.lastName} ${user.firstName}`;
};
