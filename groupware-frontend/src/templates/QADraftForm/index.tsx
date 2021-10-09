import React, { useMemo, useState, useEffect, useRef } from 'react';
import qaCreateStyles from '@/styles/layouts/QACreate.module.scss';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { ScreenName } from '@/components/Sidebar';
import LayoutWithTab from '@/components/LayoutWithTab';
import TagModal from '@/components/TagModal';
import WrappedDraftEditor from '@/components/WrappedDraftEditor';
import { editorLanguage, QAQuestion, Tag, UserRole, WikiType } from 'src/types';
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

type QAFormTypeProps = {
  question?: QAQuestion;
  tags?: Tag[];
  onClickSaveButton: (question: Partial<QAQuestion>) => void;
};

const QAForm: React.FC<QAFormTypeProps> = ({
  question,
  tags,
  onClickSaveButton,
}) => {
  const draftEditor = useRef<Editor | null>(null);
  const router = useRouter();
  const { type } = router.query as { type: WikiType };
  const { user } = useAuthenticate();

  const [tagModal, setTagModal] = useState(false);
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty(),
  );
  const [activeTab, setActiveTab] = useState<TabName>(TabName.EDIT);
  const [newQuestion, setNewQuestion] = useState<Partial<QAQuestion>>({
    title: '',
    body: '',
    tags: [],
    editorLanguage: editorLanguage.MARKUP,
  });
  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');

  const tabs: Tab[] = [
    {
      onClick: () => setActiveTab(TabName.EDIT),
      name: question ? '質問を編集' : '質問を作成',
    },
  ];

  const headerTabName = useMemo(() => {
    switch (question?.type) {
      case WikiType.QA:
        return '質問を編集';
      case WikiType.RULES:
        return '社内規則を編集';
      case WikiType.KNOWLEDGE:
        return 'ナレッジを編集';
      default:
        return '編集';
    }
  }, [question?.type]);

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

  useEffect(() => {
    if (question) {
      setNewQuestion({ ...question, editorLanguage: editorLanguage.MARKUP });
      setEditorState(
        EditorState.push(
          editorState,
          ContentState.createFromBlockArray(
            convertFromHTML(question.body).contentBlocks,
            convertFromHTML(question.body).entityMap,
          ),
          'apply-entity',
        ),
      );
    }
  }, [question]);

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
          <title>ボールド | {question ? 'Wiki編集' : 'Wiki作成'}</title>
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
        <div className={qaCreateStyles.type_select_wrapper}>
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
                  question
                    ? onClickSaveButton({
                        ...question,
                        ...newQuestion,
                        body: stateToHTML(editorState.getCurrentContent()),
                      })
                    : onClickSaveButton({
                        ...newQuestion,
                        body: stateToHTML(editorState.getCurrentContent()),
                      })
                }>
                {question ? '質問を更新' : '質問を投稿'}
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
        <WrappedDraftEditor
          style={{
            width: isSmallerThan768 ? '90vw' : '80vw',
            maxWidth: '1980px',
            height: '80vh',
            marginBottom: 40,
          }}
          placeholder="質問内容を入力して下さい"
          editorRef={draftEditor}
          editorState={editorState}
          setEditorState={setEditorState}
        />
      </LayoutWithTab>
    </>
  );
};
export default QAForm;
