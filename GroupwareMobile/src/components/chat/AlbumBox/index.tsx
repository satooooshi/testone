import React from 'react';
import {TouchableHighlight, useWindowDimensions} from 'react-native';
import {Button, Div, Icon, Image, Text} from 'react-native-magnus';
import {ChatAlbum} from '../../../types';
import {darkFontColor} from '../../../utils/colors';

type AlbumBoxProps = {
  onPress: () => void;
  onPressDeleteButton: () => void;
  album: ChatAlbum;
};

const AlbumBox: React.FC<AlbumBoxProps> = ({
  onPress,
  album,
  onPressDeleteButton,
}) => {
  const {width: windowWidth} = useWindowDimensions();

  return (
    <TouchableHighlight underlayColor="none" onPress={onPress}>
      <Div bg="white" alignItems="center" py="lg">
        <Div w={windowWidth * 0.9}>
          <Div mb={'sm'}>
            {album?.images?.length ? (
              <Image
                alignSelf="center"
                rounded="md"
                source={{uri: album.images[0].imageURL}}
                w={'100%'}
                h={windowWidth * 0.9}
              />
            ) : (
              <Image
                rounded="md"
                source={require('../../../../assets/no-image.jpg')}
                w={'100%'}
                h={windowWidth * 0.9}
              />
            )}
          </Div>
          <Div flexDir="row" justifyContent="space-between">
            <Div maxW="80%">
              <Text fontWeight={'bold'} fontSize={18} mb="sm">
                {album.title}
              </Text>
              <Text fontSize={14} color={darkFontColor}>
                {album.images?.length || '0'}
              </Text>
            </Div>
            <Button
              bg="white"
              borderColor="red"
              borderWidth={1}
              rounded="circle"
              onPress={onPressDeleteButton}
              mr="sm">
              <Icon name="delete" fontSize={20} color="red" />
            </Button>
          </Div>
        </Div>
      </Div>
    </TouchableHighlight>
  );
};

export default AlbumBox;
