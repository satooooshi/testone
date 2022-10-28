export const selectUserColumns = (alias: string) => {
  return [
    alias + '.id',
    alias + '.firstName',
    alias + '.lastName',
    alias + '.avatarUrl',
    alias + '.existence',
  ];
};
