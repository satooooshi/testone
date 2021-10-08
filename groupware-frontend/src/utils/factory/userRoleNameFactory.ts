import { UserRole } from 'src/types';

export const userRoleNameFactory = (role: UserRole): string => {
  switch (role) {
    case UserRole.ADMIN:
      return '管理者';
    case UserRole.COMMON:
      return '一般社員';
    case UserRole.INSTRUCTOR:
      return '講師';
    case UserRole.HEAD_OFFICE:
      return '本社勤務';
  }
};
