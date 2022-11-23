import { UserRole } from 'src/types';

export const userRoleNameToValue = (name: string) => {
  switch (name) {
    case '管理者':
      return UserRole.ADMIN;
    case 'ファン':
      return UserRole.COMMON;
    case 'インフルエンサー':
      return UserRole.INFLUENCER;
    default:
      return undefined;
  }
};

export const userRoleValueToName = (value: string | undefined) => {
  switch (value) {
    case UserRole.ADMIN:
      return '管理者';
    case UserRole.COMMON:
      return 'ファン';
    case UserRole.INFLUENCER:
      return 'インフルエンサー';
    default:
      return '全て';
  }
};
