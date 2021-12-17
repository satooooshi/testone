import {AxiosError} from 'axios';
import {useFormik} from 'formik';
import React, {useState} from 'react';
import {TextInput, TouchableHighlight} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Button, Div, Icon, Image} from 'react-native-magnus';
import {UseMutateFunction} from 'react-query';
import tailwind from 'tailwind-rn';
import HeaderWithTextButton from '../../../../components/Header';
import WholeContainer from '../../../../components/WholeContainer';
import {
  ChatGroup,
  ChatNote,
  ChatNoteImage,
  ImageSource,
} from '../../../../types';
import {uploadImageFromGallery} from '../../../../utils/cropImage/uploadImageFromGallery';
import ImageView from 'react-native-image-viewing';
import DownloadIcon from '../../../../components/common/DownLoadIcon';

type ChatNoteFormProps = {
  rightButtonNameOnHeader: string;
  room: ChatGroup;
  note?: ChatNote | Partial<ChatNote>;
  onSubmit: (note: Partial<ChatNote> | ChatNote) => void;
  onUploadImage: UseMutateFunction<string[], AxiosError, FormData>;
};

const ChatNoteForm: React.FC<ChatNoteFormProps> = ({
  rightButtonNameOnHeader,
  room,
  note,
  onSubmit,
  onUploadImage,
}) => {
  const [imageModal, setImageModal] = useState(false);
  const [nowImageIndex, setNowImageIndex] = useState<number>(0);
  const initialValues: Partial<ChatNote> = {
    content: '',
    chatGroup: room,
    editors: [],
    images: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const {values, setValues, handleSubmit} = useFormik<
    ChatNote | Partial<ChatNote>
  >({
    initialValues: note || initialValues,
    onSubmit: submittedValues => onSubmit(submittedValues),
  });
  const images: ImageSource[] =
    values.images?.map(i => ({uri: i.imageURL || ''})) || [];

  const removeImage = (image: Partial<ChatNoteImage>) => {
    if (!image.imageURL) {
      return;
    }
    setValues(v => ({
      ...v,
      images: v.images?.filter(i => i.imageURL !== image.imageURL) || [],
    }));
  };

  const handlePressImage = (url: string) => {
    const isNowUri = (element: ImageSource) => element.uri === url;
    setNowImageIndex(images.findIndex(isNowUri));
    setImageModal(true);
  };

  const handlePressImageButton = async () => {
    const {formData} = await uploadImageFromGallery();
    if (formData) {
      onUploadImage(formData, {
        onSuccess: imageURLs => {
          const newImage: Partial<ChatNoteImage> = {
            imageURL: imageURLs[0],
          };
          setValues(v => ({
            ...v,
            images: v.images?.length ? [...v.images, newImage] : [newImage],
          }));
        },
      });
    }
  };

  return (
    <WholeContainer>
      <HeaderWithTextButton
        title="ノート"
        rightButtonName={rightButtonNameOnHeader}
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
      <KeyboardAwareScrollView
        contentContainerStyle={tailwind('h-full bg-white')}
        style={tailwind('h-full bg-white')}>
        <Div flexDir="row" flexWrap="wrap">
          {values.images?.map(i => (
            <TouchableHighlight
              underlayColor="none"
              style={tailwind('relative')}
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
                  h={96}
                  w={96}
                  source={{uri: i.imageURL}}
                  borderWidth={1}
                  borderColor="white"
                />
              </>
            </TouchableHighlight>
          ))}
        </Div>
        <TextInput
          multiline
          placeholder="今なにしてる？"
          value={values.content}
          onChangeText={t => setValues(v => ({...v, content: t}))}
          style={tailwind(' h-full p-2')}
          autoCapitalize={'none'}
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

export default ChatNoteForm;
