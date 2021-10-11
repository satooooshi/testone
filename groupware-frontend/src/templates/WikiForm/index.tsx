import React, { useMemo, useState, useEffect, useRef } from 'react';
import qaCreateStyles from '@/styles/layouts/QACreate.module.scss';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { ScreenName } from '@/components/Sidebar';
import LayoutWithTab from '@/components/LayoutWithTab';
import TagModal from '@/components/TagModal';
import WrappedDraftEditor from '@/components/WrappedDraftEditor';
import { Wiki, Tag, TextFormat, UserRole, WikiType } from 'src/types';
import { Tab, TabName } from 'src/types/header/tab/types';
import {
  Button,
  Input,
  Select,
  useMediaQuery,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import { ContentState, convertFromHTML, Editor, EditorState } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import WrappedEditor from '@/components/WrappedEditor';
import MarkdownEditor from 'react-markdown-editor-lite';
import { liteEditorPlugins } from 'src/utils/liteEditorPlugins';
import MarkdownIt from 'markdown-it';
import { uploadStorage } from '@/hooks/api/storage/useAPIUploadStorage';
import MDEditor from '@uiw/react-md-editor';

type WikiFormProps = {
  wiki?: Wiki;
  tags?: Tag[];
  onClickSaveButton: (wiki: Partial<Wiki>) => void;
};

const WikiForm: React.FC<WikiFormProps> = ({
  wiki,
  tags,
  onClickSaveButton,
}) => {
  const mdParser = new MarkdownIt();
  const draftEditor = useRef<Editor | null>(null);
  const router = useRouter();
  const { type } = router.query as { type: WikiType };
  const { user } = useAuthenticate();

  const [tagModal, setTagModal] = useState(false);
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty(),
  );
  const [activeTab, setActiveTab] = useState<TabName>(TabName.EDIT);
  const [newQuestion, setNewQuestion] = useState<Partial<Wiki>>({
    title: '',
    body: '',
    tags: [],
    textFormat: 'html',
  });
  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');
  const formTopRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<MarkdownEditor | null>(null);

  const tabs: Tab[] =
    newQuestion.textFormat === 'html'
      ? [
          {
            onClick: () => setActiveTab(TabName.EDIT),
            name: '内容の編集',
          },
        ]
      : [
          {
            onClick: () => setActiveTab(TabName.EDIT),
            name: '内容の編集',
          },
          {
            onClick: () => setActiveTab(TabName.PREVIEW),
            name: 'プレビュー',
          },
        ];

  const headerTabName = useMemo(() => {
    switch (wiki?.type) {
      case WikiType.QA:
        return '質問を編集';
      case WikiType.RULES:
        return '社内規則を編集';
      case WikiType.KNOWLEDGE:
        return 'ナレッジを編集';
      default:
        return '編集';
    }
  }, [wiki?.type]);

  const toggleTag = (t: Tag) => {
    const isExist = newQuestion.tags?.filter(
      (existT) => existT.id === t.id,
    ).length;
    if (isExist) {
      setNewQuestion((q) => ({
        ...q,
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
    const uploadedImageURL = await uploadStorage([file]);
    return uploadedImageURL[0];
  };

  const handleSaveButton = () => {
    if (wiki) {
      onClickSaveButton({
        ...wiki,
        ...newQuestion,
        body:
          newQuestion.textFormat === 'html'
            ? stateToHTML(editorState.getCurrentContent())
            : newQuestion.body,
      });
      return;
    }
    onClickSaveButton({
      ...newQuestion,
      body:
        newQuestion.textFormat === 'html'
          ? stateToHTML(editorState.getCurrentContent())
          : newQuestion.body,
    });
  };

  useEffect(() => {
    if (wiki) {
      setNewQuestion(wiki);
      if (wiki.textFormat === 'html') {
        setEditorState((e) =>
          EditorState.push(
            e,
            ContentState.createFromBlockArray(
              convertFromHTML(wiki.body).contentBlocks,
              convertFromHTML(wiki.body).entityMap,
            ),
            'apply-entity',
          ),
        );
      }
    }
  }, [wiki]);

  useEffect(() => {
    formTopRef.current?.scrollIntoView();
  }, []);

  return (
    <>
      <LayoutWithTab
        sidebar={{ activeScreenName: ScreenName.QA }}
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
          onCancel={() => {
            setNewQuestion((q) => ({ ...q, tags: [] }));
            setTagModal(false);
          }}
        />
        <div ref={formTopRef} className={qaCreateStyles.type_select_wrapper}>
          <FormControl className={qaCreateStyles.title_input}>
            <FormLabel>タイトル</FormLabel>
            <Input
              type="text"
              width="100%"
              placeholder="タイトルを入力してください"
              value={newQuestion.title}
              background="white"
              onChange={(e) =>
                setNewQuestion((q) => ({ ...q, title: e.target.value }))
              }
              className={qaCreateStyles.title_input}
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
                defaultValue={type ? type : WikiType.QA}
                onChange={(e) =>
                  setNewQuestion((prev) => ({
                    ...prev,
                    type: e.target.value as WikiType,
                  }))
                }>
                {user?.role === UserRole.ADMIN && (
                  <option value={WikiType.RULES}>社内規則</option>
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
              <Button colorScheme="pink" onClick={() => handleSaveButton()}>
                {wiki ? '質問を更新' : '質問を投稿'}
              </Button>
            </div>
          </div>
        </div>
        {newQuestion.tags?.length ? (
          <div className={qaCreateStyles.tags}>
            {newQuestion.tags.map((t) => (
              <div key={t.id} className={qaCreateStyles.tag__item}>
                <Button colorScheme="purple" height="28px">
                  {t.name}
                </Button>
              </div>
            ))}
          </div>
        ) : null}
        {newQuestion.textFormat === 'html' && (
          <WrappedDraftEditor
            style={{
              width: isSmallerThan768 ? '90vw' : '80vw',
              maxWidth: '1980px',
              marginBottom: 40,
            }}
            placeholder="質問内容を入力して下さい"
            editorRef={draftEditor}
            editorState={editorState}
            setEditorState={setEditorState}
          />
        )}
        {newQuestion.textFormat === 'markdown' && activeTab === TabName.EDIT ? (
          <WrappedEditor
            style={{
              width: isSmallerThan768 ? '90vw' : '80vw',
              maxWidth: '1980px',
              height: '80vh',
              marginBottom: 40,
            }}
            placeholder="質問内容を入力して下さい"
            editorRef={editorRef}
            onImageUpload={handleImageUpload}
            plugins={liteEditorPlugins}
            value={newQuestion.body}
            onChange={handleEditorChange}
            renderHTML={(text: string) => mdParser.render(text)}
          />
        ) : null}
        {newQuestion.textFormat === 'markdown' &&
        activeTab === TabName.PREVIEW ? (
          <MDEditor.Markdown
            source={newQuestion.body}
            className={qaCreateStyles.markdown_preview}
          />
        ) : null}
      </LayoutWithTab>
    </>
  );
};
export default WikiForm;
