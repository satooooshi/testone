import { SidebarScreenName } from '@/components/layout/Sidebar';
import { useAPIGetWikiDetail } from '@/hooks/api/wiki/useAPIGetWikiDetail';
import { useRouter } from 'next/router';
import qaDetailStyles from '@/styles/layouts/QADetail.module.scss';
import WikiComment from '@/components/wiki/WikiComment';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import 'react-markdown-editor-lite/lib/index.css';
import { useAPICreateAnswer } from '@/hooks/api/wiki/useAPICreateAnswer';
import LayoutWithTab from '@/components/layout/LayoutWithTab';
import AnswerReply from '@/components/wiki/AnswerReply';
import { QAAnswer, QAAnswerReply, WikiType } from 'src/types';
import { Button, useMediaQuery, useToast } from '@chakra-ui/react';
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
import { useAuthenticate } from 'src/contexts/useAuthenticate';

const QuestionDetail = () => {
  const router = useRouter();
  const toast = useToast();

  const { id } = router.query;
  const { user } = useAuthenticate();
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

  const handleClickStartInputtingReplyButton = (answer: QAAnswer) => {
    if (answerReply.answer?.id !== answer.id) {
      setAnswerReply((r) => ({
        ...r,
        answer: answer,
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
  };

  const checkErrors = async (isBody: string) => {
    const editorBody =
      isBody === 'answer'
        ? stateToHTML(answerEditorState.getCurrentContent())
        : stateToHTML(answerReplyEditorState.getCurrentContent());
    const removeHTMLBody = editorBody.replace(/(<([^>]+)>)/gi, '');

    if (
      (isBody === 'answer' && answerVisible && removeHTMLBody === '') ||
      (isBody === 'reply' && removeHTMLBody === '')
    ) {
      const messages =
        (isBody === 'answer' ? '回答' : '返信') + 'を記入してください';
      toast({
        description: messages,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } else {
      isBody === 'answer' ? handleClickSendAnswer() : handleClickSendReply();
    }
  };

  const handleClickSendAnswer = () => {
    if (answerVisible && answerEditorState.getCurrentContent()) {
      createAnswer({
        textFormat: 'html',
        body: stateToHTML(answerEditorState.getCurrentContent()),
        wiki: wiki,
      });
    }
    setAnswerVisible(true);
  };

  const handleClickSendReply = () => {
    if (answerReplyEditorState.getCurrentContent()) {
      createAnswerReply({
        ...answerReply,
        textFormat: 'html',
        body: stateToHTML(answerReplyEditorState.getCurrentContent()),
      });
    }
  };

  const enableReplyToAnswer = useCallback(
    (answer: QAAnswer): boolean => {
      return wiki?.writer?.id === user?.id || answer?.writer?.id === user?.id;
    },
    [user?.id, wiki?.writer?.id],
  );

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
                  // answerVisible && checkErrors();
                  // answerVisible && answerEditorState.getCurrentContent()
                  //   ? createAnswer({
                  //       textFormat: 'html',
                  //       body: stateToHTML(
                  //         answerEditorState.getCurrentContent(),
                  //       ),
                  //       wiki: wiki,
                  //     })
                  //   : setAnswerVisible(true);
                  checkErrors('answer');
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
                (answer) =>
                  answer.writer && (
                    <div
                      key={answer.id}
                      className={qaDetailStyles.answers_wrapper}>
                      <div className={qaDetailStyles.qa_comment_wrapper}>
                        <div className={qaDetailStyles.qa_wrapper}>
                          <WikiComment
                            bestAnswerButtonName={
                              wiki.bestAnswer?.id === answer.id
                                ? 'ベストアンサーに選ばれた回答'
                                : !wiki.resolvedAt &&
                                  myself?.id === wiki.writer?.id
                                ? 'ベストアンサーに選ぶ'
                                : undefined
                            }
                            onClickBestAnswerButton={() =>
                              createBestAnswer({ ...wiki, bestAnswer: answer })
                            }
                            body={answer.body}
                            date={answer.createdAt}
                            writer={answer.writer}
                            isWriter={myself?.id === answer.writer.id}
                            replyButtonName={
                              answerReply.answer?.id === answer.id ||
                              !enableReplyToAnswer(answer)
                                ? undefined
                                : '返信/追記'
                            }
                            onClickReplyButton={() =>
                              handleClickStartInputtingReplyButton(answer)
                            }
                          />
                        </div>
                      </div>
                      {answerReply.answer &&
                      answerReply.answer.id === answer.id ? (
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
                      {answerReply.answer &&
                      answerReply.answer.id === answer.id ? (
                        <Button
                          colorScheme="orange"
                          width="24"
                          className={qaDetailStyles.reply_button}
                          onClick={() => checkErrors('reply')}>
                          返信を送信
                        </Button>
                      ) : null}
                      {answer.replies?.map((r) => (
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
