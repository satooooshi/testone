import { ThemeTypings } from '@chakra-ui/react';
import { TagType } from 'src/types';

export const tagColorFactory = (
  type: TagType,
): ThemeTypings['colorSchemes'] => {
  switch (type) {
    case TagType.TECH:
      return 'teal';
    case TagType.QUALIFICATION:
      return 'blue';
    case TagType.CLUB:
      return 'green';
    case TagType.HOBBY:
      return 'pink';
    case TagType.OTHER:
      return 'orange';
  }
};
