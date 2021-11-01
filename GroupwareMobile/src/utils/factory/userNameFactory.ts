import {User} from '../../types';

export const userNameFactory = (user: User | undefined) => {
  if (!user) {
    return 'ボールドくん';
  }
  return `${user.lastName} ${user.firstName}`;
};
