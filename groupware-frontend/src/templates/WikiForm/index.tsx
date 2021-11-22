import React, { useMemo, useState, useEffect, useRef } from 'react';
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
    type: type || WikiType.QA,
    ruleCategory: type ? RuleCategory.RULES : undefined,
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

  const headerTabName = useMemo(() => {
    switch (wiki?.type) {
      case WikiType.QA:
        return '質問を編集';
      case WikiType.RULES:
        return '社内規則を編集';
      case WikiType.ALL_POSTAL:
        return 'オール便を編集';
      case WikiType.KNOWLEDGE:
        return 'ナレッジを編集';
      default:
        return '編集';
    }
  }, [wiki?.type]);

  const saveButtonName = useMemo(() => {
    console.log(newQuestion.type);
    switch (newQuestion.type) {
      case WikiType.QA:
        return '質問';
      case WikiType.KNOWLEDGE:
        return 'ナレッジ';
      case WikiType.ALL_POSTAL:
        return 'オール便';
      case WikiType.RULES:
        switch (newQuestion.ruleCategory) {
          case RuleCategory.PHILOSOPHY:
            return '会社理念';
          case RuleCategory.RULES:
            return '社内規則';
          case RuleCategory.ABC:
            return 'ABC制度';
          case RuleCategory.BENEFITS:
            return '福利厚生等';
          case RuleCategory.DOCUMENT:
            return '各種申請書';
        }
      default:
        return '質問';
    }
  }, [newQuestion.ruleCategory, newQuestion.type]);

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
                defaultValue={
                  type === WikiType.RULES
                    ? RuleCategory.RULES
                    : type
                    ? type
                    : WikiType.QA
                }
                onChange={(e) => {
                  if (
                    e.target.value === WikiType.KNOWLEDGE ||
                    e.target.value === WikiType.QA ||
                    e.target.value === WikiType.ALL_POSTAL
                  ) {
                    setNewQuestion((prev) => ({
                      ...prev,
                      type: e.target.value as WikiType,
                      ruleCategory: undefined,
                    }));
                    return;
                  }
                  setNewQuestion((prev) => ({
                    ...prev,
                    type: WikiType.RULES,
                    ruleCategory: e.target.value as RuleCategory,
                  }));
                }}>
                {user?.role === UserRole.ADMIN && (
                  <>
                    <option value={RuleCategory.PHILOSOPHY}>会社理念</option>
                    <option value={RuleCategory.RULES}>社内規則</option>
                    <option value={RuleCategory.ABC}>ABC制度</option>
                    <option value={RuleCategory.BENEFITS}>福利厚生等</option>
                    <option value={RuleCategory.DOCUMENT}>各種申請書</option>
                    <option value={WikiType.ALL_POSTAL}>オール便</option>
                  </>
                )}
                <option value={WikiType.KNOWLEDGE}>ナレッジ</option>
                <option value={WikiType.QA}>質問</option>
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
