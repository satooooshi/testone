import {User} from '../../types';

export const userNameFactory = (user: Partial<User> | undefined) => {
  if (!user) {
    return 'ボールドくん';
  }
  return `${user.lastName} ${user.firstName}`;
};
