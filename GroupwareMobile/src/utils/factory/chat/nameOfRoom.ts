import {ChatGroup} from '../../../types';

export const nameOfRoom = (room: ChatGroup): string => {
  if (!room?.members?.length) {
    return 'メンバーがいません';
  }
  if (room.name) {
    return room.name;
  }
  const strMembers = room?.members?.map(m => m.lastName + m.firstName).join();
  return strMembers;
};
