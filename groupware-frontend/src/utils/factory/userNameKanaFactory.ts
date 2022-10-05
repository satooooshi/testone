import { User } from 'src/types';

export const userNameKanaFactory = (user?: Partial<User>) => {
  if (!user || !user.lastNameKana || !user.firstNameKana) {
    return '';
  }
  if (!user.existence) {
    return 'ボールドクン';
  }
  return `${user.lastNameKana} ${user.firstNameKana}`;
};
