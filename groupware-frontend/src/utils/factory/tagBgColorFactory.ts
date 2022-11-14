import { ThemeTypings } from '@chakra-ui/react';
import { TagType } from 'src/types';

export const tagBgColorFactory = (type: TagType): ThemeTypings['colors'] => {
  switch (type) {
    case TagType.TECH:
      return 'green.50';
    case TagType.QUALIFICATION:
      return 'blue.50';
    case TagType.CLUB:
      return 'yellow.100';
    case TagType.HOBBY:
      return 'pink.50';
    case TagType.OTHER:
      return 'orange.100';
  }
};
