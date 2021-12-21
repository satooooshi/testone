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
        bg="#ececec"
        py="xs"
        px="lg"
        row
        justifyContent="space-between">
        <Div h="100%" row alignItems="center">
          {enableBackButton && (
            <TouchableOpacity
              onPress={() => {
                if (screenForBack) {
                  navigation.navigate(screenForBack as any);
                } else {
                  navigation.goBack();
                }
              }}>
              <Icon name="left" fontSize={26} mr={4} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}>
            <Ionicons name="menu-outline" size={26} />
          </TouchableOpacity>
          <TouchableHighlight
            onPress={() => navigation.navigate('Home' as any)}
            underlayColor="none">
            <FastImage
              style={headerStyles.logoImage}
              resizeMode="contain"
              source={require('../../../assets/bold-logo.png')}
            />
          </TouchableHighlight>
          <Text
            fontSize={16}
            ml="lg"
            fontWeight="bold"
            color={darkFontColor}
            w="50%"
            numberOfLines={1}>
            {title}
          </Text>
        </Div>
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
