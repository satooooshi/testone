import {TagType, TagTypeInApp} from '../../../types';

export const tagTypeNameFactory = (tagType: TagTypeInApp): string => {
  switch (tagType) {
    case TagType.TECH:
      return '技術';
    case TagType.QUALIFICATION:
      return '資格';
    case TagType.CLUB:
      return '部活動';
    case TagType.HOBBY:
      return '趣味';
    case TagType.OTHER:
      return '趣味';
    case 'All':
      return '全て';
  }
};
