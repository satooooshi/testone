import { ChatGroup } from 'src/types';

export const sortRooms = (room: ChatGroup[]) => {
  if (!room.length) {
    return [];
  }
  const pinnedRooms = room
    .filter((r) => r.isPinned)
    .sort((a, b) => {
      if (
        (b?.chatMessages?.[0]?.createdAt
          ? b?.chatMessages?.[0]?.createdAt
          : b.createdAt) >
        (a?.chatMessages?.[0]?.createdAt
          ? a?.chatMessages?.[0]?.createdAt
          : a.createdAt)
      ) {
        return 1;
      } else {
        return -1;
      }
    });
  const exceptPinnedRooms = room
    .filter((r) => !r.isPinned)
    .sort((a, b) => {
      if (
        (b?.chatMessages?.[0]?.createdAt
          ? b?.chatMessages?.[0]?.createdAt
          : b.createdAt) >
        (a?.chatMessages?.[0]?.createdAt
          ? a?.chatMessages?.[0]?.createdAt
          : a.createdAt)
      ) {
        return 1;
      } else {
        return -1;
      }
    });
  return [...pinnedRooms, ...exceptPinnedRooms];
};
