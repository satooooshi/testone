import { UserRole } from 'src/types';

export const userRoleNameToValue = (name: string) => {
  switch (name) {
    case '管理者':
      return UserRole.ADMIN;
    case '一般社員':
      return UserRole.COMMON;
    case 'コーチ':
      return UserRole.COACH;
    case '講師(社員)':
      return UserRole.INTERNAL_INSTRUCTOR;
    case '講師(外部)':
      return UserRole.EXTERNAL_INSTRUCTOR;
    default:
      return undefined;
  }
};

export const userRoleValueToName = (value: string | undefined) => {
  switch (value) {
    case UserRole.ADMIN:
      return '管理者';
    case UserRole.COMMON:
      return '一般社員';
    case UserRole.COACH:
      return 'コーチ';
    case UserRole.INTERNAL_INSTRUCTOR:
      return '講師(社員)';
    case UserRole.EXTERNAL_INSTRUCTOR:
      return '講師(外部)';
    default:
      return '全て';
  }
};
