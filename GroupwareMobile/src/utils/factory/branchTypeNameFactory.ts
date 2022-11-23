import {BranchType} from '../../types';

export const branchTypeNameFactory = (role: BranchType): string => {
  switch (role) {
    case BranchType.TOKYO:
      return '東京';
    case BranchType.OSAKA:
      return '大阪';
    case BranchType.NON_SET:
      return '未設定';
  }
};
