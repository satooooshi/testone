import { SidebarScreenName } from '@/components/layout/Sidebar';
import { useAPIGetWikiDetail } from '@/hooks/api/wiki/useAPIGetWikiDetail';
import { useRouter } from 'next/router';
import qaDetailStyles from '@/styles/layouts/QADetail.module.scss';
import WikiComment from '@/components/wiki/WikiComment';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import 'react-markdown-editor-lite/lib/index.css';
import { useAPICreateAnswer } from '@/hooks/api/wiki/useAPICreateAnswer';
import LayoutWithTab from '@/components/layout/LayoutWithTab';
import AnswerReply from '@/components/wiki/AnswerReply';
import {
  BoardCategory,
  QAAnswer,
  QAAnswerReply,
  WikiType,
  UserRole,
} from 'src/types';
import {
  Text,
  Button,
  useMediaQuery,
  Link as ChakraLink,
  Flex,
  useToast,
  Box,
  Badge,
  Heading,
} from '@chakra-ui/react';
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
import { isEditableWiki } from 'src/utils/factory/isCreatableWiki';

type TOCHead = string[];

const QuestionDetail = () => {
  const router = useRouter();
  const toast = useToast();

  const { id } = router.query;
  const { user } = useAuthenticate();
  const { data: wiki, refetch } = useAPIGetWikiDetail(
    typeof id === 'string' ? id : '0',
  );
  const [showingCommentCount, setShowingCommentCount] = useState(3);
  const [answerVisible, setAnswerVisible] = useState(false);
  const [answerReply, setAnswerReply] = useState<Partial<QAAnswerReply>>({});
  const draftEditor = useRef<Editor>(null);
  const [answerEditorState, setAnswerEditorState] = useState(() =>
    EditorState.createEmpty(),
  );
  const [answerReplyEditorState, setAnswerReplyEditorState] = useState(() =>
    EditorState.createEmpty(),
  );
  const [headLinkContents, setHeadLinkContents] = useState<TOCHead>([]);

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
      toast({
        description: 'ベストアンサーを選びました',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
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

  const checkErrors = (isBody: string) => {
    const editorBody =
      isBody === 'answer'
        ? stateToHTML(answerEditorState.getCurrentContent())
        : stateToHTML(answerReplyEditorState.getCurrentContent());
    const isTextExist =
      editorBody.replace(/<("[^"]*"|'[^']*'|[^'">])*>|&nbsp;|\s|\n/g, '')
        .length > 0;

    if ((isBody === 'answer' && !answerVisible) || isTextExist)
      return isBody === 'answer'
        ? handleClickSendAnswer()
        : handleClickSendReply();

    toast({
      description:
        (isBody === 'answer' ? '回答' : '返信') + 'を記入してください',
      status: 'error',
      duration: 3000,
      isClosable: true,
    });
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

  const headerTitle = 'Wiki詳細';

  const initialHeaderValue = {
    title: 'Wiki詳細',
    rightButtonName:
      myself?.id === wiki?.writer?.id || myself?.role === UserRole.ADMIN
        ? 'Wikiを編集'
        : undefined,
    onClickRightButton: wiki ? () => navigateToEditWiki(wiki.id) : undefined,
    tabs: tabs,
  };

  const isH2Str = (id: string) => {
    const target = document.getElementById(id);
    if (
      target?.nextElementSibling &&
      target.nextElementSibling.tagName === 'H2' &&
      target?.nextElementSibling.textContent
    ) {
      return true;
    }
    return false;
  };

  useEffect(() => {
    //wait for rendering body
    setTimeout(() => {
      const h1s = document.querySelectorAll('#wiki-body h1');
      const contentsSetter = (element: Element) => {
        const contents: TOCHead = [];
        const elements: Element[] = [];
        const head = element;
        let next = head.nextElementSibling;
        elements.push(element);
        while (next && next.nodeType === 1) {
          if (
            next.textContent &&
            (next.tagName === 'H2' || next.tagName === 'H1')
          ) {
            elements.push(next);
          }
          next = next.nextElementSibling;
        }
        for (let i = 0; i < elements.length; i++) {
          const textContent = elements[i].textContent;
          if (textContent) {
            const idA = document.createElement('a');
            idA.id = (i + 1).toString();
            elements[i].before(idA);
            contents.push(textContent);
          }
        }
        setHeadLinkContents(contents);
      };
      if (h1s && h1s.length) {
        let firstH1: Element | null = null;
        h1s.forEach((h1) => {
          if (h1.textContent && h1.textContent !== 'H1' && !firstH1) {
            firstH1 = h1;
          }
        });
        if (firstH1) {
          contentsSetter(firstH1);
        }
      } else {
        const h2s = document.querySelectorAll('#wiki-body h2');
        let firstH2: Element | null = null;
        h1s.forEach((h2) => {
          if (h2.textContent && h2.textContent !== 'H2' && !firstH2) {
            firstH2 = h2;
          }
        });
        if (firstH2) {
          contentsSetter(firstH2);
        }
        if (h2s && h2s.length) {
          contentsSetter(h2s[0]);
        }
      }
    }, 50);
  }, [wiki?.body]);

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: SidebarScreenName.QA }}
      header={initialHeaderValue}>
      {wiki && wiki.writer ? (
        <Box mb={10}>
          <Box bg="white" borderRadius={10} p={5} w="80vw">
            <Head>
              <title>ボールド | {wiki ? wiki.title : headerTitle}</title>
            </Head>
            {wiki && wiki.tags && wiki.tags.length ? (
              <div className={qaDetailStyles.tags_wrapper}>
                {wiki.tags.map((tag) => (
                  <Link href={`/wiki/list?tag=${tag.id}`} key={tag.id}>
                    <Badge
                      ml={1}
                      p={2}
                      as="sub"
                      fontSize="x-small"
                      display="flex"
                      colorScheme={tagColorFactory(tag.type)}
                      borderRadius={50}
                      alignItems="center"
                      variant="outline"
                      borderWidth={1}>
                      {tag.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            ) : null}
            <Heading my={3} size="lg">
              {wiki.title}
            </Heading>
            {headLinkContents &&
            headLinkContents.length &&
            !(
              wiki.type === WikiType.BOARD &&
              wiki.boardCategory === BoardCategory.QA
            ) ? (
              <Flex
                mb={'8px'}
                rounded="md"
                bg="white"
                flexDir="column"
                p="40px">
                <Text fontWeight="bold" mb="16px" alignSelf="center">
                  目次
                </Text>
                {headLinkContents.map((content, index) => (
                  <ChakraLink
                    mb={'8px'}
                    pb={'2px'}
                    pl={isH2Str((index + 1).toString()) ? '24px' : 0}
                    _hover={{ borderBottom: '1px solid #b0b0b0' }}
                    key={content}
                    href={`#${index + 1}`}>
                    {content}
                  </ChakraLink>
                ))}
              </Flex>
            ) : null}

            <Box
              display="flex"
              flexDir="column"
              // alignItems="flex-end"
              my={3}
              w="100%">
              <WikiComment
                textFormat={wiki.textFormat}
                body={wiki.body}
                createdAt={wiki.createdAt}
                updatedAt={wiki.updatedAt}
                writer={wiki.writer}
                isWriter={isEditableWiki(wiki, user)}
                wiki={wiki}
              />
            </Box>
          </Box>
          {wiki.type === WikiType.BOARD ? (
            <Box
              display="flex"
              flexDir="row"
              w="80vw"
              alignItems="center"
              justifyContent="space-between"
              my={8}>
              <Box alignSelf="center" display="flex" flexDir="row">
                <Heading fontSize="20px">
                  {wiki.boardCategory === BoardCategory.QA
                    ? '回答'
                    : 'コメント'}
                </Heading>
                {wiki.answers?.length ? (
                  <Text fontSize="13px" ml={2} alignSelf="center">
                    {wiki.answers.length}件
                  </Text>
                ) : null}
              </Box>
              <Box display="flex" flexDir="row">
                <Button
                  borderRadius={50}
                  colorScheme="blue"
                  size="sm"
                  onClick={() => {
                    checkErrors('answer');
                  }}>
                  {wiki.boardCategory === BoardCategory.QA
                    ? answerVisible
                      ? '回答を投稿する'
                      : '回答を追加'
                    : answerVisible
                    ? 'コメントを投稿する'
                    : 'コメントを追加'}
                </Button>
                {wiki.answers && showingCommentCount < wiki.answers.length && (
                  <Heading
                    onClick={() => setShowingCommentCount((c) => c + 2)}
                    fontSize="16px"
                    cursor="pointer"
                    alignSelf="center"
                    ml={4}>
                    もっと見る
                  </Heading>
                )}
              </Box>
            </Box>
          ) : null}
          {answerVisible && (
            <WrappedDraftEditor
              style={{
                marginBottom: 40,
                width: isSmallerThan768 ? '100vw' : '80vw',
              }}
              placeholder={
                wiki.boardCategory === BoardCategory.QA
                  ? '回答を記入してください'
                  : 'コメントを記入してください'
              }
              editorRef={draftEditor}
              editorState={answerEditorState}
              setEditorState={setAnswerEditorState}
            />
          )}
          {wiki.answers && wiki.answers.length
            ? wiki.answers.map(
                (answer, index) =>
                  index < showingCommentCount &&
                  answer.writer && (
                    <div
                      key={answer.id}
                      className={qaDetailStyles.answers_wrapper}>
                      <div className={qaDetailStyles.qa_comment_wrapper}>
                        <div className={qaDetailStyles.qa_wrapper}>
                          <Box bg="white" p="10px" borderRadius={10}>
                            <WikiComment
                              bestAnswerButtonName={
                                wiki.boardCategory === BoardCategory.QA
                                  ? wiki.bestAnswer?.id === answer.id
                                    ? 'ベストアンサーに選ばれた回答'
                                    : !wiki.resolvedAt &&
                                      myself?.id === wiki.writer?.id
                                    ? 'ベストアンサーに選ぶ'
                                    : undefined
                                  : undefined
                              }
                              isExistsBestAnswer={
                                wiki.bestAnswer ? true : false
                              }
                              onClickBestAnswerButton={() =>
                                !wiki.bestAnswer &&
                                createBestAnswer({
                                  ...wiki,
                                  bestAnswer: answer,
                                })
                              }
                              body={answer.body}
                              createdAt={answer.createdAt}
                              writer={answer.writer}
                              isWriter={myself?.id === wiki.writer?.id}
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
                          </Box>
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
                          placeholder={
                            wiki.boardCategory === BoardCategory.QA
                              ? '回答への返信を記入してください'
                              : 'コメントへの返信を記入してください'
                          }
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
                        <Box
                          bg="white"
                          key={r.id}
                          p="10px"
                          borderRadius={10}
                          mb={5}>
                          {/* <div key={r.id} className={qaDetailStyles.reply}> */}
                          <AnswerReply reply={r} />
                          {/* </div> */}
                        </Box>
                      ))}
                    </div>
                  ),
              )
            : null}
        </Box>
      ) : null}
    </LayoutWithTab>
  );
};

export default QuestionDetail;
