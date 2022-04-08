import {useState} from 'react';
import {User} from '../../types';

export const useSelectedUsers = (alreadySelectedUsers?: Partial<User>[]) => {
  const [selectedUsers, setSelectedUsers] = useState<Partial<User>[]>(
    alreadySelectedUsers || [],
  );

  const isSelected = (targetUser: User): boolean => {
    return !!selectedUsers.filter(t => t.id === targetUser.id).length;
  };

  const toggleUser = (newSelectedUser: User) => {
    setSelectedUsers(users => {
      const filteredSelectedUsersArr = users.filter(
        t => t.id === newSelectedUser.id,
      );
      if (filteredSelectedUsersArr.length) {
        return users.filter(t => t.id !== newSelectedUser.id);
      }
      return [...users, newSelectedUser];
    });
  };

  const clear = () => {
    setSelectedUsers(alreadySelectedUsers || []);
  };

  return {
    selectedUsers,
    setSelectedUsers,
    toggleUser,
    isSelected,
    clear,
  };
};
