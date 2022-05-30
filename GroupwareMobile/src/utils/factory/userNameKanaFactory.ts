import {User} from '../../types';

export const userNameKanaFactory = (user: Partial<User> | undefined) => {
  if (!user || !user.existence) {
    return 'sampleクン';
  }
  return `${user.lastNameKana} ${user.firstNameKana}`;
};
