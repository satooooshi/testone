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
import {useWindowDimensions} from 'react-native';
import {
  Input,
  ScrollDiv,
  Text,
  Dropdown,
  Button,
  Div,
  DropdownProps,
} from 'react-native-magnus';
import {uploadImageFromGallery} from '../../../utils/cropImage/uploadImageFromGallery';
import {useAPIUploadStorage} from '../../../hooks/api/storage/useAPIUploadStorage';
import {useFormik} from 'formik';
import {wikiSchema} from '../../../utils/validation/schema';
import {wikiTypeNameFactory} from '../../../utils/factory/wiki/wikiTypeNameFactory';
import {DropdownOptionProps} from 'react-native-magnus/lib/typescript/src/ui/dropdown/dropdown.option.type';

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
    handleSubmit,
  } = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema: wikiSchema,
    onSubmit: w => {
      saveWiki(w);
    },
  });
  const defaultDropdownProps: Partial<DropdownProps> = {
    m: 'md',
    pb: 'md',
    showSwipeIndicator: false,
    roundedTop: 'xl',
  };
  const defaultDropdownOptionProps: Partial<DropdownOptionProps> = {
    bg: 'gray100',
    color: 'blue600',
    py: 'lg',
    px: 'xl',
    borderBottomWidth: 1,
    borderBottomColor: 'gray200',
    justifyContent: 'center',
    roundedTop: 'lg',
  };

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
          {...defaultDropdownProps}
          title="タイプを選択"
          ref={typeDropdownRef}>
          <Dropdown.Option
            {...defaultDropdownOptionProps}
            onPress={() =>
              setNewWiki(w => ({
                ...w,
                type: WikiType.RULES,
                ruleCategory: RuleCategory.RULES,
              }))
            }
            value={RuleCategory.RULES}>
            {wikiTypeNameFactory(WikiType.RULES, RuleCategory.RULES)}
          </Dropdown.Option>
          <Dropdown.Option
            {...defaultDropdownOptionProps}
            onPress={() =>
              setNewWiki(w => ({
                ...w,
                type: WikiType.RULES,
                ruleCategory: RuleCategory.PHILOSOPHY,
              }))
            }
            value={RuleCategory.PHILOSOPHY}>
            {wikiTypeNameFactory(WikiType.RULES, RuleCategory.PHILOSOPHY)}
          </Dropdown.Option>
          <Dropdown.Option
            {...defaultDropdownOptionProps}
            onPress={() =>
              setNewWiki(w => ({
                ...w,
                type: WikiType.RULES,
                ruleCategory: RuleCategory.ABC,
              }))
            }
            value={RuleCategory.ABC}>
            {wikiTypeNameFactory(WikiType.RULES, RuleCategory.ABC)}
          </Dropdown.Option>
          <Dropdown.Option
            {...defaultDropdownOptionProps}
            onPress={() =>
              setNewWiki(w => ({
                ...w,
                type: WikiType.RULES,
                ruleCategory: RuleCategory.BENEFITS,
              }))
            }
            value={RuleCategory.BENEFITS}>
            {wikiTypeNameFactory(WikiType.RULES, RuleCategory.BENEFITS)}
          </Dropdown.Option>
          <Dropdown.Option
            {...defaultDropdownOptionProps}
            onPress={() =>
              setNewWiki(w => ({
                ...w,
                type: WikiType.RULES,
                ruleCategory: RuleCategory.DOCUMENT,
              }))
            }
            value={RuleCategory.DOCUMENT}>
            {wikiTypeNameFactory(WikiType.RULES, RuleCategory.DOCUMENT)}
          </Dropdown.Option>
          <Dropdown.Option
            {...defaultDropdownOptionProps}
            onPress={() =>
              setNewWiki(w => ({
                ...w,
                type: WikiType.QA,
                ruleCategory: RuleCategory.OTHERS,
              }))
            }
            value={WikiType.QA}>
            {wikiTypeNameFactory(WikiType.QA)}
          </Dropdown.Option>
          <Dropdown.Option
            {...defaultDropdownOptionProps}
            onPress={() =>
              setNewWiki(w => ({
                ...w,
                type: WikiType.KNOWLEDGE,
                ruleCategory: RuleCategory.OTHERS,
              }))
            }
            value={WikiType.KNOWLEDGE}>
            {wikiTypeNameFactory(WikiType.KNOWLEDGE)}
          </Dropdown.Option>
        </Dropdown>
        <Dropdown
          {...defaultDropdownProps}
          title="入力形式を選択"
          ref={textFormatDropdownRef}>
          <Dropdown.Option
            {...defaultDropdownOptionProps}
            onPress={() =>
              setNewWiki(w => ({
                ...w,
                textFormat: 'html',
              }))
            }
            value={'html'}>
            デフォルト
          </Dropdown.Option>
          <Dropdown.Option
            {...defaultDropdownOptionProps}
            value={'markdown'}
            onPress={() =>
              setNewWiki(w => ({
                ...w,
                textFormat: 'markdown',
              }))
            }>
            マークダウン
          </Dropdown.Option>
        </Dropdown>
        <RichToolbar
          editor={editorRef}
          selectedIconTint={'#2095F2'}
          onPressAddImage={async () => {
            const {formData} = await uploadImageFromGallery();
            if (formData) {
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
          placeholder="本文を入力してください"
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
