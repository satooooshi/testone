import React from 'react';
import {Button, Icon} from 'react-native-magnus';

type DropdownOpenerButtonProps = {
  name: string;
  onPress: () => void;
};

const DropdownOpenerButton: React.FC<DropdownOpenerButtonProps> = ({
  name,
  onPress,
}) => {
  return (
    <Button
      block
      suffix={<Icon position="absolute" right={8} name="down" color="black" />}
      bg="white"
      borderWidth={1}
      borderColor={'#e0e0e0'}
      p={12}
      color="black"
      onPress={onPress}
      rounded="md">
      {name}
    </Button>
  );
};

export default DropdownOpenerButton;
