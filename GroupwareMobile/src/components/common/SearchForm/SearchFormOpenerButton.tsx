import React from 'react';
import {Button, ButtonProps, Icon} from 'react-native-magnus';

type SearchFormOpenerButtonProps = ButtonProps & {
  onPress: () => void;
};

const SearchFormOpenerButton: React.FC<SearchFormOpenerButtonProps> = props => {
  return (
    <Button
      bg="purple600"
      position="absolute"
      right={10}
      bottom={10}
      h={60}
      zIndex={20}
      rounded="circle"
      w={60}
      {...props}>
      <Icon
        color="white"
        fontFamily="FontAwesome5"
        fontSize="6xl"
        name="search"
      />
    </Button>
  );
};

export default SearchFormOpenerButton;
