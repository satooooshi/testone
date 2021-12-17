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
  const windowWidth = useWindowDimensions().width;
  const onPress = () => {
    navigation.navigate('Share', {urlPath, text});
  };
  return (
    <TouchableHighlight
      underlayColor="none"
      onPress={onPress}
      style={{
        ...tailwind(
          'bg-white rounded-md justify-center items-center w-28 h-16',
        ),
        width: windowWidth * 0.3,
      }}>
      <>
        <Icon name="share" fontFamily="MaterialCommunityIcons" fontSize={24} />
        <Text color="blue800">チャットで共有</Text>
      </>
    </TouchableHighlight>
  );
};

export default ShareButton;
