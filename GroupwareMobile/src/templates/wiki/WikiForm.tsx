import {useFormik} from 'formik';
import React, {useEffect, useRef, useState} from 'react';
import {Alert, useWindowDimensions} from 'react-native';
import {
  Button,
  Div,
  Dropdown,
  DropdownProps,
  Input,
  Tag as TagButton,
  Text,
} from 'react-native-magnus';
import {DropdownOptionProps} from 'react-native-magnus/lib/typescript/src/ui/dropdown/dropdown.option.type';
import {RichToolbar, actions, RichEditor} from 'react-native-pell-rich-editor';
import TagModal from '../../components/common/TagModal';
import HeaderWithTextButton from '../../components/Header';
import WholeContainer from '../../components/WholeContainer';
import {useSelectedTags} from '../../hooks/tag/useSelectedTags';
import {useTagType} from '../../hooks/tag/useTagType';
import {wikiFormStyles} from '../../styles/component/wiki/wikiForm.style';
import {RuleCategory, Tag, TextFormat, Wiki, WikiType} from '../../types';
import {tagColorFactory} from '../../utils/factory/tagColorFactory';
import {wikiTypeNameFactory} from '../../utils/factory/wiki/wikiTypeNameFactory';
import {wikiSchema} from '../../utils/validation/schema';
import {NodeHtmlMarkdown} from 'node-html-markdown';
import MarkdownIt from 'markdown-it';
import tailwind from 'tailwind-rn';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

type WikiFormProps = {
  wiki?: Wiki;
  tags: Tag[];
  type?: WikiType;
  saveWiki: (wiki: Partial<Wiki>) => void;
  onUploadImage: (onSuccess: (imageURL: string[]) => void) => void;
};

const WikiForm: React.FC<WikiFormProps> = ({
  wiki,
  tags,
  type,
  saveWiki,
  onUploadImage,
}) => {
  const htmlToMarkdown = new NodeHtmlMarkdown();
  const scrollRef = useRef<KeyboardAwareScrollView | null>(null);
  const markdownit = new MarkdownIt();
  const initialValues: Partial<Wiki> = {
    title: '',
    body: '',
    tags: [],
    type: type || WikiType.QA,
    ruleCategory: type ? RuleCategory.RULES : RuleCategory.OTHERS,
    textFormat: 'html',
  };
  const {
    values: newWiki,
    setValues: setNewWiki,
    errors,
    touched,
    handleSubmit,
  } = useFormik({
    enableReinitialize: true,
    initialValues: wiki || initialValues,
    validationSchema: wikiSchema,
    onSubmit: w => {
      saveWiki(w);
    },
  });
  const {height: windowHeight, width: windowWidth} = useWindowDimensions();
  const defaultDropdownProps: Partial<DropdownProps> = {
    m: 'md',
    pb: 'md',
    showSwipeIndicator: false,
    roundedTop: 'xl',
  };
  const editorRef = useRef<RichEditor | null>(null);
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
  const {selectedTags, toggleTag, isSelected} = useSelectedTags();
  const {selectedTagType, selectTagType, filteredTags} = useTagType(
    'All',
    tags,
  );
  const [visibleTagModal, setVisibleTagModal] = useState(false);
  const typeDropdownRef = useRef<any | null>(null);
  const textFormatDropdownRef = useRef<any | null>(null);

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
  const isEdit = !!wiki?.id;

  const editorInitializedCallback = () => {
    editorRef.current?.registerToolbar(function () {});
  };

  const formatDropdown = (
    <Dropdown
      {...defaultDropdownProps}
      title="入力形式を選択"
      ref={textFormatDropdownRef}>
      <Dropdown.Option
        {...defaultDropdownOptionProps}
        onPress={() => handleChangeTextFormat('html')}
        value={'html'}>
        <Text fontSize={16} color="blue700">
          デフォルト
        </Text>
      </Dropdown.Option>
      <Dropdown.Option
        {...defaultDropdownOptionProps}
        value={'markdown'}
        onPress={() => handleChangeTextFormat('markdown')}>
        <Div justifyContent="center" alignItems="center">
          <Text fontSize={16} color="blue700">
            マークダウン
          </Text>
          <Text color="tomato">
            ※WEB上で編集する際にマークダウン記法で編集できます
          </Text>
        </Div>
      </Dropdown.Option>
    </Dropdown>
  );
  console.log(newWiki.body);

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
            type: WikiType.ALL_POSTAL,
            ruleCategory: RuleCategory.OTHERS,
          }))
        }
        value={WikiType.ALL_POSTAL}>
        {wikiTypeNameFactory(WikiType.ALL_POSTAL)}
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

  useEffect(() => {
    setNewWiki(w => ({...w, tags: selectedTags}));
  }, [selectedTags, setNewWiki]);

  return (
    <WholeContainer>
      <HeaderWithTextButton title="Wiki作成" />
      <TagModal
        isVisible={visibleTagModal}
        tags={filteredTags || []}
        onCloseModal={() => setVisibleTagModal(false)}
        onPressTag={toggleTag}
        isSelected={isSelected}
        selectedTagType={selectedTagType}
        selectTagType={selectTagType}
      />
      {formatDropdown}
      {typeDropdown}
      <KeyboardAwareScrollView
        ref={scrollRef}
        nestedScrollEnabled={true}
        scrollEventThrottle={20}
        keyboardDismissMode={'none'}
        style={{width: windowWidth * 0.9, ...tailwind('self-center pt-4')}}>
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
              w={!isEdit ? windowWidth * 0.4 : windowWidth * 0.9}
              onPress={() => typeDropdownRef.current.open()}>
              {newWiki.type
                ? wikiTypeNameFactory(newWiki.type, newWiki.ruleCategory)
                : 'タイプを選択してください'}
            </Button>
          </Div>
          {!isEdit && (
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
          )}
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
            <TagButton
              key={t.id}
              mr={4}
              mb={8}
              color="white"
              bg={tagColorFactory(t.type)}>
              {t.name}
            </TagButton>
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
                onPressAddImage={() => {
                  if (editorRef.current) {
                    onUploadImage(imageUrl =>
                      //@ts-ignore If write this like editorRef.current?.insertImage it doesn't work on initial uploading.
                      editorRef.current.insertImage(imageUrl[0]),
                    );
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
                style={{
                  ...wikiFormStyles.richEditor,
                  height: windowHeight * 0.6,
                }}
                initialHeight={400}
                initialContentHTML={newWiki.body}
                useContainer={true}
                scrollEnabled={false}
                editorInitializedCallback={editorInitializedCallback}
                onChange={text => setNewWiki(w => ({...w, body: text}))}
              />
            </>
          ) : newWiki.textFormat === 'markdown' ? (
            <>
              <RichToolbar
                editor={editorRef}
                selectedIconTint={'#2095F2'}
                onPressAddImage={() => {
                  if (editorRef.current) {
                    onUploadImage(imageUrl =>
                      //@ts-ignore If write this like editorRef.current?.insertImage it doesn't work on initial uploading.
                      editorRef.current.insertImage(imageUrl[0]),
                    );
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
                style={{
                  ...wikiFormStyles.richEditor,
                  height: windowHeight * 0.6,
                }}
                initialHeight={400}
                initialContentHTML={markdownit.render(newWiki.body || '')}
                useContainer={true}
                scrollEnabled={false}
                editorInitializedCallback={editorInitializedCallback}
                onCursorPosition={scrollY =>
                  scrollRef.current?.scrollTo({y: scrollY - 30, animated: true})
                }
                onChange={text => {
                  setNewWiki(w => ({
                    ...w,
                    body: htmlToMarkdown.translate(text || ''),
                  }));
                }}
              />
            </>
          ) : null}
        </Div>
      </KeyboardAwareScrollView>
    </WholeContainer>
  );
};

export default WikiForm;
