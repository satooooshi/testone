import React, { useMemo, useState, useEffect, useRef } from 'react';
import qaCreateStyles from '@/styles/layouts/QACreate.module.scss';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { ScreenName } from '@/components/Sidebar';
import LayoutWithTab from '@/components/LayoutWithTab';
import TagModal from '@/components/TagModal';
import WrappedEditor from '@/components/WrappedEditor';
import { Wiki, Tag, UserRole, WikiType } from 'src/types';
import { Tab, TabName } from 'src/types/header/tab/types';
import {
  Button,
  Input,
  Select,
  useMediaQuery,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import Editor from 'react-markdown-editor-lite';
import MDEditor, { MDEditorProps } from '@uiw/react-md-editor';
import { liteEditorPlugins } from 'src/utils/liteEditorPlugins';
import MarkdownIt from 'markdown-it';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import { useHeaderTab } from '@/hooks/headerTab/useHeaderTab';

type QAFormTypeProps = {
  wiki?: Wiki;
  tags?: Tag[];
  onClickSaveButton: (wiki: Partial<Wiki>) => void;
  handleImageUpload: (file: File) => Promise<string>;
};

const QAForm: React.FC<QAFormTypeProps> = ({
  wiki,
  tags,
  onClickSaveButton,
  handleImageUpload,
}) => {
  const mdParser = new MarkdownIt({ breaks: true });
  const mdEditor = useRef<Editor | null>(null);
  const router = useRouter();
  const { type } = router.query as { type: WikiType };
  const { user } = useAuthenticate();

  const [tagModal, setTagModal] = useState(false);
  const [editor, setEditor] = React.useState<MDEditorProps>({
    visiableDragbar: true,
    hideToolbar: true,
    highlightEnable: true,
    enableScroll: true,
    value: '',
    preview: 'live',
  });
  const [activeTab, setActiveTab] = useState<TabName>(TabName.EDIT);
  const [newWiki, setNewWiki] = useState<Partial<Wiki>>({
    title: '',
    body: '',
    tags: [],
    type: WikiType.QA,
  });
  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');

  const tabs: Tab[] = useHeaderTab({
    headerTabType: 'qaForm',
    setActiveTab,
    type,
  });

  const newQAHeaderTitleName = useMemo(() => {
    switch (newWiki.type) {
      case WikiType.QA:
        return '質問を新規作成';
      case WikiType.RULES:
        return '社内規則を新規作成';
      case WikiType.KNOWLEDGE:
        return 'ナレッジを新規作成';
      default:
        return '新規作成';
    }
  }, [newWiki.type]);

  const editQAHeaderTitleName = useMemo(() => {
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
    const isExist = newWiki.tags?.filter((existT) => existT.id === t.id).length;
    if (isExist) {
      setNewWiki((q) => ({
        ...q,
        tags: q.tags ? q.tags.filter((existT) => existT.id !== t.id) : [],
      }));
      return;
    }
    setNewWiki((q) => ({
      ...q,
      tags: q.tags ? [...q.tags, t] : [t],
    }));
  };

  const handleEditorChange = ({ text }: any) => {
    setNewWiki((q) => ({ ...q, body: text }));
  };

  useEffect(() => {
    if (wiki) {
      setNewWiki(wiki);
      setEditor((e) => ({ ...e, value: wiki.body }));
    }
  }, [wiki]);

  useEffect(() => {
    if (type) {
      setNewWiki((q) => ({ ...q, type }));
    }
  }, [type]);

  return (
    <>
      <LayoutWithTab
        sidebar={{ activeScreenName: ScreenName.QA }}
        header={{
          title: wiki ? editQAHeaderTitleName : newQAHeaderTitleName,
          activeTabName: activeTab,
          tabs,
        }}>
        <Head>
          <title>ボールド | {wiki ? 'Wiki編集' : 'Wiki作成'}</title>
        </Head>
        <TagModal
          isOpen={tagModal}
          tags={tags ? tags : []}
          selectedTags={newWiki.tags ? newWiki.tags : []}
          toggleTag={toggleTag}
          onComplete={() => setTagModal(false)}
          onCancel={() => {
            setNewWiki((q) => ({ ...q, tags: [] }));
            setTagModal(false);
          }}
        />
        <div className={qaCreateStyles.type_select_wrapper}>
          <FormControl className={qaCreateStyles.title_input}>
            <FormLabel>タイトル</FormLabel>
            <Input
              type="text"
              width="100%"
              placeholder="タイトルを入力してください"
              value={newWiki.title}
              background="white"
              onChange={(e) =>
                setNewWiki((q) => ({ ...q, title: e.target.value }))
              }
              className={qaCreateStyles.title_input}
            />
          </FormControl>
          <FormControl
            width={isSmallerThan768 ? '100%' : '30%'}
            className={qaCreateStyles.type_select}>
            <FormLabel fontWeight="bold">タイプを選択してください</FormLabel>
            <Select
              colorScheme="teal"
              bg="white"
              defaultValue={type ? type : WikiType.QA}
              onChange={(e) =>
                setNewWiki((prev) => ({
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
        </div>

        <div className={qaCreateStyles.top_form_wrapper}>
          <div className={qaCreateStyles.title_wrapper}>
            <div className={qaCreateStyles.button_wrapper}>
              <Button
                colorScheme="blue"
                onClick={() => setTagModal(true)}
                marginRight="16px">
                タグを編集
              </Button>
              <Button
                colorScheme="pink"
                onClick={() =>
                  wiki
                    ? onClickSaveButton({ ...wiki, ...newWiki })
                    : onClickSaveButton(newWiki)
                }>
                {wiki ? '質問を更新' : '質問を投稿'}
              </Button>
            </div>
          </div>
        </div>
        {newWiki.tags?.length ? (
          <div className={qaCreateStyles.tags}>
            {newWiki.tags.map((t) => (
              <div key={t.id} className={qaCreateStyles.tag__item}>
                <Button colorScheme="purple" height="28px">
                  {t.name}
                </Button>
              </div>
            ))}
          </div>
        ) : null}
        {activeTab === TabName.EDIT ? (
          <WrappedEditor
            style={{
              width: isSmallerThan768 ? '90vw' : '80vw',
              maxWidth: '1980px',
              height: '80vh',
              marginBottom: 40,
            }}
            placeholder="質問内容を入力して下さい"
            editorRef={mdEditor}
            onImageUpload={handleImageUpload}
            plugins={liteEditorPlugins}
            value={newWiki.body}
            onChange={handleEditorChange}
            renderHTML={(text: string) => mdParser.render(text)}
          />
        ) : (
          <MDEditor.Markdown
            source={wiki ? editor.value : newWiki.body}
            className={qaCreateStyles.markdown_preview}
          />
        )}
      </LayoutWithTab>
    </>
  );
};
export default QAForm;
