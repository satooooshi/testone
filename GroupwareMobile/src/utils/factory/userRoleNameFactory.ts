import {UserRole, UserRoleInApp} from '../../types';

export const userRoleNameFactory = (role: UserRoleInApp): string => {
  switch (role) {
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
