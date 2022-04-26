import {ChatGroup, RoomType, User} from '../../../types';

export const nameOfRoom = (room: ChatGroup, mySelf?: Partial<User>): string => {
  if (!room?.members?.length) {
    return 'メンバーがいません';
  }
  if (room.name) {
    return room.name;
  }

  if (room.roomType === RoomType.PERSONAL) {
    const chatPartner = room.members.filter(m => m.id !== mySelf?.id);
    const partnerName = chatPartner
      .map(p => p.lastName + ' ' + p.firstName)
      .join();

    return partnerName;
  }
  const strMembers = room?.members?.map(m => m.lastName + m.firstName).join();
  return strMembers;
};
