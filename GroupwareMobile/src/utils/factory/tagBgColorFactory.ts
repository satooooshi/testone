import {TagType} from '../../types';

export const tagBgColorFactory = (type: TagType): string => {
  switch (type) {
    case TagType.TECH:
      return 'green100';
    case TagType.QUALIFICATION:
      return 'blue100';
    case TagType.CLUB:
      return 'yellow200';
    case TagType.HOBBY:
      return 'pink200';
    case TagType.OTHER:
      return 'orange100';
  }
};
