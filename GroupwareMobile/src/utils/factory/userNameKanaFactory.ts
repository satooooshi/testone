import {User} from '../../types';

export const userNameKanaFactory = (user: Partial<User> | undefined) => {
  if (!user || !user.existence) {
    return 'vallyeinクン';
  }
  return `${user.lastNameKana} ${user.firstNameKana}`;
};
