import {User, UserJoiningEvent} from '../../../types';

export const getJoiningUsers = (
  userJoiningEvents: UserJoiningEvent[],
): User[] => {
  const users: User[] = [];
  userJoiningEvents.map(u => {
    users.push(u.user);
  });
  return users;
};
