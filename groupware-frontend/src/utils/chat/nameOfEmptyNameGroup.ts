import { ChatGroup, User } from 'src/types';

export const nameOfEmptyNameGroup = (group: ChatGroup): string => {
  if (group.name) {
    return group.name;
  }
  if (!group.memberCount) {
    return 'メンバーがいません';
  }
  return 'タイトルなしトーク';
};
