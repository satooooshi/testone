import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
  ChangeEvent,
} from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { SidebarScreenName } from '@/components/layout/Sidebar';
import LayoutWithTab from '@/components/layout/LayoutWithTab';
import TagModal from '@/components/common/TagModal';
import WrappedDraftEditor from '@/components/wiki/WrappedDraftEditor';
import {
  Wiki,
  Tag,
  TextFormat,
  WikiType,
  WikiFile,
  RuleCategory,
  BoardCategory,
} from 'src/types';
import { Tab, TabName } from 'src/types/header/tab/types';
import {
  Button,
  Input,
  Select,
  useMediaQuery,
  FormControl,
  FormLabel,
  Text,
  Box,
  Spinner,
} from '@chakra-ui/react';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import { Editor, EditorState } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import WrappedEditor from '@/components/wiki/WrappedEditor';
import MarkdownEditor from 'react-markdown-editor-lite';
import { liteEditorPlugins } from 'src/utils/liteEditorPlugins';
import MarkdownIt from 'markdown-it';
import {
  uploadStorage,
  useAPIUploadStorage,
} from '@/hooks/api/storage/useAPIUploadStorage';
import { tagColorFactory } from 'src/utils/factory/tagColorFactory';
import { useFormik } from 'formik';
import { wikiSchema } from 'src/utils/validation/schema';
import { stateFromHTML } from 'draft-js-import-html';
import { imageExtensionsForMarkDownEditor } from 'src/utils/imageExtensions';
import { wikiTypeNameFactory } from 'src/utils/wiki/wikiTypeNameFactory';
import { isCreatableWiki } from 'src/utils/factory/isCreatableWiki';
import { MdCancel } from 'react-icons/md';
import { useDropzone } from 'react-dropzone';
import { fileNameTransformer } from 'src/utils/factory/fileNameTransformer';
import WikiFormStyle from '@/styles/components/WikiForm.module.scss';
import { hideScrollbarCss } from 'src/utils/chakra/hideScrollBar.css';

type WikiFormProps = {
  wiki?: Wiki;
  tags?: Tag[];
  setWikiType: React.Dispatch<React.SetStateAction<string>>;
  onClickSaveButton: (wiki: Partial<Wiki>) => void;
};

const WikiForm: React.FC<WikiFormProps> = ({
  wiki,
  tags,
  setWikiType,
  onClickSaveButton,
}) => {
  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');
  const mdParser = new MarkdownIt({
    breaks: true,
  });
  const draftEditor = useRef<Editor | null>(null);
  const router = useRouter();
  const { type } = router.query as { type: WikiType };
  const { user } = useAuthenticate();
  const [tagModal, setTagModal] = useState(false);
  const [isLoadingRF, setIsloadingRF] = useState(false);
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty(),
  );
  const [activeTab, setActiveTab] = useState<TabName>(TabName.EDIT);
  const initialValues: Partial<Wiki> = wiki || {
    title: '',
    body: '',
    tags: [],
    type: type || undefined,
    ruleCategory: type === WikiType.RULES ? RuleCategory.RULES : undefined,
    files: [],
    boardCategory:
      type === WikiType.BOARD || !type
        ? BoardCategory.QA
        : BoardCategory.NON_BOARD,
    textFormat: 'html',
  };
  const draftJsEmptyError = '??????????????????';
  const {
    values: newQuestion,
    setValues: setNewQuestion,
    errors,
    touched,
    handleSubmit,
  } = useFormik({
    enableReinitialize: true,
    initialValues,
    validationSchema: wikiSchema,
    onSubmit: (q) => {
      setWikiType(saveButtonName);

      if (wiki) {
        onClickSaveButton({
          ...wiki,
          ...q,
          body:
            q.textFormat === 'html'
              ? stateToHTML(editorState.getCurrentContent())
              : q.body,
        });
        return;
      }
      onClickSaveButton({
        ...q,
        body:
          q.textFormat === 'html'
            ? stateToHTML(editorState.getCurrentContent())
            : q.body,
      });
    },
  });

  const formTopRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<MarkdownEditor | null>(null);

  const tabs: Tab[] = [
    {
      onClick: () => setActiveTab(TabName.EDIT),
      name: '???????????????',
    },
  ];

  const [willSubmit, setWillSubmit] = useState(false);

  useEffect(() => {
    const safetySubmit = async () => {
      handleSubmit();
      await new Promise((r) => setTimeout(r, 1000));
      setWillSubmit(false);
    };
    if (willSubmit) {
      safetySubmit();
    }
  }, [willSubmit, handleSubmit]);

  const headerTabName = '???????????????';

  const saveButtonName = useMemo(() => {
    return newQuestion.type
      ? wikiTypeNameFactory(
          newQuestion.type,
          newQuestion.ruleCategory,
          true,
          newQuestion.boardCategory,
        )
      : 'Wiki';
  }, [newQuestion.boardCategory, newQuestion.ruleCategory, newQuestion.type]);

  const toggleTag = (t: Tag) => {
    const isExist = newQuestion.tags?.filter(
      (existT) => existT.id === t.id,
    ).length;
    if (isExist) {
      setNewQuestion((q) => ({
        ...newQuestion,
        tags: q.tags ? q.tags.filter((existT) => existT.id !== t.id) : [],
      }));
      return;
    }
    setNewQuestion((q) => ({
      ...q,
      tags: q.tags ? [...q.tags, t] : [t],
    }));
  };
  const handleEditorChange = ({ text }: any) => {
    setNewQuestion((q) => ({ ...q, body: text }));
  };
  const handleImageUpload = async (file: File) => {
    try {
      const uploadedImageURL = await uploadStorage([file]);
      return uploadedImageURL[0];
    } catch (err) {
      alert(
        err instanceof Error && err.message.includes('413')
          ? '????????????????????????????????????????????????????????????????????????????????????\n???????????????????????????????????????????????????????????????'
          : '?????????????????????????????????????????????????????????',
      );
      return '????????????????????????????????????????????????';
    }
  };

  const {
    getRootProps: getRelatedFileRootProps,
    getInputProps: getRelatedFileInputProps,
  } = useDropzone({
    onDrop: (files: File[]) => {
      setIsloadingRF(true);
      uploadFiles(files, {
        onSuccess: (urls: string[]) => {
          const newFiles: Partial<WikiFile>[] = urls.map((u, i) => ({
            url: u,
            name: files[i].name,
          }));
          setNewQuestion((e) => ({
            ...e,
            files: [...(e.files || []), ...newFiles],
          }));
        },
        onSettled: () => {
          setIsloadingRF(false);
        },
      });
    },
  });

  const { mutate: uploadFiles, isLoading } = useAPIUploadStorage();

  const onTypeSelectionChange = (e: ChangeEvent<HTMLSelectElement>) => {
    if (!e.target.value) {
      return setNewQuestion((e) => ({ ...e, type: undefined }));
    }
    if (
      e.target.value === RuleCategory.RULES ||
      e.target.value === RuleCategory.ABC ||
      e.target.value === RuleCategory.PHILOSOPHY ||
      e.target.value === RuleCategory.BENEFITS ||
      e.target.value === RuleCategory.DOCUMENT
    ) {
      setNewQuestion((prev) => ({
        ...prev,
        type: WikiType.RULES,
        ruleCategory: e.target.value as RuleCategory,
        boardCategory: BoardCategory.NON_BOARD,
      }));
    } else if (
      e.target.value === BoardCategory.KNOWLEDGE ||
      e.target.value === BoardCategory.QA ||
      e.target.value === BoardCategory.NEWS ||
      e.target.value === BoardCategory.IMPRESSIVE_UNIVERSITY ||
      e.target.value === BoardCategory.CLUB ||
      e.target.value === BoardCategory.STUDY_MEETING ||
      e.target.value === BoardCategory.SELF_IMPROVEMENT ||
      e.target.value === BoardCategory.PERSONAL_ANNOUNCEMENT ||
      e.target.value === BoardCategory.CELEBRATION ||
      e.target.value === BoardCategory.OTHER
    ) {
      setNewQuestion((prev) => ({
        ...prev,
        type: WikiType.BOARD,
        ruleCategory: RuleCategory.NON_RULE,
        boardCategory: e.target.value as BoardCategory,
      }));
    } else {
      setNewQuestion((prev) => ({
        ...prev,
        type: e.target.value as WikiType,
        ruleCategory: RuleCategory.NON_RULE,
        boardCategory: BoardCategory.NON_BOARD,
      }));
    }
  };

  useEffect(() => {
    if (wiki) {
      if (wiki.textFormat === 'html') {
        setEditorState(EditorState.createWithContent(stateFromHTML(wiki.body)));
      }
    }
  }, [setNewQuestion, wiki]);

  useEffect(() => {
    if (editorState) {
      setNewQuestion((q) =>
        q.textFormat === 'html'
          ? {
              ...q,
              body: stateToHTML(editorState.getCurrentContent()),
            }
          : q,
      );
    }
  }, [editorState, setNewQuestion, wiki]);

  useEffect(() => {
    formTopRef.current?.scrollIntoView();
  }, []);

  return (
    <>
      <LayoutWithTab
        sidebar={{ activeScreenName: SidebarScreenName.QA }}
        header={{
          title: headerTabName,
          activeTabName: activeTab,
          tabs,
        }}>
        <Head>
          <title>???????????? | {wiki ? 'Wiki??????' : 'Wiki??????'}</title>
        </Head>
        <TagModal
          isOpen={tagModal}
          tags={tags ? tags : []}
          selectedTags={newQuestion.tags ? newQuestion.tags : []}
          toggleTag={toggleTag}
          onComplete={() => setTagModal(false)}
          onClear={() => {
            setNewQuestion((q) => ({ ...q, tags: [] }));
            setTagModal(false);
          }}
        />
        <Box
          ref={formTopRef}
          w="80vw"
          mb={isSmallerThan768 ? 'auto' : '24px'}
          display="flex"
          flexDir={isSmallerThan768 ? 'column' : 'row'}>
          <FormControl
            mr={isSmallerThan768 ? 0 : '16px'}
            mb={isSmallerThan768 ? '16px' : 0}>
            <FormLabel>????????????</FormLabel>
            {errors.title && touched.title ? (
              <Text color="tomato">{errors.title}</Text>
            ) : null}
            <Text></Text>
            <Input
              type="text"
              width="100%"
              placeholder="???????????????????????????????????????"
              value={newQuestion.title}
              background="white"
              onChange={(e) =>
                setNewQuestion((q) => ({ ...q, title: e.target.value }))
              }
            />
          </FormControl>
          {!wiki && (
            <FormControl
              width={isSmallerThan768 ? '100%' : '30%'}
              mr="16px"
              display={isSmallerThan768 ? 'flex' : undefined}
              flexDir={isSmallerThan768 ? 'column' : undefined}
              mb={isSmallerThan768 ? '16px' : undefined}>
              <FormLabel fontWeight="bold">????????????????????????????????????</FormLabel>
              {errors.type && touched.type ? (
                <Text color="tomato">{errors.type}</Text>
              ) : null}
              <Select
                colorScheme="teal"
                bg="white"
                onChange={onTypeSelectionChange}
                defaultValue={newQuestion.type}>
                <option label={'????????????'}></option>
                {isCreatableWiki({
                  type: WikiType.RULES,
                  userRole: user?.role,
                }) ? (
                  <>
                    <option value={RuleCategory.PHILOSOPHY}>
                      {wikiTypeNameFactory(
                        WikiType.RULES,
                        RuleCategory.PHILOSOPHY,
                        true,
                      )}
                    </option>
                    <option value={RuleCategory.RULES}>
                      {wikiTypeNameFactory(
                        WikiType.RULES,
                        RuleCategory.RULES,
                        true,
                      )}
                    </option>
                    <option value={RuleCategory.ABC}>
                      {wikiTypeNameFactory(
                        WikiType.RULES,
                        RuleCategory.ABC,
                        true,
                      )}
                    </option>
                    <option value={RuleCategory.BENEFITS}>
                      {wikiTypeNameFactory(
                        WikiType.RULES,
                        RuleCategory.BENEFITS,
                        true,
                      )}
                    </option>
                    <option value={RuleCategory.DOCUMENT}>
                      {wikiTypeNameFactory(
                        WikiType.RULES,
                        RuleCategory.DOCUMENT,
                        true,
                      )}
                    </option>
                  </>
                ) : null}
                {isCreatableWiki({
                  type: WikiType.ALL_POSTAL,
                  userRole: user?.role,
                }) ? (
                  <option value={WikiType.ALL_POSTAL}>
                    {wikiTypeNameFactory(WikiType.ALL_POSTAL)}
                  </option>
                ) : null}
                {isCreatableWiki({
                  type: WikiType.MAIL_MAGAZINE,
                  userRole: user?.role,
                }) ? (
                  <option value={WikiType.MAIL_MAGAZINE}>
                    {wikiTypeNameFactory(WikiType.MAIL_MAGAZINE)}
                  </option>
                ) : null}
                {isCreatableWiki({
                  type: WikiType.MAIL_MAGAZINE,
                  userRole: user?.role,
                }) ? (
                  <option value={WikiType.INTERVIEW}>
                    {wikiTypeNameFactory(WikiType.INTERVIEW)}
                  </option>
                ) : null}

                <option value={BoardCategory.KNOWLEDGE}>
                  {wikiTypeNameFactory(
                    WikiType.BOARD,
                    undefined,
                    true,
                    BoardCategory.KNOWLEDGE,
                  )}
                </option>
                <option value={BoardCategory.QA}>
                  {wikiTypeNameFactory(
                    WikiType.BOARD,
                    undefined,
                    true,
                    BoardCategory.QA,
                  )}
                </option>
                {isCreatableWiki({
                  type: WikiType.BOARD,
                  boardCategory: BoardCategory.NEWS,
                  userRole: user?.role,
                }) ? (
                  <option value={BoardCategory.NEWS}>
                    {wikiTypeNameFactory(
                      WikiType.BOARD,
                      undefined,
                      true,
                      BoardCategory.NEWS,
                    )}
                  </option>
                ) : null}
                {isCreatableWiki({
                  type: WikiType.BOARD,
                  boardCategory: BoardCategory.IMPRESSIVE_UNIVERSITY,
                  userRole: user?.role,
                }) ? (
                  <option value={BoardCategory.IMPRESSIVE_UNIVERSITY}>
                    {wikiTypeNameFactory(
                      WikiType.BOARD,
                      undefined,
                      true,
                      BoardCategory.IMPRESSIVE_UNIVERSITY,
                    )}
                  </option>
                ) : null}
                {isCreatableWiki({
                  type: WikiType.BOARD,
                  boardCategory: BoardCategory.CLUB,
                  userRole: user?.role,
                }) ? (
                  <option value={BoardCategory.CLUB}>
                    {wikiTypeNameFactory(
                      WikiType.BOARD,
                      undefined,
                      true,
                      BoardCategory.CLUB,
                    )}
                  </option>
                ) : null}
                {isCreatableWiki({
                  type: WikiType.BOARD,
                  boardCategory: BoardCategory.STUDY_MEETING,
                  userRole: user?.role,
                }) ? (
                  <option value={BoardCategory.STUDY_MEETING}>
                    {wikiTypeNameFactory(
                      WikiType.BOARD,
                      undefined,
                      true,
                      BoardCategory.STUDY_MEETING,
                    )}
                  </option>
                ) : null}
                {isCreatableWiki({
                  type: WikiType.BOARD,
                  boardCategory: BoardCategory.SELF_IMPROVEMENT,
                  userRole: user?.role,
                }) ? (
                  <option value={BoardCategory.SELF_IMPROVEMENT}>
                    {wikiTypeNameFactory(
                      WikiType.BOARD,
                      undefined,
                      true,
                      BoardCategory.SELF_IMPROVEMENT,
                    )}
                  </option>
                ) : null}
                {isCreatableWiki({
                  type: WikiType.BOARD,
                  boardCategory: BoardCategory.PERSONAL_ANNOUNCEMENT,
                  userRole: user?.role,
                }) ? (
                  <option value={BoardCategory.PERSONAL_ANNOUNCEMENT}>
                    {wikiTypeNameFactory(
                      WikiType.BOARD,
                      undefined,
                      true,
                      BoardCategory.PERSONAL_ANNOUNCEMENT,
                    )}
                  </option>
                ) : null}
                {isCreatableWiki({
                  type: WikiType.BOARD,
                  boardCategory: BoardCategory.CELEBRATION,
                  userRole: user?.role,
                }) ? (
                  <option value={BoardCategory.CELEBRATION}>
                    {wikiTypeNameFactory(
                      WikiType.BOARD,
                      undefined,
                      true,
                      BoardCategory.CELEBRATION,
                    )}
                  </option>
                ) : null}
                {isCreatableWiki({
                  type: WikiType.BOARD,
                  boardCategory: BoardCategory.OTHER,
                  userRole: user?.role,
                }) ? (
                  <option value={BoardCategory.OTHER}>
                    {wikiTypeNameFactory(
                      WikiType.BOARD,
                      undefined,
                      true,
                      BoardCategory.OTHER,
                    )}
                  </option>
                ) : null}
              </Select>
            </FormControl>
          )}
        </Box>

        <Box
          display="flex"
          flexDir={isSmallerThan768 ? 'column' : 'row'}
          justifyContent="space-between"
          w="80vw"
          alignItems="center"
          maxW="1980px"
          mb="24px">
          {!wiki && (
            <Box mb={isSmallerThan768 ? '24px' : undefined} w="100%">
              <FormControl mr="16px" mb={isSmallerThan768 ? '16px' : undefined}>
                <FormLabel fontWeight="bold">
                  ????????????(????????????????????????????????????????????????)
                </FormLabel>
                <Select
                  colorScheme="teal"
                  bg="white"
                  defaultValue={
                    newQuestion.textFormat !== 'markdown' ? 'html' : 'markdown'
                  }
                  onChange={(e) => {
                    if (
                      confirm('??????????????????????????????????????????????????????????????????')
                    ) {
                      setEditorState(EditorState.createEmpty());
                      setNewQuestion((prev) => ({
                        ...prev,
                        body: '',
                        textFormat: e.target.value as TextFormat,
                      }));
                    }
                  }}>
                  <option value={'html'}>???????????????</option>
                  <option value={'markdown'}>??????????????????</option>
                </Select>
              </FormControl>
            </Box>
          )}
          <Box
            display="flex"
            flexDir={isSmallerThan768 ? 'column' : 'row'}
            alignItems="center"
            w="100%"
            justifyContent="flex-end">
            <Box
              display="flex"
              flexDir="row"
              justifyContent={isSmallerThan768 ? 'center' : 'flex-end'}>
              <Button
                colorScheme="brand"
                onClick={() => setTagModal(true)}
                marginRight="16px">
                ???????????????
              </Button>
              <Button colorScheme="pink" onClick={() => setWillSubmit(true)}>
                {wiki ? `${saveButtonName}?????????` : `${saveButtonName}?????????`}
              </Button>
            </Box>
          </Box>
        </Box>
        <Text mb="16px">??????????????????</Text>
        <Box display="flex" flexDir="row" alignItems="center" mb="16px">
          <div
            {...getRelatedFileRootProps({
              className: WikiFormStyle.image_dropzone,
            })}>
            {isLoadingRF ? (
              <Spinner />
            ) : (
              <>
                <input {...getRelatedFileInputProps()} />
                <Text>?????????????????????????????????????????????????????????</Text>
              </>
            )}
          </div>
        </Box>
        {newQuestion.files?.length ? (
          <Box mb="16px">
            {newQuestion.files.map((f) => (
              <Box
                key={f.url}
                borderColor={'blue.500'}
                rounded="md"
                borderWidth={1}
                display="flex"
                flexDir="row"
                justifyContent="space-between"
                alignItems="center"
                h="40px"
                w="350px"
                mb="8px"
                px="8px">
                <Text
                  color="blue.600"
                  alignSelf="center"
                  h="40px"
                  verticalAlign="middle"
                  textAlign="left"
                  display="flex"
                  alignItems="center"
                  whiteSpace="nowrap"
                  overflowX="auto"
                  w="95%"
                  css={hideScrollbarCss}>
                  {f.name}
                </Text>
                <MdCancel
                  className={WikiFormStyle.url_delete_button}
                  onClick={() =>
                    setNewQuestion({
                      ...newQuestion,
                      files: newQuestion.files?.filter(
                        (file) => file.url !== f.url,
                      ),
                    })
                  }
                />
              </Box>
            ))}
          </Box>
        ) : null}
        {newQuestion.tags?.length ? (
          <Box
            display="flex"
            flexDir="row"
            mb="24px"
            flexWrap="wrap"
            w="80vw"
            maxW="1980px">
            {newQuestion.tags.map((t) => (
              <Button
                key={t.id}
                colorScheme={tagColorFactory(t.type)}
                size="xs"
                mr="4px"
                mb="4px">
                {t.name}
              </Button>
            ))}
          </Box>
        ) : null}
        {touched.body &&
        newQuestion.textFormat === 'html' &&
        !editorState.getCurrentContent().hasText() ? (
          <Text color="tomato">{draftJsEmptyError}</Text>
        ) : null}
        {errors.body && touched.body ? (
          <Text color="tomato">{errors.body}</Text>
        ) : null}
        {newQuestion.textFormat === 'html' && (
          <div style={{ marginBottom: 40 }}>
            <WrappedDraftEditor
              style={{
                width: isSmallerThan768 ? '90vw' : '80vw',
                maxWidth: '1980px',
              }}
              placeholder="??????????????????????????????(?????????????????????)"
              editorRef={draftEditor}
              editorState={editorState}
              setEditorState={setEditorState}
            />
          </div>
        )}
        {newQuestion.textFormat === 'markdown' && activeTab === TabName.EDIT ? (
          <WrappedEditor
            style={{
              width: isSmallerThan768 ? '90vw' : '80vw',
              maxWidth: '1980px',
              height: '80vh',
              marginBottom: 40,
            }}
            placeholder="??????????????????????????????(?????????????????????)"
            editorRef={editorRef}
            onImageUpload={handleImageUpload}
            plugins={liteEditorPlugins}
            value={newQuestion.body}
            imageAccept={imageExtensionsForMarkDownEditor}
            onChange={handleEditorChange}
            renderHTML={(text: string) => mdParser.render(text)}
          />
        ) : null}
      </LayoutWithTab>
    </>
  );
};
export default WikiForm;
