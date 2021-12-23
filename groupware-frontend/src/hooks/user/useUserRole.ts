import { useState } from 'react';
import { UserRoleInApp, User } from 'src/types';

export const useUserRole = (
  alreadySelectedUserRole?: UserRoleInApp,
  users?: User[],
) => {
  const [selectedUserRole, setSelectedUserRole] = useState<UserRoleInApp>(
    alreadySelectedUserRole || 'All',
  );

  const filteredUsers =
    selectedUserRole !== 'All'
      ? users?.filter((u) => u.role === selectedUserRole)
      : users;

  const selectUserRole = (userRole: UserRoleInApp) => {
    setSelectedUserRole(userRole);
  };

  return {
    selectedUserRole,
    selectUserRole,
    filteredUsers,
  };
};
