import React, {useMemo} from 'react';
import {Div, Text} from 'react-native-magnus';
import {useNavigation} from '@react-navigation/native';
import PortalLinkBox from '../PortalLinkBox';
import {useAdminHeaderTab} from '../../contexts/admin/useAdminHeaderTab';
import {UserRole} from '../../types';
import {useAuthenticate} from '../../contexts/useAuthenticate';

export type HeaderWithTextButtonProps = HeaderTemplateProps & {
  rightButtonName?: string;
  onPressRightButton?: () => void;
};

const HeaderWithPortalLinkBox: React.FC<HeaderWithTextButtonProps> = props => {
  const {rightButtonName, onPressRightButton} = props;
  const navigation = useNavigation<any>();
  const {user} = useAuthenticate();
  const isAdmin = user?.role === UserRole.ADMIN;
  const tabs = useAdminHeaderTab();
  console.log(tabs);
  const boolToDisplayRightButton = useMemo(() => {
    return rightButtonName && onPressRightButton;
  }, [onPressRightButton, rightButtonName]);
  if (!isAdmin) {
    return (
      <Div mt="lg" px={16}>
        <Text fontSize={24} m="lg" fontWeight="bold" numberOfLines={1}>
          管理
        </Text>
        <Div flexDir="row" mb={8}>
          <Div flex={1} mr={12}>
            <PortalLinkBox
              type="tag_admin"
              onPress={() =>
                navigation.navigate('AdminStack', {screen: 'TagAdmin'})
              }
            />
          </Div>
          <Div flex={1}>
            <PortalLinkBox
              type="user_tag_admin"
              onPress={() =>
                navigation.navigate('AdminStack', {screen: 'UserTagAdmin'})
              }
            />
          </Div>
        </Div>
      </Div>
    );
  } else {
    return (
      <Div mt="lg" px={16}>
        <Text fontSize={24} m="lg" fontWeight="bold" numberOfLines={1}>
          管理
        </Text>
        <Div flexDir="row" flexWrap="wrap" mb={8}>
          <Div flex={1} mr={12}>
            <PortalLinkBox
              type="user_admin"
              onPress={() =>
                navigation.navigate('AdminStack', {screen: 'UserAdmin'})
              }
            />
          </Div>
          <Div flex={1}>
            <PortalLinkBox
              type="user_registering_admin"
              onPress={() =>
                navigation.navigate('AdminStack', {
                  screen: 'UserRegisteringAdmin',
                })
              }
            />
          </Div>
        </Div>
        <Div flexDir="row" mb={8}>
          <Div flex={1} mr={12}>
            <PortalLinkBox
              type="tag_admin"
              onPress={() =>
                navigation.navigate('AdminStack', {screen: 'TagAdmin'})
              }
            />
          </Div>
          <Div flex={1}>
            <PortalLinkBox
              type="user_tag_admin"
              onPress={() =>
                navigation.navigate('AdminStack', {screen: 'UserTagAdmin'})
              }
            />
          </Div>
        </Div>
      </Div>
    );
  }
};

export default HeaderWithPortalLinkBox;
