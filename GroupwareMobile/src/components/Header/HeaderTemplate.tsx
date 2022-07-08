import React from 'react';
import {Text, Div, Button, Icon} from 'react-native-magnus';
import {darkFontColor, blueColor} from '../../utils/colors';
import FastImage from 'react-native-fast-image';
import {FlatList, TouchableHighlight, TouchableOpacity} from 'react-native';
import {headerStyles} from '../../styles/component/header.style';
import {DrawerActions, useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {RootStackParamList} from '../../types/navigator/RootStackParamList';

export type Tab = {
  name: string;
  onPress: () => void;
  color?: string;
  borderBottomColor?: string;
};

export type HeaderTemplateProps = {
  title: string;
  activeTabName?: string;
  tabs?: Tab[];
  enableBackButton?: boolean;
  screenForBack?: keyof RootStackParamList;
};

/**
 * this component is header template to customize
 * children can custmize right contents in top of header
 */

const HeaderTemplate: React.FC<HeaderTemplateProps> = ({
  title,
  activeTabName,
  tabs,
  enableBackButton = false,
  screenForBack,
  children,
}) => {
  const navigation = useNavigation();
  return (
    <>
      <Div
        h={48}
        bg="white"
        py="xs"
        px="lg"
        flexDir="row"
        justifyContent="center"
        alignItems="center">
        {enableBackButton && (
          <Div position="absolute" left={10}>
            <TouchableOpacity
              onPress={() => {
                if (screenForBack) {
                  navigation.goBack();
                  navigation.navigate(screenForBack as any);
                } else {
                  navigation.goBack();
                }
              }}>
              <Icon name="left" fontSize={26} mr={4} />
            </TouchableOpacity>
          </Div>
        )}
        {/* ハンバーガーメニュー */}
        {/* <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}>
            <Ionicons name="menu-outline" size={26} />
          </TouchableOpacity> */}
        {/* <TouchableHighlight
            onPress={() => navigation.navigate('Home' as any)}
            underlayColor="none">
            <FastImage
              style={headerStyles.logoImage}
              resizeMode="contain"
              source={require('../../../assets/bold-logo.png')}
            />
          </TouchableHighlight> */}
        <Text
          fontSize={16}
          mx="auto"
          fontWeight="bold"
          color={darkFontColor}
          numberOfLines={1}>
          {title}
        </Text>
        {children}
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
                bg={t.name === activeTabName ? 'blue100' : 'transparent'}
                fontWeight="bold"
                borderBottomWidth={t.borderBottomColor ? 2 : undefined}
                borderBottomColor={t.borderBottomColor}
                color={
                  t.color
                    ? t.color
                    : activeTabName === t.name
                    ? blueColor
                    : darkFontColor
                }>
                {t.name}
              </Button>
            )}
          />
        </Div>
      ) : null}
    </>
  );
};

export default HeaderTemplate;
