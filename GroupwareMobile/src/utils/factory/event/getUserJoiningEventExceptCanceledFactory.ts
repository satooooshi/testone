import {UserJoiningEvent} from '../../../types';

export const getUserJoiningEventExceptCanceledFactory = (
  userJoiningEvents: UserJoiningEvent[],
): UserJoiningEvent[] => {
  const userJoiningEvent: UserJoiningEvent[] = [];
  userJoiningEvents.map(u => {
    if (u.canceledAt) {
      return;
    }
    userJoiningEvent.push(u);
  });
  return userJoiningEvent;
};
