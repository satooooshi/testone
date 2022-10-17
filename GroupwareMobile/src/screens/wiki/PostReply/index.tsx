import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import {useFormik} from 'formik';
import MarkdownIt from 'markdown-it';
import React, {useEffect, useRef} from 'react';
import {ActivityIndicator, Alert, useWindowDimensions} from 'react-native';
import {Button, Overlay, Text, Div} from 'react-native-magnus';
import HeaderWithTextButton from '../../../components/Header';
import WholeContainer from '../../../components/WholeContainer';
import {useAPIUploadStorage} from '../../../hooks/api/storage/useAPIUploadStorage';
import {useAPICreateAnswerReply} from '../../../hooks/api/wiki/useAPICreateAnswerReply';
import {useAPIGetAnswerDetail} from '../../../hooks/api/wiki/useAPIGetAnswerDetail';
import {QAAnswerReply} from '../../../types';
import {
  PostAnswerRouteProps,
  PostWikiNavigationProps,
} from '../../../types/navigator/drawerScreenProps';
import {uploadImageFromGallery} from '../../../utils/cropImage/uploadImageFromGallery';
import {replySchema} from '../../../utils/validation/schema';
import RenderHtml from 'react-native-render-html';
import TextEditor from '../../../components/wiki/TextEditor';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useIsTabBarVisible} from '../../../contexts/bottomTab/useIsTabBarVisible';
import QuillEditor from 'react-native-cn-quill';

const PostReply: React.FC = () => {
  const navigation = useNavigation<PostWikiNavigationProps>();
  const route = useRoute<PostAnswerRouteProps>();
  const scrollRef = useRef<KeyboardAwareScrollView | null>(null);
  const quillRef = useRef<QuillEditor | null>(null);
  const isFocused = useIsFocused();
  const {setIsTabBarVisible} = useIsTabBarVisible();
  const answerId = route.params.id;
  const {data: answerInfo} = useAPIGetAnswerDetail(answerId);
  const mdParser = new MarkdownIt({breaks: true});
  const {mutate: saveReply, isLoading: loadingSaveReply} =
    useAPICreateAnswerReply({
      onSuccess: () => {
        navigation.goBack();
      },
      onError: () => {
        Alert.alert(
          '返信作成中にエラーが発生しました。\n時間をおいて再実行してください。',
        );
      },
    });
  const {mutate: uploadImage, isLoading: loadingUploadImage} =
    useAPIUploadStorage();
  const {width: windowWidth, height: windowHeight} = useWindowDimensions();
  const isLoading = loadingSaveReply || loadingUploadImage;
  const initialValues: Partial<QAAnswerReply> = {
    body: '',
    textFormat: 'html',
    answer: answerInfo,
  };
  const {
    setValues: setNewReply,
    errors,
    touched,
    handleSubmit,
  } = useFormik({
    enableReinitialize: true,
    initialValues: initialValues,
    validationSchema: replySchema,
    onSubmit: r => {
      saveReply(r);
      quillRef?.current?.blur();
    },
  });

  useEffect(() => {
    if (isFocused) {
      setIsTabBarVisible(false);
    }
  }, [isFocused, setIsTabBarVisible]);

  const handleUploadImage = async (onSuccess: (imageURL: string[]) => void) => {
    const {formData} = await uploadImageFromGallery();
    if (formData) {
      uploadImage(formData, {onSuccess});
    }
  };
  return (
    <WholeContainer>
      {answerInfo ? (
        <>
          <HeaderWithTextButton title="返信する" enableBackButton={true} />
          <Overlay visible={isLoading} p="xl">
            <ActivityIndicator />
          </Overlay>
          <KeyboardAwareScrollView
            ref={scrollRef}
            nestedScrollEnabled={true}
            scrollEventThrottle={20}
            keyboardDismissMode={'none'}>
            <Div
              w={windowWidth * 0.9}
              h={windowHeight * 0.3}
              alignSelf="center"
              pt={10}
              bg="white"
              rounded="md"
              mb={16}>
              <RenderHtml
                source={{
                  html:
                    answerInfo.textFormat === 'html'
                      ? answerInfo.body
                      : mdParser.render(answerInfo.body),
                }}
              />
            </Div>
            <Div w={windowWidth * 0.9} alignSelf="center" pt={10}>
              <Button
                mb={16}
                bg="pink600"
                w={'100%'}
                onPress={() => handleSubmit()}>
                投稿
              </Button>
              {errors.body && touched.body ? (
                <Text fontSize={16} color="tomato">
                  {errors.body}
                </Text>
              ) : null}
              <Div mb={50}>
                <TextEditor
                  textFormat={answerInfo.textFormat}
                  onUploadImage={handleUploadImage}
                  onChange={text => setNewReply(r => ({...r, body: text}))}
                  quillRef={quillRef}
                />
              </Div>
            </Div>
          </KeyboardAwareScrollView>
        </>
      ) : null}
    </WholeContainer>
  );
};

export default PostReply;
