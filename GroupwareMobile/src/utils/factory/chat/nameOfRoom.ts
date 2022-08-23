import RoomForm from '../../../templates/chat/room/RoomForm';
import {ChatGroup, RoomType, User} from '../../../types';

export const nameOfRoom = (room: ChatGroup, mySelf?: Partial<User>): string => {
  if (room.name) {
    return room.name;
  }
  if (room.roomType === RoomType.TALK_ROOM) {
    const strMembers = room?.members?.map(m => m.lastName + m.firstName).join();
    return strMembers ? strMembers : 'タイトルなしトーク';
  }
  return '';
};
