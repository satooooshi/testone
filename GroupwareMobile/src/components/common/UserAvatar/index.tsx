import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {TouchableHighlight} from 'react-native';
import {Image} from 'react-native-magnus';
import {User} from '../../../types';

type UserAvatarProps = {
  user?: Partial<User>;
  h: number | string;
  w: number | string;
};

const UserAvatar: React.FC<UserAvatarProps> = ({user, h, w}) => {
  const navigation = useNavigation<any>();
  return (
    <TouchableHighlight
      underlayColor="none"
      onPress={() =>
        navigation.navigate('UserListStack', {
          screen: 'AccountDetail',
          params: {id: user?.id},
        })
      }>
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

export default UserAvatar;
