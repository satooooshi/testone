import {AxiosError} from 'axios';
import {useFormik} from 'formik';
import React, {useEffect, useState} from 'react';
import {Alert, TextInput, TouchableHighlight} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Button, Div, Icon, Image, Text} from 'react-native-magnus';
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
import {noteSchema} from '../../../../utils/validation/schema';

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
  const [willSubmit, setWillSubmit] = useState(false);
  const initialValues: Partial<ChatNote> = {
    content: '',
    chatGroup: room,
    editors: [],
    images: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const {values, setValues, handleSubmit, errors, touched} = useFormik<
    ChatNote | Partial<ChatNote>
  >({
    initialValues: note || initialValues,
    enableReinitialize: true,
    validationSchema: noteSchema,
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

  useEffect(() => {
    const safetySubmit = async () => {
      handleSubmit();
      await new Promise(r => setTimeout(r, 1000));
      setWillSubmit(false);
    };
    if (willSubmit) {
      safetySubmit();
    }
  }, [willSubmit, handleSubmit]);

  const handlePressImage = (url: string) => {
    const isNowUri = (element: ImageSource) => element.uri === url;
    setNowImageIndex(images.findIndex(isNowUri));
    setImageModal(true);
  };

  const handlePressImageButton = async () => {
    const {formData, fileName} = await uploadImageFromGallery();
    if (formData) {
      onUploadImage(formData, {
        onSuccess: imageURLs => {
          const newImage: Partial<ChatNoteImage> = {
            imageURL: imageURLs[0],
            name: fileName ? fileName : imageURLs[0] + '.png',
          };
          setValues(v => ({
            ...v,
            images: v.images?.length ? [...v.images, newImage] : [newImage],
          }));
        },
        onError: () => {
          Alert.alert(
            'アップロード中にエラーが発生しました。\n時間をおいて再実行してください。',
          );
        },
      });
    }
  };

  return (
    <WholeContainer>
      <HeaderWithTextButton
        title="ノート"
        rightButtonName={rightButtonNameOnHeader}
        enableBackButton={true}
        onPressRightButton={() => setWillSubmit(true)}
      />
      <ImageView
        animationType="slide"
        images={images}
        imageIndex={nowImageIndex === -1 ? 0 : nowImageIndex}
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
      <KeyboardAwareScrollView
        contentContainerStyle={tailwind('bg-white')}
        style={tailwind('flex-1 bg-white')}>
        <Div flexDir="row" flexWrap="wrap">
          {values.images?.map(i => (
            <TouchableHighlight
              key={i.id}
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
        {errors.content && touched.content ? (
          <Text mb="sm" color="tomato">
            {errors.content}
          </Text>
        ) : null}
        <TextInput
          multiline
          placeholder="今なにしてる？"
          value={values.content}
          onChangeText={t => setValues(v => ({...v, content: t}))}
          textAlignVertical="top"
          style={tailwind(' h-full p-2')}
          autoCapitalize={'none'}
        />
      </KeyboardAwareScrollView>
    </WholeContainer>
  );
};

export default ChatNoteForm;
