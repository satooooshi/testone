import {useFormik} from 'formik';
import {
  Button,
  Div,
  Dropdown,
  Icon,
  Input,
  Tag as TagButton,
  Text,
} from 'react-native-magnus';
import {Alert, Platform, useWindowDimensions} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import TagModal from '../../components/common/TagModal';
import HeaderWithTextButton from '../../components/Header';
import WholeContainer from '../../components/WholeContainer';
import TextEditor from '../../components/wiki/TextEditor';
import {useTagType} from '../../hooks/tag/useTagType';
import {BoardCategory, RuleCategory, Tag, Wiki, WikiType} from '../../types';
import {wikiTypeNameFactory} from '../../utils/factory/wiki/wikiTypeNameFactory';
import {wikiSchema} from '../../utils/validation/schema';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {NodeHtmlMarkdown} from 'node-html-markdown';
import {useAuthenticate} from '../../contexts/useAuthenticate';
import {isCreatableWiki} from '../../utils/factory/wiki/isCreatableWiki';
import {tagFontColorFactory} from '../../utils/factory/tagFontColorFactory';
import {tagBgColorFactory} from '../../utils/factory/tagBgColorFactory';
import {TouchableOpacity} from 'react-native-gesture-handler';
import DropdownOpenerButton from '../../components/common/DropdownOpenerButton';
import {blueColor} from '../../utils/colors';
import {useAPIUploadStorage} from '../../hooks/api/storage/useAPIUploadStorage';
import ModalSelectingWikiType, {
  SelectWikiArg,
} from '../../components/wiki/ModalSelectWikiType';
import QuillEditor from 'react-native-cn-quill';
import DocumentPicker from 'react-native-document-picker';

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
  //const navigation = useNavigation<PostWikiRouteProps>();
  const scrollRef = useRef<KeyboardAwareScrollView | null>(null);
  const quillRef = useRef<QuillEditor | null>(null);
  const [willSubmit, setWillSubmit] = useState(false);
  const initialValues: Partial<Wiki> = {
    title: '',
    body: '',
    tags: [],
    type: type || undefined,
    ruleCategory: ruleCategory || RuleCategory.NON_RULE,
    files: [],
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
  const {mutate: uploadFile} = useAPIUploadStorage();

  const normalizeURL = (url: string) => {
    const filePrefix = 'file://';
    if (url.startsWith(filePrefix)) {
      url = url.substring(filePrefix.length);
      url = decodeURI(url);
      return url;
    }
  };

  const handlePickDocument = async () => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.allFiles],
      });
      const formData = new FormData();
      formData.append('files', {
        name: res.name,
        uri: Platform.OS === 'android' ? res.uri : normalizeURL(res.uri),
        type: res.type,
      });
      uploadFile(formData, {
        onSuccess: uploadedURL => {
          setNewWiki(e => {
            const newWikiFile = {url: uploadedURL[0], name: res.name};
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
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
      } else {
        throw err;
      }
    }
  };

  const {width: windowWidth} = useWindowDimensions();
  const {selectedTagType, filteredTags} = useTagType('All', tags);
  const [visibleTagModal, setVisibleTagModal] = useState(false);
  const [visibleSelectTypeModal, setVisibleSelectTypeModal] =
    useState<boolean>(false);

  const {user} = useAuthenticate();

  const removeFile = (fileUrl: string) => {
    setNewWiki(e => {
      if (e.files?.length) {
        return {...e, files: e.files.filter(f => f.url !== fileUrl)};
      }
      return e;
    });
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
        rightButtonName={'投稿'}
        onPressRightButton={() => setWillSubmit(true)}
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
        // eslint-disable-next-line react-native/no-inline-styles
        style={{backgroundColor: 'white'}}
        keyboardDismissMode={'none'}>
        <Div p="5%" bg="white">
          <Div mb="lg">
            <Text fontSize={16} mb={4}>
              タイトル
            </Text>
            {errors.title && touched.title ? (
              <Text fontSize={16} color="tomato">
                {errors.title}
              </Text>
            ) : null}
            <Input
              placeholder="タイトルを入力してください"
              value={newWiki.title}
              fontSize={16}
              rounded="xl"
              onChangeText={text => setNewWiki(w => ({...w, title: text}))}
            />
          </Div>

          <Div mb="lg">
            <Text fontSize={16} mb={4}>
              タイプを選択
            </Text>
            {errors.type && touched.type ? (
              <Text fontSize={16} color="tomato">
                {errors.type}
              </Text>
            ) : null}
            <Button
              block
              bg="white"
              borderWidth={1}
              borderColor={'#ececec'}
              color="black"
              rounded="xl"
              suffix={
                <Icon
                  position="absolute"
                  right={8}
                  name="down"
                  fontSize={16}
                  color="gray"
                  fontFamily="AntDesign"
                />
              }
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

          <Div mb="lg">
            <Text fontSize={16} mb={4}>
              タグを選択
            </Text>
            <Button
              bg="white"
              rounded="circle"
              color="blue700"
              fontSize={14}
              fontWeight="bold"
              borderWidth={1}
              borderColor="blue700"
              py="md"
              px="lg"
              mb="sm"
              onPress={() => setVisibleTagModal(true)}
              prefix={
                <Icon
                  name="add"
                  fontSize={14}
                  color="blue700"
                  fontFamily="MaterialIcons"
                />
              }>
              タグを追加
            </Button>
            <Div
              flexDir="row"
              flexWrap="wrap"
              w={'100%'}
              justifyContent="flex-start">
              {newWiki.tags?.map(t => (
                <TagButton
                  key={t.id}
                  mr={4}
                  mb={8}
                  fontSize="md"
                  color={tagFontColorFactory(t.type)}
                  bg={tagBgColorFactory(t.type)}>
                  {t.name}
                </TagButton>
              ))}
            </Div>
          </Div>

          <Div
            flexDir="column"
            alignItems="flex-start"
            alignSelf="center"
            mb={'lg'}>
            <Text fontSize={16}>添付ファイルを選択</Text>
            <DropdownOpenerButton
              name={'タップでファイルを選択'}
              onPress={() => handlePickDocument()}
            />
          </Div>
          {newWiki.files?.map(f => (
            <Div
              key={f.id}
              mb={'lg'}
              w={'100%'}
              h={'10%'}
              borderColor={blueColor}
              borderWidth={1}
              px={8}
              py={8}
              flexDir="row"
              justifyContent="space-between"
              rounded="md">
              <Text fontSize={16} color={blueColor} w="80%">
                {f.name}
              </Text>
              <TouchableOpacity onPress={() => removeFile(f.url || '')}>
                <Icon name="closecircle" color="gray900" fontSize={24} />
              </TouchableOpacity>
            </Div>
          ))}

          <Div mb="lg">
            <Text fontSize={16} mb={4}>
              本文
            </Text>
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
          </Div>
        </Div>
      </KeyboardAwareScrollView>
    </WholeContainer>
  );
};

export default WikiForm;
