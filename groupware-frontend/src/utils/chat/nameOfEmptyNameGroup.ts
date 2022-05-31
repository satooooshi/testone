import { User } from 'src/types';

export const nameOfEmptyNameGroup = (members?: User[]): string => {
  if (!members) {
    return 'メンバーがいません';
  }
  const strMembers = members?.map((m) => m.lastName + m.firstName).join();
  return strMembers;
};
