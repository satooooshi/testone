import {useNavigation, useRoute} from '@react-navigation/native';
import React from 'react';
import {QAAnswer} from '../../../types';
import {useFormik} from 'formik';
import {answerSchema} from '../../../utils/validation/schema';
import {useAPIUploadStorage} from '../../../hooks/api/storage/useAPIUploadStorage';
import {uploadImageFromGallery} from '../../../utils/cropImage/uploadImageFromGallery';
import {ActivityIndicator, Alert, useWindowDimensions} from 'react-native';
import {Button, Overlay, ScrollDiv, Text} from 'react-native-magnus';
import {
  PostWikiNavigationProps,
  PostAnswerRouteProps,
} from '../../../types/navigator/drawerScreenProps';
import {useAPICreateAnswer} from '../../../hooks/api/wiki/useAPICreateAnswer';
import {useAPIGetWikiDetail} from '../../../hooks/api/wiki/useAPIGetWikiDetail';
import TextEditor from '../../../components/wiki/TextEditor';
import WholeContainer from '../../../components/WholeContainer';
import HeaderWithTextButton from '../../../components/Header';
import RenderHtml from 'react-native-render-html';
import MarkdownIt from 'markdown-it';

const PostAnswer: React.FC = () => {
  const navigation = useNavigation<PostWikiNavigationProps>();
  const route = useRoute<PostAnswerRouteProps>();
  const wikiId = route.params.id;
  const {data: wikiInfo} = useAPIGetWikiDetail(wikiId);
  const mdParser = new MarkdownIt({breaks: true});
  const {mutate: saveAnswer, isLoading: loadingSaveAnswer} = useAPICreateAnswer(
    {
      onSuccess: () => {
        navigation.goBack();
      },
      onError: () => {
        Alert.alert('エラーが発生しました。\n時間をおいて再実行してください。');
      },
    },
  );
  const {mutate: uploadImage, isLoading: loadingUploadImage} =
    useAPIUploadStorage();
  const {width: windowWidth, height: windowHeight} = useWindowDimensions();
  const isLoading = loadingSaveAnswer || loadingUploadImage;
  const initialValues: Partial<QAAnswer> = {
    body: '',
    textFormat: wikiInfo?.textFormat,
    wiki: wikiInfo,
  };
  const {
    setValues: setNewAnswer,
    errors,
    touched,
    handleSubmit,
  } = useFormik({
    enableReinitialize: true,
    initialValues: initialValues,
    validationSchema: answerSchema,
    onSubmit: a => {
      saveAnswer(a);
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
      {wikiInfo ? (
        <>
          <HeaderWithTextButton
            enableBackButton={true}
            title={
              wikiInfo.answers?.length ? '回答を追加する' : '回答を投稿する'
            }
          />
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
                  wikiInfo.textFormat === 'html'
                    ? wikiInfo.body
                    : mdParser.render(wikiInfo.body),
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
              textFormat={wikiInfo.textFormat}
              onUploadImage={handleUploadImage}
              onChange={text => setNewAnswer(a => ({...a, body: text}))}
            />
          </ScrollDiv>
        </>
      ) : null}
    </WholeContainer>
  );
};

export default PostAnswer;
