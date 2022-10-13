import {TagType, TagTypeInApp} from '../../../types';

export const tagTypeNameFactory = (tagType: TagTypeInApp): string => {
  switch (tagType) {
    case TagType.TECH:
      return '才能・スキル';
    case TagType.QUALIFICATION:
      return 'ジャンル';
    case TagType.CLUB:
      return '活動地域';
    case TagType.HOBBY:
      return '趣味';
    case TagType.OTHER:
      return 'その他';
    case 'All':
      return '全て';
  }
};
