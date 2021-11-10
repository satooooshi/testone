import React, {useMemo} from 'react';
import {Text, Div, Button, Icon} from 'react-native-magnus';
import {darkFontColor, blueColor} from '../../utils/colors';
import FastImage from 'react-native-fast-image';
import {FlatList, TouchableOpacity} from 'react-native';
import {headerStyles} from '../../styles/component/header.style';
import {DrawerActions, useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export type Tab = {
  name: string;
  onPress: () => void;
  color?: string;
};

export type AppHeaderProps = {
  title: string;
  activeTabName?: string;
  tabs?: Tab[];
  rightButtonName?: string;
  onPressRightButton?: () => void;
  enableBackButton?: boolean;
};

const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  activeTabName,
  tabs,
  rightButtonName,
  onPressRightButton,
  enableBackButton = false,
}) => {
  const navigation = useNavigation();
  const boolToDisplayRightButton = useMemo(() => {
    return rightButtonName && onPressRightButton;
  }, [onPressRightButton, rightButtonName]);
  return (
    <>
      <Div
        h={48}
        bg="#ececec"
        py="xs"
        px="lg"
        row
        justifyContent="space-between">
        <Div h="100%" row alignItems="center">
          {enableBackButton && (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="left" fontSize={26} mr={4} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}>
            <Ionicons name="menu-outline" size={26} />
          </TouchableOpacity>
          <FastImage
            style={headerStyles.logoImage}
            resizeMode="contain"
            source={require('../../../assets/bold-logo.png')}
          />
          <Text fontSize={20} ml="lg" fontWeight="bold" color={darkFontColor}>
            {title}
          </Text>
        </Div>
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
      </Div>
      {tabs && tabs.length ? (
        <Div h={48} bg="white" py="xs" px="xs" row alignItems="center">
          <FlatList
            style={headerStyles.tabList}
            data={tabs}
            horizontal
            renderItem={({item: t}) => (
              <Button
                alignSelf="center"
                h={32}
                py={0}
                px={10}
                onPress={t.onPress}
                bg="transparent"
                fontWeight="bold"
                color={activeTabName === t.name ? blueColor : darkFontColor}>
                {t.name}
              </Button>
            )}
          />
        </Div>
      ) : null}
    </>
  );
};

export default AppHeader;
