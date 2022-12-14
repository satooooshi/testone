import {useCallback, useState} from 'react';
import {User} from '../../types';

export const useSelectedUsers = (alreadySelectedUsers: Partial<User>[]) => {
  const [selectedUsers, setSelectedUsers] =
    useState<Partial<User>[]>(alreadySelectedUsers);

  const isSelected = useCallback(
    (targetUser: User): boolean => {
      return !!selectedUsers.filter(t => t.id === targetUser.id).length;
    },
    [selectedUsers],
  );

  const toggleUser = useCallback((newSelectedUser: User) => {
    setSelectedUsers(users => {
      const filteredSelectedUsersArr = users.filter(
        t => t.id === newSelectedUser.id,
      );
      if (filteredSelectedUsersArr.length) {
        return users.filter(t => t.id !== newSelectedUser.id);
      }
      return [...users, newSelectedUser];
    });
  }, []);

  const selectOwner = (newSelectedUser: User) => {
    const owner: Partial<User>[] = [];
    owner.push(newSelectedUser);
    setSelectedUsers(owner);
  };
  const clear = () => {
    setSelectedUsers(alreadySelectedUsers || []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  return {
    selectedUsers,
    setSelectedUsers,
    toggleUser,
    selectOwner,
    isSelected,
    clear,
  };
};
