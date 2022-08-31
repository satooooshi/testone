import {User} from '../../types';

export const userNameFactory = (user: Partial<User> | undefined) => {
  if (!user || !user.existence) {
    return '存在しないユーザー';
  }
  return `${user.lastName} ${user.firstName}`;
};

export const userNameFactoryForPartial = (user: Partial<User> | undefined) => {
  if (!user) {
    return '存在しないユーザー';
  }
  return `${user.lastName} ${user.firstName}`;
};
