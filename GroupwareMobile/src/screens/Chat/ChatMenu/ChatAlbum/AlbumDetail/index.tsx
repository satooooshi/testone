import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, TouchableHighlight, useWindowDimensions} from 'react-native';
import {
  Button,
  Div,
  Icon,
  Image,
  Input,
  Modal,
  Text,
} from 'react-native-magnus';
import tailwind from 'tailwind-rn';
import HeaderWithTextButton from '../../../../../components/Header';
import WholeContainer from '../../../../../components/WholeContainer';
import {useAPIGetChatAlbumImages} from '../../../../../hooks/api/chat/album/useAPIGetChatAlbumImages';
import {ChatAlbumImage, ImageSource} from '../../../../../types';
import {
  ChatAlbumDetailNavigationProps,
  ChatAlbumDetailRouteProps,
} from '../../../../../types/navigator/drawerScreenProps';
import ImageView from 'react-native-image-viewing';
import {darkFontColor} from '../../../../../utils/colors';
import {useFormik} from 'formik';
import {useAPIUpdateAlbum} from '../../../../../hooks/api/chat/album/useAPIUpdateChatAlbum';
import FastImage from 'react-native-fast-image';

const AlbumDetail: React.FC = () => {
  const {width: windowWidth} = useWindowDimensions();
  const editorAvatarSize = 36;
  const [editModal, setEditModal] = useState(false);
  const imageWidth = windowWidth * 0.5;
  const [page, setPage] = useState(1);
  const {room, album: passedAlbum} =
    useRoute<ChatAlbumDetailRouteProps>().params;
  const [album, setAlbum] = useState(passedAlbum);
  const navigation = useNavigation<ChatAlbumDetailNavigationProps>();
  const [imagesForInfiniteScroll, setImagesForInfiniteScroll] = useState<
    ChatAlbumImage[]
  >([]);
  const [imageModal, setImageModal] = useState(false);
  const [nowImageIndex, setNowImageIndex] = useState<number>(0);
  const {mutate: updateAlbum} = useAPIUpdateAlbum({
    onSuccess: updatedRoom => {
      setAlbum(updatedRoom);
      setEditModal(false);
    },
  });
  const {data, refetch} = useAPIGetChatAlbumImages({
    roomId: room.id.toString(),
    albumId: album.id.toString(),
    page: page.toString(),
  });
  const {values, setValues, handleSubmit} = useFormik({
    initialValues: album,
    onSubmit: v => {
      updateAlbum(v);
    },
  });
  const images: ImageSource[] =
    imagesForInfiniteScroll?.map(i => ({uri: i.imageURL || ''})) || [];

  const onEndReached = () => {
    setPage(p => p + 1);
  };

  const handlePressImage = (url: string) => {
    const isNowUri = (element: ImageSource) => element.uri === url;
    setNowImageIndex(images.findIndex(isNowUri));
    setImageModal(true);
  };

  useFocusEffect(
    useCallback(() => {
      setImagesForInfiniteScroll([]);
      refetch();
    }, [refetch]),
  );

  useEffect(() => {
    if (data?.images?.length) {
      setImagesForInfiniteScroll(n => {
        if (
          n.length &&
          new Date(n[n.length - 1].createdAt) >
            new Date(data.images[0].createdAt)
        ) {
          return [...n, ...data?.images];
        }
        return data?.images;
      });
    }
  }, [data?.images]);

  return (
    <WholeContainer>
      <HeaderWithTextButton
        title={album.title}
        rightButtonName="タイトルを編集"
        onPressRightButton={() => setEditModal(true)}
      />
      <Modal isVisible={editModal} px={16} py={32} h={200}>
        <Button
          bg="gray400"
          h={35}
          w={35}
          position="absolute"
          right={-15}
          top={-45}
          rounded="circle"
          onPress={() => setEditModal(false)}>
          <Icon color="black" name="close" />
        </Button>
        <Text fontSize={16} mb="sm">
          タイトルを編集
        </Text>
        <Input
          fontSize={16}
          value={values.title}
          onChangeText={t => setValues(v => ({...v, title: t}))}
          autoCapitalize="none"
          bg="white"
          borderWidth={1}
          mb="lg"
        />
        <Button w={'100%'} bg="pink600" onPress={() => handleSubmit()}>
          変更
        </Button>
      </Modal>
      <ImageView
        animationType="slide"
        images={images}
        imageIndex={nowImageIndex}
        visible={imageModal}
        onRequestClose={() => setImageModal(false)}
        swipeToCloseEnabled={false}
        doubleTapToZoomEnabled={true}
      />
      <Button
        bg="purple600"
        position="absolute"
        right={10}
        bottom={10}
        h={60}
        zIndex={20}
        rounded="circle"
        onPress={() =>
          navigation.navigate('ChatStack', {
            screen: 'EditChatAlbum',
            params: {album, room},
          })
        }
        w={60}>
        <Icon
          fontSize={'6xl'}
          name="pluscircle"
          rounded="circle"
          color="purple600"
          bg="white"
        />
      </Button>
      <FlatList
        {...{onEndReached}}
        data={imagesForInfiniteScroll}
        ListHeaderComponent={
          <Div px={'lg'} mb={'lg'}>
            <Text fontSize={28} fontWeight="bold" mb="sm">
              {album.title}
            </Text>
            <Text color={darkFontColor} mb="lg">
              写真 {album.images?.length.toString() || '0'}
            </Text>
            <Div flexDir="row" flexWrap="wrap">
              {album.editors?.map((e, index) => (
                <Image
                  ml={index >= 1 ? -8 : undefined}
                  source={{uri: e.avatarUrl}}
                  h={editorAvatarSize}
                  w={editorAvatarSize}
                  borderWidth={1}
                  borderColor={'white'}
                  rounded="circle"
                />
              ))}
              {album.editors?.length && (
                <Div
                  ml={-8}
                  justifyContent="center"
                  alignItems="center"
                  bg="white"
                  rounded="circle"
                  h={editorAvatarSize}
                  w={editorAvatarSize}>
                  <Text color={'blue700'} fontSize={16}>
                    {album.editors?.length.toString()}
                  </Text>
                </Div>
              )}
            </Div>
          </Div>
        }
        numColumns={2}
        renderItem={({item: i}) => (
          <TouchableHighlight
            style={tailwind('border border-white')}
            underlayColor="none"
            onPress={() => handlePressImage(i.imageURL)}>
            <FastImage
              style={{width: imageWidth, height: imageWidth}}
              source={{uri: i.imageURL}}
            />
          </TouchableHighlight>
        )}
      />
    </WholeContainer>
  );
};

export default AlbumDetail;
