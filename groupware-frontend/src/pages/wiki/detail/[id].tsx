import { SidebarScreenName } from '@/components/layout/Sidebar';
import { useAPIGetWikiDetail } from '@/hooks/api/wiki/useAPIGetWikiDetail';
import { useRouter } from 'next/router';
import qaDetailStyles from '@/styles/layouts/QADetail.module.scss';
import WikiComment from '@/components/wiki/WikiComment';
import React, { useMemo, useRef, useState } from 'react';
import 'react-markdown-editor-lite/lib/index.css';
import { useAPICreateAnswer } from '@/hooks/api/wiki/useAPICreateAnswer';
import LayoutWithTab from '@/components/layout/LayoutWithTab';
import AnswerReply from '@/components/wiki/AnswerReply';
import { QAAnswerReply, WikiType } from 'src/types';
import { Button, useMediaQuery } from '@chakra-ui/react';
import WrappedDraftEditor from '@/components/wiki/WrappedDraftEditor';
import { ContentState, Editor, EditorState } from 'draft-js';
import Head from 'next/head';
import Link from 'next/link';
import { Tab } from 'src/types/header/tab/types';
import { useAPICreateAnswerReply } from '@/hooks/api/wiki/useAPICreateAnswerReply';
import { useAPICreateBestAnswer } from '@/hooks/api/wiki/useAPICreateBestAnswer';
import { useAPIGetProfile } from '@/hooks/api/user/useAPIGetProfile';
import { stateToHTML } from 'draft-js-export-html';
import { useHeaderTab } from '@/hooks/headerTab/useHeaderTab';
import { tagColorFactory } from 'src/utils/factory/tagColorFactory';

const QuestionDetail = () => {
  const router = useRouter();

  const { id } = router.query;
  const { data: wiki, refetch } = useAPIGetWikiDetail(
    typeof id === 'string' ? id : '0',
  );
  const [answerVisible, setAnswerVisible] = useState(false);
  const [answerReply, setAnswerReply] = useState<Partial<QAAnswerReply>>({});
  const draftEditor = useRef<Editor>(null);
  const [answerEditorState, setAnswerEditorState] = useState(() =>
    EditorState.createEmpty(),
  );
  const [answerReplyEditorState, setAnswerReplyEditorState] = useState(() =>
    EditorState.createEmpty(),
  );

  const { mutate: createAnswerReply } = useAPICreateAnswerReply({
    onSuccess: () => {
      setAnswerReply({});
      setAnswerReplyEditorState(
        EditorState.push(
          answerReplyEditorState,
          ContentState.createFromText(''),
          'delete-character',
        ),
      );
      refetch();
    },
  });
  const { mutate: createAnswer } = useAPICreateAnswer({
    onSuccess: () => {
      setAnswerVisible(false);
      setAnswerEditorState(
        EditorState.push(
          answerEditorState,
          ContentState.createFromText(''),
          'delete-character',
        ),
      );
      refetch();
    },
  });

  const { mutate: createBestAnswer } = useAPICreateBestAnswer({
    onSuccess: () => {
      refetch();
    },
  });

  const { data: myself } = useAPIGetProfile();
  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');

  const navigateToEditWiki = (id: number) => {
    router.push('/wiki/edit/' + id);
  };

  const tabs: Tab[] = useHeaderTab({ headerTabType: 'wikiDetail' });

  const headerTitle = useMemo(() => {
    if (wiki?.type === WikiType.QA) {
      return '質問詳細';
    }
    if (wiki?.type === WikiType.RULES) {
      return '社内規則詳細';
    }
    if (wiki?.type === WikiType.KNOWLEDGE) {
      return 'ナレッジ詳細';
    }
    return '詳細';
  }, [wiki?.type]);

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: SidebarScreenName.QA }}
      header={{ title: headerTitle, tabs: tabs }}>
      {wiki && wiki.writer ? (
        <div className={qaDetailStyles.main}>
          <Head>
            <title>ボールド | {wiki ? wiki.title : headerTitle}</title>
          </Head>
          <div className={qaDetailStyles.title_wrapper}>
            <p className={qaDetailStyles.title_text}>{wiki.title}</p>
          </div>
          {wiki && wiki.tags && wiki.tags.length ? (
            <div className={qaDetailStyles.tags_wrapper}>
              {wiki.tags.map((tag) => (
                <Link href={`/wiki/list?tag=${tag.id}`} key={tag.id}>
                  <a className={qaDetailStyles.tag}>
                    <Button colorScheme={tagColorFactory(tag.type)} size="xs">
                      {tag.name}
                    </Button>
                  </a>
                </Link>
              ))}
            </div>
          ) : null}
          <div className={qaDetailStyles.question_wrapper}>
            <div className={qaDetailStyles.qa_wrapper}>
              <WikiComment
                textFormat={wiki.textFormat}
                body={wiki.body}
                date={wiki.createdAt}
                writer={wiki.writer}
                isWriter={myself?.id === wiki.writer?.id}
                onClickEditButton={() =>
                  myself?.id === wiki.writer?.id && navigateToEditWiki(wiki.id)
                }
              />
            </div>
          </div>
          {wiki.type === WikiType.QA && (
            <div className={qaDetailStyles.answer_count__wrapper}>
              <p className={qaDetailStyles.answer_count}>
                回答{wiki.answers?.length ? wiki.answers.length : 0}件
              </p>
              <Button
                size="sm"
                colorScheme="teal"
                onClick={() => {
                  answerVisible && answerEditorState.getCurrentContent()
                    ? createAnswer({
                        textFormat: 'html',
                        body: stateToHTML(
                          answerEditorState.getCurrentContent(),
                        ),
                        wiki: wiki,
                      })
                    : setAnswerVisible(true);
                }}>
                {answerVisible ? '回答を投稿する' : '回答を追加'}
              </Button>
            </div>
          )}
          {answerVisible && (
            <WrappedDraftEditor
              style={{
                marginBottom: 40,
                width: isSmallerThan768 ? '100vw' : '80vw',
              }}
              placeholder="回答を記入してください"
              editorRef={draftEditor}
              editorState={answerEditorState}
              setEditorState={setAnswerEditorState}
            />
          )}
          {wiki.answers && wiki.answers.length
            ? wiki.answers.map(
                (a) =>
                  a.writer && (
                    <div key={a.id} className={qaDetailStyles.answers_wrapper}>
                      <div className={qaDetailStyles.qa_comment_wrapper}>
                        <div className={qaDetailStyles.qa_wrapper}>
                          <WikiComment
                            bestAnswerButtonName={
                              wiki.bestAnswer?.id === a.id
                                ? 'ベストアンサーに選ばれた回答'
                                : !wiki.resolvedAt &&
                                  myself?.id === wiki.writer?.id
                                ? 'ベストアンサーに選ぶ'
                                : undefined
                            }
                            onClickBestAnswerButton={() =>
                              createBestAnswer({ ...wiki, bestAnswer: a })
                            }
                            body={a.body}
                            date={a.createdAt}
                            writer={a.writer}
                            isWriter={myself?.id === a.writer.id}
                            replyButtonName={
                              answerReply.answer?.id === a.id
                                ? undefined
                                : '返信する'
                            }
                            onClickReplyButton={() => {
                              if (answerReply.answer?.id !== a.id) {
                                setAnswerReply((r) => ({
                                  ...r,
                                  answer: a,
                                  body: '',
                                }));
                                setAnswerReplyEditorState(
                                  EditorState.push(
                                    answerReplyEditorState,
                                    ContentState.createFromText(''),
                                    'delete-character',
                                  ),
                                );
                                return;
                              }
                            }}
                          />
                        </div>
                      </div>
                      {answerReply.answer && answerReply.answer.id === a.id ? (
                        <WrappedDraftEditor
                          style={{
                            marginBottom: 10,
                            width: isSmallerThan768 ? '100vw' : '70vw',
                          }}
                          editorRef={draftEditor}
                          placeholder="回答への返信を記入してください"
                          editorState={answerReplyEditorState}
                          setEditorState={setAnswerReplyEditorState}
                        />
                      ) : null}
                      {answerReply.answer && answerReply.answer.id === a.id ? (
                        <Button
                          colorScheme="orange"
                          width="24"
                          className={qaDetailStyles.reply_button}
                          onClick={() => {
                            if (answerReplyEditorState.getCurrentContent()) {
                              createAnswerReply({
                                ...answerReply,
                                textFormat: 'html',
                                body: stateToHTML(
                                  answerReplyEditorState.getCurrentContent(),
                                ),
                              });
                            }
                          }}>
                          返信を送信
                        </Button>
                      ) : null}
                      {a.replies?.map((r) => (
                        <div key={r.id} className={qaDetailStyles.reply}>
                          <AnswerReply reply={r} />
                        </div>
                      ))}
                    </div>
                  ),
              )
            : null}
        </div>
      ) : null}
    </LayoutWithTab>
  );
};

export default QuestionDetail;
