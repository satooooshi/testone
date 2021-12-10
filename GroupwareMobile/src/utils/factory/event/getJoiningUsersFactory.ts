import {User, UserJoiningEvent} from '../../../types';

export const getJoiningUsers = (
  userJoiningEvents: UserJoiningEvent[],
): User[] => {
  const users: User[] = [];
  userJoiningEvents.map(u => {
    if (u.canceledAt) {
      return;
    }
    users.push(u.user);
  });
  return users;
};
