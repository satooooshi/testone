import {useFormik} from 'formik';
import React, {useEffect, useRef, useState} from 'react';
import {useWindowDimensions} from 'react-native';
import {Button, Div, Input, Tag as TagButton, Text} from 'react-native-magnus';
import TagModal from '../../components/common/TagModal';
import HeaderWithTextButton from '../../components/Header';
import WholeContainer from '../../components/WholeContainer';
import TextEditor from '../../components/wiki/TextEditor';
import {useTagType} from '../../hooks/tag/useTagType';
import {BoardCategory, RuleCategory, Tag, Wiki, WikiType} from '../../types';
import {tagColorFactory} from '../../utils/factory/tagColorFactory';
import {wikiTypeNameFactory} from '../../utils/factory/wiki/wikiTypeNameFactory';
import {wikiSchema} from '../../utils/validation/schema';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {NodeHtmlMarkdown} from 'node-html-markdown';
import {useAuthenticate} from '../../contexts/useAuthenticate';
import ModalSelectingWikiType, {
  SelectWikiArg,
} from '../../components/wiki/ModalSelectWikiType';
import QuillEditor from 'react-native-cn-quill';

type WikiFormProps = {
  wiki?: Wiki;
  tags: Tag[];
  type?: WikiType;
  ruleCategory?: RuleCategory;
  boardCategory?: BoardCategory;
  saveWiki: (wiki: Partial<Wiki>) => void;
  onUploadImage: (onSuccess: (imageURL: string[]) => void) => void;
};

const WikiForm: React.FC<WikiFormProps> = ({
  wiki,
  tags,
  type,
  ruleCategory,
  boardCategory,
  saveWiki,
  onUploadImage,
}) => {
  const scrollRef = useRef<KeyboardAwareScrollView | null>(null);
  const quillRef = useRef<QuillEditor | null>(null);
  const [willSubmit, setWillSubmit] = useState(false);
  const initialValues: Partial<Wiki> = {
    title: '',
    body: '',
    tags: [],
    type: type || undefined,
    ruleCategory: ruleCategory || RuleCategory.NON_RULE,
    boardCategory: boardCategory
      ? boardCategory
      : !type || type === WikiType.BOARD
      ? BoardCategory.QA
      : BoardCategory.NON_BOARD,
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
      if (w.textFormat === 'markdown') {
        saveWiki({...w, body: NodeHtmlMarkdown.translate(w.body as string)});
        return;
      }
      saveWiki(w);
      quillRef.current?.blur();
    },
  });
  const {width: windowWidth} = useWindowDimensions();
  const {selectedTagType, filteredTags} = useTagType('All', tags);
  const [visibleTagModal, setVisibleTagModal] = useState(false);
  const [visibleSelectTypeModal, setVisibleSelectTypeModal] =
    useState<boolean>(false);

  const {user} = useAuthenticate();

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

  //   Fixed the input format so that it cannot be selected at once.

  // const textFormatDropdownRef = useRef<any | null>(null);
  // const isEdit = !!wiki?.id;
  // const handleChangeTextFormat = (format: TextFormat) => {
  //   if (newWiki.textFormat === format) {
  //     return;
  //   }
  //   Alert.alert(
  //     '入力形式を変更します',
  //     '現在の入力状態が失われます\nよろしいですか？',
  //     [
  //       {
  //         text: '変更',
  //         onPress: () => {
  //           setNewWiki(w => ({
  //             ...w,
  //             body: '',
  //             textFormat: format,
  //           }));
  //         },
  //       },
  //       {
  //         text: 'キャンセル',
  //       },
  //     ],
  //   );
  // };

  // const formatDropdown = (
  //   <Dropdown
  //     {...defaultDropdownProps}
  //     title="入力形式を選択"
  //     ref={textFormatDropdownRef}>
  //     <Dropdown.Option
  //       {...defaultDropdownOptionProps}
  //       onPress={() => handleChangeTextFormat('html')}
  //       value={'html'}>
  //       <Text fontSize={16} color="blue700">
  //         デフォルト
  //       </Text>
  //     </Dropdown.Option>
  //     <Dropdown.Option
  //       {...defaultDropdownOptionProps}
  //       value={'markdown'}
  //       onPress={() => handleChangeTextFormat('markdown')}>
  //       <Div justifyContent="center" alignItems="center">
  //         <Text fontSize={16} color="blue700">
  //           マークダウン
  //         </Text>
  //         <Text color="tomato">
  //           ※WEB上で編集する際にマークダウン記法で編集できます
  //         </Text>
  //       </Div>
  //     </Dropdown.Option>
  //   </Dropdown>
  // );

  return (
    <WholeContainer>
      <HeaderWithTextButton
        title={wiki?.id ? 'Wiki編集' : 'Wiki作成'}
        enableBackButton={true}
      />
      <ModalSelectingWikiType
        isVisible={visibleSelectTypeModal}
        onCloseModal={() => setVisibleSelectTypeModal(false)}
        onSelectWikiType={(args: SelectWikiArg) => {
          setNewWiki(w => ({
            ...w,
            type: args.type,
            ruleCategory: args.ruleCategory,
            boardCategory: args.boardCategory,
          }));
          setVisibleSelectTypeModal(false);
        }}
        userRole={user?.role}
      />
      <TagModal
        onCompleteModal={selectedTagsInModal =>
          setNewWiki(w => ({...w, tags: selectedTagsInModal}))
        }
        isVisible={visibleTagModal}
        tags={filteredTags || []}
        onCloseModal={() => setVisibleTagModal(false)}
        selectedTagType={selectedTagType}
        defaultSelectedTags={newWiki.tags}
      />
      {/* {formatDropdown} */}
      <KeyboardAwareScrollView
        ref={scrollRef}
        nestedScrollEnabled={true}
        scrollEventThrottle={20}
        keyboardDismissMode={'none'}>
        <Div w="90%" alignItems="center" alignSelf="center">
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
          <Div mb={10} flexDir="row">
            <Div alignItems="center">
              <Text fontSize={16} mb={4}>
                タイプを選択
              </Text>
              {errors.type && touched.type ? (
                <Text fontSize={16} color="tomato">
                  {errors.type}
                </Text>
              ) : null}
              <Button
                bg="white"
                borderWidth={1}
                borderColor={'#ececec'}
                p="md"
                color="black"
                w={windowWidth * 0.9}
                onPress={() => setVisibleSelectTypeModal(true)}>
                {newWiki.type
                  ? wikiTypeNameFactory(
                      newWiki.type,
                      newWiki.ruleCategory,
                      true,
                      newWiki.boardCategory,
                    )
                  : 'タイプを選択してください'}
              </Button>
            </Div>
            {/* {!isEdit && (
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
                  {newWiki.textFormat === 'html'
                    ? 'デフォルト'
                    : 'マークダウン'}
                </Button>
              </Div>
            )} */}
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
          <Div
            flexDir="row"
            flexWrap="wrap"
            mb={8}
            w={'100%'}
            justifyContent="flex-start">
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
          <Button
            mb={16}
            bg="pink600"
            w={'100%'}
            onPress={() => setWillSubmit(true)}>
            投稿
          </Button>
        </Div>
        {errors.body && touched.body ? (
          <Text fontSize={16} color="tomato">
            {errors.body}
          </Text>
        ) : null}
        <Div mb={60}>
          <TextEditor
            textFormat={newWiki.textFormat}
            onUploadImage={onUploadImage}
            initialBody={newWiki.body}
            onChange={text => setNewWiki(w => ({...w, body: text}))}
            quillRef={quillRef}
          />
        </Div>
      </KeyboardAwareScrollView>
    </WholeContainer>
  );
};

export default WikiForm;
