import {UserRole} from '../../types';

export const userRoleNameFactory = (role: UserRole): string => {
  switch (role) {
    case UserRole.ADMIN:
      return '管理者';
    case UserRole.COMMON:
      return '一般社員';
    case UserRole.EXTERNAL_INSTRUCTOR:
      return '講師(外部)';
    case UserRole.INTERNAL_INSTRUCTOR:
      return '講師(社員)';
    case UserRole.COACH:
      return 'コーチ';
  }
};
