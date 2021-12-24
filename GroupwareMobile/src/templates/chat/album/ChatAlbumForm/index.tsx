import React, {useState} from 'react';
import HeaderWithTextButton from '../../../../components/Header';
import WholeContainer from '../../../../components/WholeContainer';
import {
  ChatAlbum,
  ChatAlbumImage,
  ChatGroup,
  ImageSource,
} from '../../../../types';
import ImageView from 'react-native-image-viewing';
import {UseMutateFunction} from 'react-query';
import {AxiosError} from 'axios';
import {useFormik} from 'formik';
import {Alert, TouchableHighlight, useWindowDimensions} from 'react-native';
import {uploadImageFromGallery} from '../../../../utils/cropImage/uploadImageFromGallery';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {
  Button,
  Div,
  Icon,
  Image,
  Input,
  Overlay,
  Text,
} from 'react-native-magnus';
import tailwind from 'tailwind-rn';
import {dateTimeFormatterFromJSDDate} from '../../../../utils/dateTimeFormatterFromJSDate';
import DownloadIcon from '../../../../components/common/DownLoadIcon';
import {ActivityIndicator} from 'react-native-paper';
import {albumSchema} from '../../../../utils/validation/schema';

type ChatAlbumFormProps = {
  album?: ChatAlbum;
  room: ChatGroup;
  onSubmit: (values: ChatAlbum | Partial<ChatAlbum>) => void;
  uploadImage: UseMutateFunction<string[], AxiosError, FormData, unknown>;
};

const ChatAlbumForm: React.FC<ChatAlbumFormProps> = ({
  album,
  room,
  onSubmit,
  uploadImage,
}) => {
  const initialValues: Partial<ChatAlbum> = {
    title: '',
    images: [],
    chatGroup: room,
  };
  const {width: windowWidth} = useWindowDimensions();
  const [imageModal, setImageModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [nowImageIndex, setNowImageIndex] = useState<number>(0);
  const {values, setValues, handleSubmit, errors, touched} = useFormik<
    ChatAlbum | Partial<ChatAlbum>
  >({
    initialValues: album || initialValues,
    validationSchema: albumSchema,
    onSubmit: submittedValues => onSubmit(submittedValues),
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
      multiple: true,
      maxFiles: 300,
    });
    if (formData) {
      setUploading(true);
      uploadImage(formData, {
        onSuccess: imageURLs => {
          setUploading(false);
          const newImages: Partial<ChatAlbumImage>[] = imageURLs.map(u => ({
            imageURL: u,
          }));
          setValues(v => ({
            ...v,
            images: v.images?.length ? [...v.images, ...newImages] : newImages,
          }));
        },
        onError: () => {
          Alert.alert(
            'アップロード中にエラーが発生しました。\n時間をおいて再度実行してください。',
          );
        },
      });
    }
  };

  const removeImage = (image: Partial<ChatAlbumImage>) => {
    if (!image.imageURL) {
      return;
    }
    setValues(v => ({
      ...v,
      images: v.images?.filter(i => i.imageURL !== image.imageURL) || [],
    }));
  };

  return (
    <WholeContainer>
      <Overlay visible={uploading} p="xl">
        <ActivityIndicator />
      </Overlay>
      <HeaderWithTextButton
        title="アルバム"
        enableBackButton={true}
        rightButtonName={album ? '更新' : '投稿'}
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
        FooterComponent={({imageIndex}) => (
          <Div position="absolute" bottom={5} right={5}>
            <DownloadIcon url={images[imageIndex].uri} />
          </Div>
        )}
      />
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
        <Icon fontSize={'6xl'} name="image" fontFamily="Entypo" color="white" />
      </Button>
      <KeyboardAwareScrollView style={tailwind('h-full bg-white')}>
        <Text fontWeight="bold" mb="sm">
          アルバム名
        </Text>
        {errors.title && touched.title ? (
          <Text mb="sm" color="tomato">
            {errors.title}
          </Text>
        ) : null}
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
        {errors.images && touched.images ? (
          <Text mb="sm" color="tomato">
            {errors.images}
          </Text>
        ) : null}
        <Div flexDir="row" flexWrap="wrap" w={windowWidth}>
          {values.images?.map(i => (
            <TouchableHighlight
              key={i.id}
              underlayColor="none"
              onPress={() => i.imageURL && handlePressImage(i.imageURL)}>
              <>
                <Button
                  position="absolute"
                  zIndex={100}
                  top={-16}
                  right={-16}
                  bg="transparent"
                  onPress={() => removeImage(i)}>
                  <Icon name="close" color="white" fontSize={32} />
                </Button>
                <Image
                  source={{uri: i.imageURL}}
                  w={windowWidth / 3}
                  h={windowWidth / 3}
                  borderWidth={0.5}
                  borderColor={'white'}
                />
              </>
            </TouchableHighlight>
          ))}
        </Div>
      </KeyboardAwareScrollView>
    </WholeContainer>
  );
};

export default ChatAlbumForm;
