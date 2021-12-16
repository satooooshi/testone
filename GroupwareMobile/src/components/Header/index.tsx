import React, {useMemo} from 'react';
import {Button} from 'react-native-magnus';
import {blueColor} from '../../utils/colors';
import HeaderTemplate, {HeaderTemplateProps} from './HeaderTemplate';

export type HeaderWithTextButtonProps = HeaderTemplateProps & {
  rightButtonName?: string;
  onPressRightButton?: () => void;
};

const HeaderWithTextButton: React.FC<HeaderWithTextButtonProps> = props => {
  const {rightButtonName, onPressRightButton} = props;
  const boolToDisplayRightButton = useMemo(() => {
    return rightButtonName && onPressRightButton;
  }, [onPressRightButton, rightButtonName]);
  return (
    <HeaderTemplate {...props}>
      {boolToDisplayRightButton && (
        <Button
          alignSelf="center"
          h={32}
          fontSize={16}
          py={0}
          px={10}
          onPress={onPressRightButton}
          bg={blueColor}
          color="white">
          {rightButtonName}
        </Button>
      )}
    </HeaderTemplate>
  );
};

export default HeaderWithTextButton;
