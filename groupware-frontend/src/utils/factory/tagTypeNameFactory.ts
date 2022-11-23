import { TagType } from 'src/types';

export const tagTypeNameFactory = (tagType: TagType): string => {
  switch (tagType) {
    case TagType.TECH:
      return '技術';
    case TagType.QUALIFICATION:
      return '資格';
    case TagType.CLUB:
      return '部活動';
    case TagType.HOBBY:
      return '趣味';
    default:
      return 'その他';
  }
};
