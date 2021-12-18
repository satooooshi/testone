import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {TouchableHighlight} from 'react-native';
import {Image} from 'react-native-magnus';
import {User} from '../../../types';

type UserAvatarProps = {
  user: User;
  h: number;
  w: number;
};

const UserAvatar: React.FC<UserAvatarProps> = ({user, h, w}) => {
  const navigation = useNavigation<any>();
  return (
    <TouchableHighlight
      onPress={() =>
        navigation.navigate('AccountStack', {
          screen: 'AccountDetail',
          params: {id: user.id},
        })
      }>
      <Image
        {...{h, w}}
        rounded="circle"
        source={
          !user.existence
            ? require('../../../../assets/bold-mascot.png')
            : user.avatarUrl
            ? {uri: user.avatarUrl}
            : require('../../../../assets/no-image-avatar.png')
        }
      />
    </TouchableHighlight>
  );
};

export default UserAvatar;
