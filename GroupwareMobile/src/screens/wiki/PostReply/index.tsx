import {useNavigation, useRoute} from '@react-navigation/native';
import {useFormik} from 'formik';
import MarkdownIt from 'markdown-it';
import React from 'react';
import {ActivityIndicator, useWindowDimensions} from 'react-native';
import {Button, Overlay, ScrollDiv, Text} from 'react-native-magnus';
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

const PostReply: React.FC = () => {
  const navigation = useNavigation<PostWikiNavigationProps>();
  const route = useRoute<PostAnswerRouteProps>();
  const answerId = route.params.id;
  const {data: answerInfo} = useAPIGetAnswerDetail(answerId);
  const mdParser = new MarkdownIt({breaks: true});
  const {mutate: saveReply, isLoading: loadingSaveReply} =
    useAPICreateAnswerReply({
      onSuccess: () => {
        navigation.goBack();
      },
    });
  const {mutate: uploadImage, isLoading: loadingUploadImage} =
    useAPIUploadStorage();
  const {width: windowWidth, height: windowHeight} = useWindowDimensions();
  const isLoading = loadingSaveReply || loadingUploadImage;
  const initialValues: Partial<QAAnswerReply> = {
    body: '',
    textFormat: answerInfo?.textFormat,
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
    },
  });

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
          <HeaderWithTextButton title="返信する" />
          <Overlay visible={isLoading} p="xl">
            <ActivityIndicator />
          </Overlay>
          <ScrollDiv
            nestedScrollEnabled={true}
            scrollEventThrottle={20}
            keyboardDismissMode={'none'}
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
          </ScrollDiv>
          <ScrollDiv
            nestedScrollEnabled={true}
            scrollEventThrottle={20}
            keyboardDismissMode={'none'}
            w={windowWidth * 0.9}
            alignSelf="center"
            pt={10}>
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
            <TextEditor
              textFormat={answerInfo.textFormat}
              onUploadImage={handleUploadImage}
              onChange={text => setNewReply(r => ({...r, body: text}))}
            />
          </ScrollDiv>
        </>
      ) : null}
    </WholeContainer>
  );
};

export default PostReply;
