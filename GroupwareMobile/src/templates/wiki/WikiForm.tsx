import {useFormik} from 'formik';
import React, {useRef, useState} from 'react';
import {Alert, useWindowDimensions} from 'react-native';
import {
  Button,
  Div,
  Dropdown,
  Icon,
  Input,
  Tag as TagButton,
  Text,
} from 'react-native-magnus';
import TagModal from '../../components/common/TagModal';
import HeaderWithTextButton from '../../components/Header';
import WholeContainer from '../../components/WholeContainer';
import TextEditor from '../../components/wiki/TextEditor';
import {useTagType} from '../../hooks/tag/useTagType';
import {BoardCategory, RuleCategory, Tag, Wiki, WikiType} from '../../types';
import {tagColorFactory} from '../../utils/factory/tagColorFactory';
import {wikiTypeNameFactory} from '../../utils/factory/wiki/wikiTypeNameFactory';
import {wikiSchema} from '../../utils/validation/schema';
import {
  defaultDropdownProps,
  defaultDropdownOptionProps,
} from '../../utils/dropdown/helper';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {NodeHtmlMarkdown} from 'node-html-markdown';
import {useAuthenticate} from '../../contexts/useAuthenticate';
import {isCreatableWiki} from '../../utils/factory/wiki/isCreatableWiki';
import {TouchableOpacity} from 'react-native-gesture-handler';
import DropdownOpenerButton from '../../components/common/DropdownOpenerButton';
import {blueColor} from '../../utils/colors';
import {handlePickDocument} from '../../utils/handlePickDocument';
import {useAPIUploadStorage} from '../../hooks/api/storage/useAPIUploadStorage';
// import {blueColor} from '../../../utils/colors';

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
  const initialValues: Partial<Wiki> = {
    title: '',
    body: '',
    tags: [],
    type: type || WikiType.BOARD,
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
    },
  });
  const {mutate: uploadFile} = useAPIUploadStorage({
    onSuccess: uploadedURL => {
      setNewWiki(e => {
        const newWikiFile = {url: uploadedURL[0]};
        if (e.files && e.files.length) {
          return {
            ...e,
            files: [...e.files, newWikiFile],
          };
        }
        return {
          ...e,
          files: [newWikiFile],
        };
      });
    },
    onError: () => {
      Alert.alert(
        'アップロード中にエラーが発生しました。\n時間をおいて再実行してください。',
      );
    },
  });
  const {width: windowWidth} = useWindowDimensions();
  const {selectedTagType, filteredTags} = useTagType('All', tags);
  const [visibleTagModal, setVisibleTagModal] = useState(false);
  const typeDropdownRef = useRef<any | null>(null);

  const {user} = useAuthenticate();

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

  const typeDropdown = (
    <Dropdown
      {...defaultDropdownProps}
      title="タイプを選択"
      ref={typeDropdownRef}>
      {isCreatableWiki({type: WikiType.RULES, userRole: user?.role}) ? (
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
          {wikiTypeNameFactory(WikiType.RULES, RuleCategory.RULES, true)}
        </Dropdown.Option>
      ) : (
        <></>
      )}
      {isCreatableWiki({type: WikiType.RULES, userRole: user?.role}) ? (
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
          {wikiTypeNameFactory(WikiType.RULES, RuleCategory.PHILOSOPHY, true)}
        </Dropdown.Option>
      ) : (
        <></>
      )}
      {isCreatableWiki({type: WikiType.RULES, userRole: user?.role}) ? (
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
          {wikiTypeNameFactory(WikiType.RULES, RuleCategory.ABC, true)}
        </Dropdown.Option>
      ) : (
        <></>
      )}
      {isCreatableWiki({type: WikiType.RULES, userRole: user?.role}) ? (
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
          {wikiTypeNameFactory(WikiType.RULES, RuleCategory.BENEFITS, true)}
        </Dropdown.Option>
      ) : (
        <></>
      )}
      {isCreatableWiki({type: WikiType.RULES, userRole: user?.role}) ? (
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
          {wikiTypeNameFactory(WikiType.RULES, RuleCategory.DOCUMENT, true)}
        </Dropdown.Option>
      ) : (
        <></>
      )}
      {isCreatableWiki({type: WikiType.ALL_POSTAL, userRole: user?.role}) ? (
        <Dropdown.Option
          {...defaultDropdownOptionProps}
          onPress={() =>
            setNewWiki(w => ({
              ...w,
              type: WikiType.ALL_POSTAL,
              ruleCategory: RuleCategory.NON_RULE,
            }))
          }
          value={WikiType.ALL_POSTAL}>
          {wikiTypeNameFactory(WikiType.ALL_POSTAL)}
        </Dropdown.Option>
      ) : (
        <></>
      )}
      {isCreatableWiki({
        type: WikiType.BOARD,
        boardCategory: BoardCategory.KNOWLEDGE,
        userRole: user?.role,
      }) ? (
        <Dropdown.Option
          {...defaultDropdownOptionProps}
          onPress={() =>
            setNewWiki(w => ({
              ...w,
              type: WikiType.BOARD,
              ruleCategory: RuleCategory.NON_RULE,
              boardCategory: BoardCategory.KNOWLEDGE,
            }))
          }
          value={BoardCategory.KNOWLEDGE}>
          {wikiTypeNameFactory(
            WikiType.BOARD,
            undefined,
            true,
            BoardCategory.KNOWLEDGE,
          )}
        </Dropdown.Option>
      ) : (
        <></>
      )}
      {isCreatableWiki({
        type: WikiType.BOARD,
        boardCategory: BoardCategory.QA,
        userRole: user?.role,
      }) ? (
        <Dropdown.Option
          {...defaultDropdownOptionProps}
          onPress={() =>
            setNewWiki(w => ({
              ...w,
              type: WikiType.BOARD,
              ruleCategory: RuleCategory.NON_RULE,
              boardCategory: BoardCategory.QA,
            }))
          }
          value={BoardCategory.QA}>
          {wikiTypeNameFactory(
            WikiType.BOARD,
            undefined,
            true,
            BoardCategory.QA,
          )}
        </Dropdown.Option>
      ) : (
        <></>
      )}
      {isCreatableWiki({
        type: WikiType.BOARD,
        boardCategory: BoardCategory.NEWS,
        userRole: user?.role,
      }) ? (
        <Dropdown.Option
          {...defaultDropdownOptionProps}
          onPress={() =>
            setNewWiki(w => ({
              ...w,
              type: WikiType.BOARD,
              ruleCategory: RuleCategory.NON_RULE,
              boardCategory: BoardCategory.NEWS,
            }))
          }
          value={BoardCategory.NEWS}>
          {wikiTypeNameFactory(
            WikiType.BOARD,
            undefined,
            true,
            BoardCategory.NEWS,
          )}
        </Dropdown.Option>
      ) : (
        <></>
      )}
      {isCreatableWiki({
        type: WikiType.BOARD,
        boardCategory: BoardCategory.IMPRESSIVE_UNIVERSITY,
        userRole: user?.role,
      }) ? (
        <Dropdown.Option
          {...defaultDropdownOptionProps}
          onPress={() =>
            setNewWiki(w => ({
              ...w,
              type: WikiType.BOARD,
              ruleCategory: RuleCategory.NON_RULE,
              boardCategory: BoardCategory.IMPRESSIVE_UNIVERSITY,
            }))
          }
          value={BoardCategory.IMPRESSIVE_UNIVERSITY}>
          {wikiTypeNameFactory(
            WikiType.BOARD,
            undefined,
            true,
            BoardCategory.IMPRESSIVE_UNIVERSITY,
          )}
        </Dropdown.Option>
      ) : (
        <></>
      )}
      {isCreatableWiki({
        type: WikiType.BOARD,
        boardCategory: BoardCategory.CLUB,
        userRole: user?.role,
      }) ? (
        <Dropdown.Option
          {...defaultDropdownOptionProps}
          onPress={() =>
            setNewWiki(w => ({
              ...w,
              type: WikiType.BOARD,
              ruleCategory: RuleCategory.NON_RULE,
              boardCategory: BoardCategory.CLUB,
            }))
          }
          value={BoardCategory.CLUB}>
          {wikiTypeNameFactory(
            WikiType.BOARD,
            undefined,
            true,
            BoardCategory.CLUB,
          )}
        </Dropdown.Option>
      ) : (
        <></>
      )}
      {isCreatableWiki({
        type: WikiType.BOARD,
        boardCategory: BoardCategory.STUDY_MEETING,
        userRole: user?.role,
      }) ? (
        <Dropdown.Option
          {...defaultDropdownOptionProps}
          onPress={() =>
            setNewWiki(w => ({
              ...w,
              type: WikiType.BOARD,
              ruleCategory: RuleCategory.NON_RULE,
              boardCategory: BoardCategory.STUDY_MEETING,
            }))
          }
          value={BoardCategory.STUDY_MEETING}>
          {wikiTypeNameFactory(
            WikiType.BOARD,
            undefined,
            true,
            BoardCategory.STUDY_MEETING,
          )}
        </Dropdown.Option>
      ) : (
        <></>
      )}
      {isCreatableWiki({
        type: WikiType.BOARD,
        boardCategory: BoardCategory.CELEBRATION,
        userRole: user?.role,
      }) ? (
        <Dropdown.Option
          {...defaultDropdownOptionProps}
          onPress={() =>
            setNewWiki(w => ({
              ...w,
              type: WikiType.BOARD,
              ruleCategory: RuleCategory.NON_RULE,
              boardCategory: BoardCategory.CELEBRATION,
            }))
          }
          value={BoardCategory.CELEBRATION}>
          {wikiTypeNameFactory(
            WikiType.BOARD,
            undefined,
            true,
            BoardCategory.CELEBRATION,
          )}
        </Dropdown.Option>
      ) : (
        <></>
      )}
      {isCreatableWiki({
        type: WikiType.BOARD,
        boardCategory: BoardCategory.OTHER,
        userRole: user?.role,
      }) ? (
        <Dropdown.Option
          {...defaultDropdownOptionProps}
          onPress={() =>
            setNewWiki(w => ({
              ...w,
              type: WikiType.BOARD,
              ruleCategory: RuleCategory.NON_RULE,
              boardCategory: BoardCategory.OTHER,
            }))
          }
          value={BoardCategory.OTHER}>
          {wikiTypeNameFactory(
            WikiType.BOARD,
            undefined,
            true,
            BoardCategory.OTHER,
          )}
        </Dropdown.Option>
      ) : (
        <></>
      )}
    </Dropdown>
  );

  return (
    <WholeContainer>
      <HeaderWithTextButton
        title={wiki?.id ? 'Wiki編集' : 'Wiki作成'}
        enableBackButton={true}
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
      {typeDropdown}
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
              <Button
                bg="white"
                borderWidth={1}
                borderColor={'#ececec'}
                p="md"
                color="black"
                w={windowWidth * 0.9}
                onPress={() => typeDropdownRef.current.open()}>
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
            onPress={() => handleSubmit()}>
            投稿
          </Button>
        </Div>
        {errors.body && touched.body ? (
          <Text fontSize={16} color="tomato">
            {errors.body}
          </Text>
        ) : null}
        <Div
          flexDir="column"
          alignItems="flex-start"
          alignSelf="center"
          mb={'lg'}>
          <Text fontSize={16}>添付ファイルを選択</Text>
          <DropdownOpenerButton
            name={'タップでファイルを選択'}
            onPress={() => handlePickDocument(uploadFile)}
          />
        </Div>
        {newWiki.files?.map(f => (
          <Div
            key={f.id}
            mb={'lg'}
            w={'100%'}
            borderColor={blueColor}
            borderWidth={1}
            px={8}
            py={8}
            flexDir="row"
            justifyContent="space-between"
            rounded="md">
            <Text fontSize={16} color={blueColor} w="80%">
              {
                (decodeURI(f.url || '')?.match('.+/(.+?)([?#;].*)?$') || [
                  '',
                  f.url,
                ])[1]
              }
            </Text>
            <TouchableOpacity>
              <Icon name="closecircle" color="gray900" fontSize={24} />
            </TouchableOpacity>
          </Div>
        ))}
        <Div mb={60}>
          <TextEditor
            textFormat={newWiki.textFormat}
            onUploadImage={onUploadImage}
            initialBody={newWiki.body}
            onChange={text => setNewWiki(w => ({...w, body: text}))}
          />
        </Div>
      </KeyboardAwareScrollView>
    </WholeContainer>
  );
};

export default WikiForm;
