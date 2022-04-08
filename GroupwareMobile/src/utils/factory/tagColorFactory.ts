import {TagType} from '../../types';

export const tagColorFactory = (type: TagType): string => {
  switch (type) {
    case TagType.TECH:
      return 'teal';
    case TagType.QUALIFICATION:
      return 'blue700';
    case TagType.CLUB:
      return 'green700';
    case TagType.HOBBY:
      return 'pink600';
    case TagType.OTHER:
      return 'orange';
  }
};
