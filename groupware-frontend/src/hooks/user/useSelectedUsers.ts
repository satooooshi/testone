import { useCallback, useEffect, useState } from 'react';
import { User } from 'src/types';

export const useSelectedUsers = (alreadySelectedUsers: Partial<User>[]) => {
  const [selectedUsers, setSelectedUsers] =
    useState<Partial<User>[]>(alreadySelectedUsers);

  const isSelected = useCallback(
    (targetUser: User): boolean => {
      return !!selectedUsers.filter((t) => t.id === targetUser.id).length;
    },
    [selectedUsers],
  );

  const toggleUser = useCallback((newSelectedUser: User) => {
    setSelectedUsers((users) => {
      const filteredSelectedUsersArr = users.filter(
        (t) => t.id === newSelectedUser.id,
      );
      if (filteredSelectedUsersArr.length) {
        return users.filter((t) => t.id !== newSelectedUser.id);
      }
      return [...users, newSelectedUser];
    });
  }, []);

  const clear = useCallback(() => {
    // setSelectedUsers(alreadySelectedUsers || []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    selectedUsers,
    setSelectedUsers,
    toggleUser,
    isSelected,
    clear,
  };
};
