import {DropdownProps} from 'react-native-magnus';
import {DropdownOptionProps} from 'react-native-magnus/lib/typescript/src/ui/dropdown/dropdown.option.type';

export const defaultDropdownProps: Partial<DropdownProps> = {
  m: 'md',
  pb: 'md',
  showSwipeIndicator: false,
  roundedTop: 'xl',
};
export const defaultDropdownOptionProps: Partial<DropdownOptionProps> = {
  bg: 'gray100',
  color: 'blue600',
  py: 'lg',
  px: 'xl',
  borderBottomWidth: 1,
  borderBottomColor: 'gray200',
  justifyContent: 'center',
  roundedTop: 'lg',
};
