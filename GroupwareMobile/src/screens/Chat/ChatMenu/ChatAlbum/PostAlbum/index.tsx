import {useNavigation, useRoute} from '@react-navigation/native';
import {useFormik} from 'formik';
import React, {useState} from 'react';
import HeaderWithTextButton from '../../../../../components/Header';
import WholeContainer from '../../../../../components/WholeContainer';
import {useAPICreateChatAlbum} from '../../../../../hooks/api/chat/album/useAPICreateChatAlbum';
import {useAPIGetChatAlbumImages} from '../../../../../hooks/api/chat/album/useAPIGetChatAlbumImages';
import {useAPIUploadStorage} from '../../../../../hooks/api/storage/useAPIUploadStorage';
import {ChatAlbum, ChatAlbumImage, ImageSource} from '../../../../../types';
import {
  ChatRouteProps,
  PostChatAlbumsNavigationProps,
} from '../../../../../types/navigator/drawerScreenProps';
import {uploadImageFromGallery} from '../../../../../utils/cropImage/uploadImageFromGallery';
import ImageView from 'react-native-image-viewing';
import tailwind from 'tailwind-rn';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Button, Div, Icon, Image, Input, Text} from 'react-native-magnus';
import {TouchableHighlight, useWindowDimensions} from 'react-native';
import {dateTimeFormatterFromJSDDate} from '../../../../../utils/dateTimeFormatterFromJSDate';

const PostChatAlbum: React.FC = () => {
  const {mutate: createChatAlbum} = useAPICreateChatAlbum();
  const {width: windowWidth} = useWindowDimensions();
  const navigation = useNavigation<PostChatAlbumsNavigationProps>();
  const {mutate: onUploadImage} = useAPIUploadStorage();
  const {room} = useRoute<ChatRouteProps>().params;
  const [imageModal, setImageModal] = useState(false);
  const [nowImageIndex, setNowImageIndex] = useState<number>(0);
  const initialValues: Partial<ChatAlbum> = {
    title: '',
    images: [],
    chatGroup: room,
  };
  const {values, setValues, handleSubmit} = useFormik<
    ChatAlbum | Partial<ChatAlbum>
  >({
    initialValues: initialValues,
    onSubmit: submittedValues =>
      createChatAlbum(submittedValues, {
        onSuccess: () =>
          navigation.navigate('ChatStack', {
            screen: 'ChatAlbums',
            params: {room},
          }),
      }),
  });
  const images: ImageSource[] =
    values.images?.map(i => ({uri: i.imageURL || ''})) || [];

  const handlePressImage = (url: string) => {
    const isNowUri = (element: ImageSource) => element.uri === url;
    setNowImageIndex(images.findIndex(isNowUri));
    setImageModal(true);
  };

  const handlePressImageButton = async () => {
    const {formData} = await uploadImageFromGallery({
      cropping: true,
      mediaType: 'photo',
      multiple: false,
    });
    if (formData) {
      onUploadImage(formData, {
        onSuccess: imageURLs => {
          const newImages: Partial<ChatAlbumImage>[] = imageURLs.map(u => ({
            imageURL: u,
          }));
          setValues(v => ({
            ...v,
            images: v.images?.length ? [...v.images, ...newImages] : newImages,
          }));
        },
      });
    }
  };
  return (
    <WholeContainer>
      <HeaderWithTextButton
        title="アルバム"
        rightButtonName="投稿"
        onPressRightButton={() => handleSubmit()}
      />
      <ImageView
        animationType="slide"
        images={images}
        imageIndex={nowImageIndex}
        visible={imageModal}
        onRequestClose={() => setImageModal(false)}
        swipeToCloseEnabled={false}
        doubleTapToZoomEnabled={true}
      />
      <KeyboardAwareScrollView
        contentContainerStyle={tailwind('h-full bg-white')}
        style={tailwind('h-full bg-white')}>
        <Text fontWeight="bold" mb="sm">
          アルバム名
        </Text>
        <Input
          autoCapitalize="none"
          fontWeight="bold"
          fontSize={20}
          mb={'lg'}
          h={64}
          value={values.title}
          placeholder={dateTimeFormatterFromJSDDate({
            dateTime: new Date(),
            format: 'yyyy/LL/dd',
          })}
          onChangeText={t => setValues(v => ({...v, title: t}))}
        />
        <Div flexDir="row" flexWrap="wrap" w={windowWidth}>
          {values.images?.map(i => (
            <TouchableHighlight
              underlayColor="none"
              onPress={() => i.imageURL && handlePressImage(i.imageURL)}>
              <Image
                source={{uri: i.imageURL}}
                w={windowWidth / 3}
                h={windowWidth / 3}
                borderWidth={0.5}
                borderColor={'white'}
              />
            </TouchableHighlight>
          ))}
        </Div>
        <Button
          bg="purple600"
          position="absolute"
          right={10}
          bottom={10}
          h={60}
          zIndex={20}
          rounded="circle"
          onPress={handlePressImageButton}
          w={60}>
          <Icon
            fontSize={'6xl'}
            name="image"
            fontFamily="Entypo"
            color="white"
          />
        </Button>
      </KeyboardAwareScrollView>
    </WholeContainer>
  );
};

export default PostChatAlbum;
