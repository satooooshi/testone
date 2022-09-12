import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {TouchableHighlight, useWindowDimensions} from 'react-native';
import {Icon, Text} from 'react-native-magnus';
import tailwind from 'tailwind-rn';

type ShareButtonProps = {
  urlPath: string;
  text: string;
};

/**
 * Pass url path like
 * http://localhost:3000/event/{id}
 *
 * this component must be used in navigation container
 */

const ShareButton: React.FC<ShareButtonProps> = ({urlPath, text}) => {
  const navigation = useNavigation<any>();
  const onPress = () => {
    navigation.navigate('Share', {urlPath, text});
  };
  return (
    <TouchableHighlight
      underlayColor="none"
      onPress={onPress}
      style={{
        ...tailwind(
          'bg-white rounded-full justify-center items-center h-10 w-10 ml-3  px-2',
        ),
      }}>
      <>
        <Icon name="share" fontFamily="Entypo" fontSize={24} />
      </>
    </TouchableHighlight>
  );
};

export default ShareButton;
