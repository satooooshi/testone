import {TagType} from '../../types';

export const tagFontColorFactory = (type: TagType): string => {
  switch (type) {
    case TagType.TECH:
      return 'green600';
    case TagType.QUALIFICATION:
      return 'blue600';
    case TagType.CLUB:
      return 'yellow600';
    case TagType.HOBBY:
      return 'pink600';
    case TagType.OTHER:
      return 'orange600';
  }
};
