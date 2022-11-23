import { TagType } from 'src/types';

export const tagTypeNameFactory = (tagType: TagType): string => {
  switch (tagType) {
    case TagType.TECH:
      return '才能・スキル';
    case TagType.QUALIFICATION:
      return 'ジャンル';
    case TagType.CLUB:
      return '活動地域';
    case TagType.HOBBY:
      return '趣味';
    default:
      return 'その他';
  }
};
