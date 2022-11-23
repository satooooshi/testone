import { BranchType } from 'src/types';

export const branchTypeNameFactory = (role: BranchType): string => {
  switch (role) {
    case BranchType.ARTIST:
      return 'アーティスト';
    case BranchType.IDOL:
      return 'アイドル';
    case BranchType.YOUTUBER:
      return 'YouTuber';
    case BranchType.TIKTOKER:
      return 'TikToker';
    case BranchType.INSTAGRAMER:
      return 'インスタグラマー';
    case BranchType.TALENT:
      return 'タレント';
    case BranchType.OTHER:
      return 'その他';
    case BranchType.NON_SET:
      return '未設定';
  }
};
