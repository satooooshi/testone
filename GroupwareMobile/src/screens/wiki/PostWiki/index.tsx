import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useRef} from 'react';
import AppHeader from '../../../components/Header';
import WholeContainer from '../../../components/WholeContainer';
import {useAPICreateWiki} from '../../../hooks/api/wiki/useAPICreateWiki';
import {RuleCategory, Wiki, WikiType} from '../../../types';
import {
  PostWikiNavigationProps,
  PostWikiRouteProps,
} from '../../../types/navigator/screenProps/Wiki';
import {actions, RichEditor, RichToolbar} from 'react-native-pell-rich-editor';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import {
  Input,
  ScrollDiv,
  Text,
  Dropdown,
  Button,
  Div,
} from 'react-native-magnus';
import ImageCropPicker from 'react-native-image-crop-picker';
import {uploadImageFromGallery} from '../../../utils/cropImage/uploadImageFromGallery';
import {useAPIUploadStorage} from '../../../hooks/api/storage/useAPIUploadStorage';
import {useFormik} from 'formik';
import {wikiSchema} from '../../../utils/validation/schema';
import {wikiTypeNameFactory} from '../../../utils/factory/wiki/wikiTypeNameFactory';

const PostWiki: React.FC = () => {
  const navigation = useNavigation<PostWikiNavigationProps>();
  const route = useRoute<PostWikiRouteProps>();
  const type = route.params?.type;
  const editorRef = useRef<RichEditor | null>(null);
  const {height: windowHeight, width: windowWidth} = useWindowDimensions();
  const {mutate: saveWiki} = useAPICreateWiki({
    onSuccess: () => {
      navigation.goBack();
    },
  });
  const {mutate: uploadImage} = useAPIUploadStorage({
    onSuccess: imageUrl => {
      editorRef.current?.insertImage(imageUrl[0]);
    },
  });
  const initialValues: Partial<Wiki> = {
    title: '',
    body: '',
    tags: [],
    type: type || WikiType.QA,
    ruleCategory: type ? RuleCategory.RULES : RuleCategory.OTHERS,
    textFormat: 'html',
  };
  const typeDropdownRef = useRef<any | null>(null);
  const textFormatDropdownRef = useRef<any | null>(null);
  const {
    values: newWiki,
    setValues: setNewWiki,
    errors,
    touched,
    handleSubmit,
  } = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema: wikiSchema,
    onSubmit: w => {
      saveWiki(w);
    },
  });

  const editorInitializedCallback = () => {
    editorRef.current?.registerToolbar(function () {});
  };
  return (
    <WholeContainer>
      <AppHeader title="Wiki作成" />
      <ScrollDiv w={windowWidth * 0.9} alignSelf="center" pt={10}>
        <Input
          placeholder="タイトルを入力してください"
          value={newWiki.title}
          onChangeText={text => setNewWiki(w => ({...w, title: text}))}
          mb="sm"
        />
        <Div flexDir="row" justifyContent="space-evenly">
          <Button
            bg="white"
            borderWidth={1}
            borderColor={'#ececec'}
            p="md"
            mb="sm"
            color="black"
            w={windowWidth * 0.4}
            onPress={() => typeDropdownRef.current.open()}>
            {newWiki.type
              ? wikiTypeNameFactory(newWiki.type, newWiki.ruleCategory)
              : 'タイプを選択してください'}
          </Button>
          <Button
            bg="white"
            borderWidth={1}
            borderColor={'#ececec'}
            p="md"
            mb="sm"
            color="black"
            w={windowWidth * 0.4}
            onPress={() => textFormatDropdownRef.current.open()}>
            {newWiki.textFormat === 'html' ? 'デフォルト' : 'マークダウン'}
          </Button>
        </Div>
        <Div flexDir="row" justifyContent="space-evenly" mb="lg">
          <Button
            bg="white"
            borderWidth={1}
            borderColor={'#ececec'}
            color="black"
            w={windowWidth * 0.4}
            onPress={() => {}}>
            タグを選択
          </Button>
          <Button
            bg="pink600"
            w={windowWidth * 0.4}
            onPress={() => handleSubmit()}>
            投稿
          </Button>
        </Div>
        <Dropdown
          title="タイプを選択"
          ref={typeDropdownRef}
          m="md"
          pb="md"
          showSwipeIndicator={false}
          roundedTop="xl">
          <Dropdown.Option
            onPress={() =>
              setNewWiki(w => ({
                ...w,
                type: WikiType.RULES,
                ruleCategory: RuleCategory.RULES,
              }))
            }
            value={RuleCategory.RULES}
            bg="gray100"
            color="blue600"
            py="lg"
            px="xl"
            borderBottomWidth={1}
            borderBottomColor="gray200"
            justifyContent="center"
            roundedTop="lg">
            {wikiTypeNameFactory(WikiType.RULES, RuleCategory.RULES)}
          </Dropdown.Option>
          <Dropdown.Option
            onPress={() =>
              setNewWiki(w => ({
                ...w,
                type: WikiType.RULES,
                ruleCategory: RuleCategory.PHILOSOPHY,
              }))
            }
            value={RuleCategory.PHILOSOPHY}
            bg="gray100"
            color="blue600"
            py="lg"
            px="xl"
            borderBottomWidth={1}
            borderBottomColor="gray200"
            justifyContent="center"
            roundedTop="lg">
            {wikiTypeNameFactory(WikiType.RULES, RuleCategory.PHILOSOPHY)}
          </Dropdown.Option>
          <Dropdown.Option
            onPress={() =>
              setNewWiki(w => ({
                ...w,
                type: WikiType.RULES,
                ruleCategory: RuleCategory.ABC,
              }))
            }
            value={RuleCategory.ABC}
            bg="gray100"
            color="blue600"
            py="lg"
            px="xl"
            borderBottomWidth={1}
            borderBottomColor="gray200"
            justifyContent="center"
            roundedTop="lg">
            {wikiTypeNameFactory(WikiType.RULES, RuleCategory.ABC)}
          </Dropdown.Option>
          <Dropdown.Option
            onPress={() =>
              setNewWiki(w => ({
                ...w,
                type: WikiType.RULES,
                ruleCategory: RuleCategory.BENEFITS,
              }))
            }
            value={RuleCategory.BENEFITS}
            bg="gray100"
            color="blue600"
            py="lg"
            px="xl"
            borderBottomWidth={1}
            borderBottomColor="gray200"
            justifyContent="center"
            roundedTop="lg">
            {wikiTypeNameFactory(WikiType.RULES, RuleCategory.BENEFITS)}
          </Dropdown.Option>
          <Dropdown.Option
            onPress={() =>
              setNewWiki(w => ({
                ...w,
                type: WikiType.RULES,
                ruleCategory: RuleCategory.DOCUMENT,
              }))
            }
            value={RuleCategory.DOCUMENT}
            bg="gray100"
            color="blue600"
            py="lg"
            px="xl"
            borderBottomWidth={1}
            borderBottomColor="gray200"
            justifyContent="center"
            roundedTop="lg">
            {wikiTypeNameFactory(WikiType.RULES, RuleCategory.DOCUMENT)}
          </Dropdown.Option>
          <Dropdown.Option
            onPress={() =>
              setNewWiki(w => ({
                ...w,
                type: WikiType.QA,
                ruleCategory: RuleCategory.OTHERS,
              }))
            }
            value={WikiType.QA}
            bg="gray100"
            color="blue600"
            py="lg"
            px="xl"
            borderBottomWidth={1}
            borderBottomColor="gray200"
            justifyContent="center"
            roundedTop="lg">
            {wikiTypeNameFactory(WikiType.QA)}
          </Dropdown.Option>
          <Dropdown.Option
            onPress={() =>
              setNewWiki(w => ({
                ...w,
                type: WikiType.KNOWLEDGE,
                ruleCategory: RuleCategory.OTHERS,
              }))
            }
            value={WikiType.KNOWLEDGE}
            bg="gray100"
            color="blue600"
            py="lg"
            px="xl"
            borderBottomWidth={1}
            borderBottomColor="gray200"
            justifyContent="center"
            roundedTop="lg">
            {wikiTypeNameFactory(WikiType.KNOWLEDGE)}
          </Dropdown.Option>
        </Dropdown>
        <Dropdown
          title="入力形式を選択"
          ref={textFormatDropdownRef}
          m="md"
          pb="md"
          showSwipeIndicator={false}
          roundedTop="xl">
          <Dropdown.Option
            onPress={() =>
              setNewWiki(w => ({
                ...w,
                textFormat: 'html',
              }))
            }
            value={'html'}
            bg="gray100"
            color="blue600"
            py="lg"
            px="xl"
            borderBottomWidth={1}
            borderBottomColor="gray200"
            justifyContent="center"
            roundedTop="lg">
            デフォルト
          </Dropdown.Option>
          <Dropdown.Option
            onPress={() =>
              setNewWiki(w => ({
                ...w,
                textFormat: 'markdown',
              }))
            }
            value={'html'}
            bg="gray100"
            color="blue600"
            py="lg"
            px="xl"
            borderBottomWidth={1}
            borderBottomColor="gray200"
            justifyContent="center"
            roundedTop="lg">
            マークダウン
          </Dropdown.Option>
        </Dropdown>
        <RichToolbar
          editor={editorRef}
          selectedIconTint={'#2095F2'}
          onPressAddImage={async () => {
            // ImageCropPicker.openPicker({cropping: true, mediaType: 'photo'});
            const {formData} = await uploadImageFromGallery();
            if (formData) {
              // console.log(formData);
              uploadImage(formData);
            }
          }}
          disabledIconTint={'#bfbfbf'}
          actions={[
            actions.heading1,
            actions.heading2,
            actions.heading3,
            actions.heading4,
            actions.heading5,
            actions.heading6,
            'bold',
            actions.setStrikethrough,
            actions.insertOrderedList,
            actions.blockquote,
            actions.code,
            actions.insertImage,
            actions.undo,
            actions.redo,
          ]}
          iconMap={{
            [actions.heading1]: () => <Text>H1</Text>,
            [actions.heading2]: () => <Text>H2</Text>,
            [actions.heading3]: () => <Text>H3</Text>,
            [actions.heading4]: () => <Text>H4</Text>,
            [actions.heading5]: () => <Text>H5</Text>,
            [actions.heading6]: () => <Text>H6</Text>,
            [actions.bold]: () => <Text fontWeight="bold">B</Text>,
          }}
        />
        <RichEditor
          ref={editorRef}
          style={{height: windowHeight * 0.6}}
          initialContentHTML={newWiki.body}
          useContainer={false}
          editorInitializedCallback={editorInitializedCallback}
          onChange={text => setNewWiki(w => ({...w, body: text}))}
        />
      </ScrollDiv>
    </WholeContainer>
  );
};

export default PostWiki;
