import { ChatGroup } from 'src/entities/chatGroup.entity';
import { RoomType } from 'src/entities/chatGroup.entity';

export const checkAloneRoom = (existRoom: ChatGroup, userId: number) => {
  if (
    existRoom &&
    existRoom.roomType === RoomType.PERSONAL &&
    existRoom.members.length === 2
  ) {
    const chatPartner = existRoom.members.filter((m) => m.id !== userId)[0];
    if (chatPartner) {
      if (chatPartner.existence) {
        existRoom.imageURL = chatPartner.avatarUrl;
        existRoom.name = `${chatPartner.lastName} ${chatPartner.firstName}`;
      } else {
        existRoom.members = existRoom.members.filter((m) => m.existence);
      }
    }
  }
  if (existRoom.members.length === 1 && !existRoom.name) {
    existRoom.name = 'メンバーがいません';
  }
};
