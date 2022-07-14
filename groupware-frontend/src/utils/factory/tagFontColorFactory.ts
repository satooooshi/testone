import { ThemeTypings } from '@chakra-ui/react';
import { TagType } from 'src/types';

export const tagFontColorFactory = (type: TagType): ThemeTypings['colors'] => {
  switch (type) {
    case TagType.TECH:
      return 'green.600';
    case TagType.QUALIFICATION:
      return 'blue.600';
    case TagType.CLUB:
      return 'yellow.500';
    case TagType.HOBBY:
      return 'pink.500';
    case TagType.OTHER:
      return 'orange.500';
  }
};
