import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
  ChangeEvent,
} from 'react';
import qaCreateStyles from '@/styles/layouts/QACreate.module.scss';
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
  UserRole,
  WikiType,
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
} from '@chakra-ui/react';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import { Editor, EditorState } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import WrappedEditor from '@/components/wiki/WrappedEditor';
import MarkdownEditor from 'react-markdown-editor-lite';
import { liteEditorPlugins } from 'src/utils/liteEditorPlugins';
import MarkdownIt from 'markdown-it';
import { uploadStorage } from '@/hooks/api/storage/useAPIUploadStorage';
import { tagColorFactory } from 'src/utils/factory/tagColorFactory';
import { useFormik } from 'formik';
import { wikiSchema } from 'src/utils/validation/schema';
import { stateFromHTML } from 'draft-js-import-html';
import { imageExtensionsForMarkDownEditor } from 'src/utils/imageExtensions';
import { wikiTypeNameFactory } from 'src/utils/wiki/wikiTypeNameFactory';

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
  const mdParser = new MarkdownIt({
    breaks: true,
  });
  const draftEditor = useRef<Editor | null>(null);
  const router = useRouter();
  const { type } = router.query as { type: WikiType };
  const { user } = useAuthenticate();

  const [tagModal, setTagModal] = useState(false);
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty(),
  );
  const [activeTab, setActiveTab] = useState<TabName>(TabName.EDIT);
  const initialValues: Partial<Wiki> = wiki || {
    title: '',
    body: '',
    tags: [],
    type: type || WikiType.BOARD,
    ruleCategory: type === WikiType.RULES ? RuleCategory.RULES : undefined,
    boardCategory:
      type === WikiType.BOARD ? BoardCategory.QA : BoardCategory.NON_BOARD,
    textFormat: 'html',
  };
  const draftJsEmptyError = '入力必須です';
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

  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');
  const formTopRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<MarkdownEditor | null>(null);

  const tabs: Tab[] = [
    {
      onClick: () => setActiveTab(TabName.EDIT),
      name: '内容の編集',
    },
  ];

  const headerTabName = '内容を編集';

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
          ? 'ファイルの容量が大きい為、アップロード出来ませんでした。\n容量が大きくないファイルを使用して下さい。'
          : 'ファイルのアップロードに失敗しました。',
      );
      return 'ファイルアップロード失敗しました';
    }
  };

  const onTypeSelectionChange = (e: ChangeEvent<HTMLSelectElement>) => {
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
      e.target.value === BoardCategory.CELEBRATION ||
      e.target.value === BoardCategory.OTHER
    ) {
      setNewQuestion((prev) => ({
        ...prev,
        type: WikiType.RULES,
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
          <title>ボールド | {wiki ? 'Wiki編集' : 'Wiki作成'}</title>
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
        <div ref={formTopRef} className={qaCreateStyles.type_select_wrapper}>
          <FormControl className={qaCreateStyles.title_input}>
            <FormLabel>タイトル</FormLabel>
            {errors.title && touched.title ? (
              <Text color="tomato">{errors.title}</Text>
            ) : null}
            <Text></Text>
            <Input
              type="text"
              width="100%"
              placeholder="タイトルを入力してください"
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
              className={qaCreateStyles.type_select}>
              <FormLabel fontWeight="bold">タイプを選択してください</FormLabel>
              <Select
                colorScheme="teal"
                bg="white"
                onChange={onTypeSelectionChange}
                defaultValue={
                  type === WikiType.RULES
                    ? RuleCategory.RULES
                    : type === WikiType.ALL_POSTAL
                    ? type
                    : BoardCategory.QA
                }>
                {user?.role === UserRole.ADMIN && (
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
                    <option value={WikiType.ALL_POSTAL}>
                      {wikiTypeNameFactory(WikiType.ALL_POSTAL)}
                    </option>
                  </>
                )}
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
                <option value={BoardCategory.NEWS}>
                  {wikiTypeNameFactory(
                    WikiType.BOARD,
                    undefined,
                    true,
                    BoardCategory.NEWS,
                  )}
                </option>
                <option value={BoardCategory.IMPRESSIVE_UNIVERSITY}>
                  {wikiTypeNameFactory(
                    WikiType.BOARD,
                    undefined,
                    true,
                    BoardCategory.IMPRESSIVE_UNIVERSITY,
                  )}
                </option>
                <option value={BoardCategory.CLUB}>
                  {wikiTypeNameFactory(
                    WikiType.BOARD,
                    undefined,
                    true,
                    BoardCategory.CLUB,
                  )}
                </option>
                <option value={BoardCategory.STUDY_MEETING}>
                  {wikiTypeNameFactory(
                    WikiType.BOARD,
                    undefined,
                    true,
                    BoardCategory.STUDY_MEETING,
                  )}
                </option>
                <option value={BoardCategory.CELEBRATION}>
                  {wikiTypeNameFactory(
                    WikiType.BOARD,
                    undefined,
                    true,
                    BoardCategory.CELEBRATION,
                  )}
                </option>
                <option value={BoardCategory.OTHER}>
                  {wikiTypeNameFactory(
                    WikiType.BOARD,
                    undefined,
                    true,
                    BoardCategory.OTHER,
                  )}
                </option>
              </Select>
            </FormControl>
          )}
        </div>

        <div className={qaCreateStyles.top_form_wrapper}>
          {!wiki && (
            <div className={qaCreateStyles.format_selector_wrapper}>
              <FormControl className={qaCreateStyles.type_select}>
                <FormLabel fontWeight="bold">
                  入力形式(投稿後に変更することはできません)
                </FormLabel>
                <Select
                  colorScheme="teal"
                  bg="white"
                  defaultValue={
                    newQuestion.textFormat !== 'markdown' ? 'html' : 'markdown'
                  }
                  onChange={(e) => {
                    if (
                      confirm('現在の入力内容は失われます。よろしいですか？')
                    ) {
                      setEditorState(EditorState.createEmpty());
                      setNewQuestion((prev) => ({
                        ...prev,
                        body: '',
                        textFormat: e.target.value as TextFormat,
                      }));
                    }
                  }}>
                  <option value={'html'}>デフォルト</option>
                  <option value={'markdown'}>マークダウン</option>
                </Select>
              </FormControl>
            </div>
          )}
          <div className={qaCreateStyles.title_wrapper}>
            <div className={qaCreateStyles.button_wrapper}>
              <Button
                colorScheme="blue"
                onClick={() => setTagModal(true)}
                marginRight="16px">
                タグを編集
              </Button>
              <Button colorScheme="pink" onClick={() => handleSubmit()}>
                {wiki ? `${saveButtonName}を更新` : `${saveButtonName}を投稿`}
              </Button>
            </div>
          </div>
        </div>
        {newQuestion.tags?.length ? (
          <div className={qaCreateStyles.tags}>
            {newQuestion.tags.map((t) => (
              <div key={t.id} className={qaCreateStyles.tag__item}>
                <Button colorScheme={tagColorFactory(t.type)} size="xs">
                  {t.name}
                </Button>
              </div>
            ))}
          </div>
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
              placeholder="内容を入力して下さい(空白のみは不可)"
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
            placeholder="内容を入力して下さい(空白のみは不可)"
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
