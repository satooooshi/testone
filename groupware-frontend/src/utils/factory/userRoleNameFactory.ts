import { UserRole } from 'src/types';

export const userRoleNameFactory = (role: UserRole): string => {
  switch (role) {
    case UserRole.ADMIN:
      return '管理者';
    case UserRole.COMMON:
      return 'ファン';
    case UserRole.INFLUENCER:
      return 'インフルエンサー';
  }
};
