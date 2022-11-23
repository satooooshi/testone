import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {TouchableHighlight} from 'react-native';
import {Image} from 'react-native-magnus';
import {useAuthenticate} from '../../../contexts/useAuthenticate';
import {User} from '../../../types';

type UserAvatarProps = {
  user?: Partial<User>;
  h: number | string;
  w: number | string;
  onPress?: () => void;
  onCloseModal?: () => void;
  GoProfile?: boolean;
};

const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  h,
  w,
  onPress,
  onCloseModal,
  GoProfile,
}) => {
  const navigation = useNavigation<any>();
  const {user: mySelf} = useAuthenticate();
  return (
    <TouchableHighlight
      underlayColor="none"
      onPress={() => {
        if (onPress) {
          onPress();
          return;
        }
        if (onCloseModal) {
          onCloseModal();
        }
        if (GoProfile) {
          const routes = navigation.getState()?.routes;
          if (user?.id === mySelf?.id) {
            navigation.navigate('AccountStack', {
              screen: 'MyProfile',
              params: {
                id: user?.id,
                previousScreenName: routes[routes?.length - 1],
              },
              initial: false,
            });
          } else {
            navigation.navigate('UsersStack', {
              screen: 'AccountDetail',
              params: {
                id: user?.id,
                previousScreenName: routes[routes?.length - 1],
              },
              initial: false,
            });
          }
        }
      }}>
      <Image
        {...{h, w}}
        rounded="circle"
        source={
          !user?.existence
            ? require('../../../../assets/bold-mascot.png')
            : user?.avatarUrl
            ? {uri: user.avatarUrl}
            : require('../../../../assets/no-image-avatar.png')
        }
      />
    </TouchableHighlight>
  );
};

export default React.memo(UserAvatar, (prevProps, nextProps) => {
  return (
    prevProps.user?.id === nextProps.user?.id &&
    prevProps.user?.avatarUrl === nextProps.user?.avatarUrl
  );
});
