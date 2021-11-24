import React, {useMemo} from 'react';
import {Text, Div, Button, Icon} from 'react-native-magnus';
import {darkFontColor, blueColor} from '../../utils/colors';
import FastImage from 'react-native-fast-image';
import {FlatList, TouchableOpacity} from 'react-native';
import {headerStyles} from '../../styles/component/header.style';
import {DrawerActions, useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HeaderTemplate, {HeaderTemplateProps} from './HeaderTemplate';

export type Tab = {
  name: string;
  onPress: () => void;
  color?: string;
};

export type HeaderWithTextButtonProps = HeaderTemplateProps & {
  rightButtonName?: string;
  onPressRightButton?: () => void;
};

const HeaderWithTextButton: React.FC<HeaderWithTextButtonProps> = props => {
  const {
    title,
    activeTabName,
    tabs,
    rightButtonName,
    onPressRightButton,
    enableBackButton = false,
    screenForBack,
  } = props;
  const navigation = useNavigation();
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
