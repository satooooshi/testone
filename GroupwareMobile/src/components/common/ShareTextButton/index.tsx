import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {Button, Icon} from 'react-native-magnus';

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

const ShareTextButton: React.FC<ShareButtonProps> = ({urlPath, text}) => {
  const navigation = useNavigation<any>();
  const onPress = () => {
    navigation.navigate('Share', {urlPath, text});
  };
  return (
    <>
      <Button
        bg="white"
        color="black"
        borderWidth={1}
        borderColor="gray400"
        rounded={'xl'}
        suffix={
          <Icon
            ml="sm"
            name="share"
            fontSize={'lg'}
            color="black"
            fontFamily="FontAwesome"
          />
        }
        onPress={onPress}>
        チャットで共有
      </Button>
    </>
  );
};

export default ShareTextButton;
