import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useEffect, useRef, useState} from 'react';
import AppHeader from '../../../components/Header';
import WholeContainer from '../../../components/WholeContainer';
import {useAPICreateWiki} from '../../../hooks/api/wiki/useAPICreateWiki';
import {RuleCategory, TextFormat, Wiki, WikiType} from '../../../types';
import {
  PostWikiNavigationProps,
  PostWikiRouteProps,
} from '../../../types/navigator/screenProps/Wiki';
import {actions, RichEditor, RichToolbar} from 'react-native-pell-rich-editor';
import {Alert, useWindowDimensions} from 'react-native';
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
import MarkdownEditorWebView from '../../../components/MarkdownEditorWebView';
import {useAPIGetTag} from '../../../hooks/api/tag/useAPIGetTag';
import TagModal from '../../../components/common/TagModal';
import {useSelectedTags} from '../../../hooks/tag/useSelectedTags';
import {useTagType} from '../../../hooks/tag/useTagType';
import {Tag} from 'react-native-magnus';
import {tagColorFactory} from '../../../utils/factory/tagColorFactory';

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
  const {data: tags} = useAPIGetTag();
  const [visibleTagModal, setVisibleTagModal] = useState(false);
  const {mutate: uploadImage} = useAPIUploadStorage({
    onSuccess: imageUrl => {
      editorRef.current?.insertImage(imageUrl[0]);
    },
  });
  const {selectedTags, toggleTag, isSelected} = useSelectedTags();
  const {selectedTagType, selectTagType, filteredTags} = useTagType(
    'All',
    tags,
  );
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

  const handleChangeTextFormat = (format: TextFormat) => {
    if (newWiki.textFormat === format) {
      return;
    }
    Alert.alert(
      '入力形式を変更します',
      '現在の入力状態が失われます\nよろしいですか？',
      [
        {
          text: '変更',
          onPress: () => {
            setNewWiki(w => ({
              ...w,
              body: '',
              textFormat: format,
            }));
          },
        },
        {
          text: 'キャンセル',
        },
      ],
    );
  };

  useEffect(() => {
    setNewWiki(w => ({...w, tags: selectedTags}));
  }, [selectedTags, setNewWiki]);

  const formatDropdown = (
    <Dropdown
      {...defaultDropdownProps}
      title="入力形式を選択"
      ref={textFormatDropdownRef}>
      <Dropdown.Option
        {...defaultDropdownOptionProps}
        onPress={() => handleChangeTextFormat('html')}
        value={'html'}>
        デフォルト
      </Dropdown.Option>
      <Dropdown.Option
        {...defaultDropdownOptionProps}
        value={'markdown'}
        onPress={() => handleChangeTextFormat('markdown')}>
        マークダウン
      </Dropdown.Option>
    </Dropdown>
  );

  const typeDropdown = (
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
  );

  return (
    <WholeContainer>
      <AppHeader title="Wiki作成" />
      <TagModal
        isVisible={visibleTagModal}
        tags={filteredTags || []}
        onCloseModal={() => setVisibleTagModal(false)}
        onPressTag={toggleTag}
        isSelected={isSelected}
        selectedTagType={selectedTagType}
        selectTagType={selectTagType}
      />
      {typeDropdown}
      {formatDropdown}
      <ScrollDiv w={windowWidth * 0.9} alignSelf="center" pt={10}>
        <Text fontSize={16}>タイトル</Text>
        {errors.title && touched.title ? (
          <Text fontSize={16} color="tomato">
            {errors.title}
          </Text>
        ) : null}
        <Input
          placeholder="タイトルを入力してください"
          value={newWiki.title}
          onChangeText={text => setNewWiki(w => ({...w, title: text}))}
          mb="sm"
        />
        <Div mb={8} flexDir="row" justifyContent="space-evenly">
          <Div>
            <Text fontSize={16} mb={4}>
              タイプを選択
            </Text>
            <Button
              bg="white"
              borderWidth={1}
              borderColor={'#ececec'}
              p="md"
              color="black"
              w={windowWidth * 0.4}
              onPress={() => typeDropdownRef.current.open()}>
              {newWiki.type
                ? wikiTypeNameFactory(newWiki.type, newWiki.ruleCategory)
                : 'タイプを選択してください'}
            </Button>
          </Div>
          <Div>
            <Text fontSize={16} fontWeight="bold" mb={4}>
              入力形式を選択
            </Text>
            <Button
              bg="white"
              borderWidth={1}
              borderColor={'#ececec'}
              p="md"
              color="black"
              w={windowWidth * 0.4}
              onPress={() => textFormatDropdownRef.current.open()}>
              {newWiki.textFormat === 'html' ? 'デフォルト' : 'マークダウン'}
            </Button>
          </Div>
        </Div>
        <Button
          bg="green600"
          w={'100%'}
          mb={8}
          onPress={() => setVisibleTagModal(true)}>
          {newWiki.tags?.length
            ? `${newWiki.tags?.length}個のタグ`
            : 'タグを選択'}
        </Button>
        <Div flexDir="row" flexWrap="wrap" mb={8}>
          {newWiki.tags?.map(t => (
            <Tag mr={4} mb={8} color="white" bg={tagColorFactory(t.type)}>
              {t.name}
            </Tag>
          ))}
        </Div>
        <Button mb={16} bg="pink600" w={'100%'} onPress={() => handleSubmit()}>
          投稿
        </Button>
        {errors.body && touched.body ? (
          <Text fontSize={16} color="tomato">
            {errors.body}
          </Text>
        ) : null}
        <Div mb={16}>
          {newWiki.textFormat === 'html' ? (
            <>
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
            </>
          ) : newWiki.textFormat === 'markdown' ? (
            <Div h={windowHeight * 0.9}>
              <MarkdownEditorWebView
                onChange={text => setNewWiki(w => ({...w, body: text}))}
              />
            </Div>
          ) : null}
        </Div>
      </ScrollDiv>
    </WholeContainer>
  );
};

export default PostWiki;
