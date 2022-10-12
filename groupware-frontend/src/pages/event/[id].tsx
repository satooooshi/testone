import LayoutWithTab from '@/components/layout/LayoutWithTab';
import { SidebarScreenName } from '@/components/layout/Sidebar';
import { useAPIGetEventDetail } from '@/hooks/api/event/useAPIGetEventDetail';
import { useRouter } from 'next/router';
import eventDetailStyles from '@/styles/layouts/EventDetail.module.scss';
import Youtube from 'react-youtube';
import { useAPIJoinEvent } from '@/hooks/api/event/useAPIJoinEvent';
import { useEffect, useRef, useState } from 'react';
import { AiOutlineFileProtect } from 'react-icons/ai';
import CreateEventModal from '@/components/event/CreateEventModal';
import EventParticipants from '@/components/event/EventParticepants';
import Linkify from 'react-linkify';
import {
  Box,
  Button,
  Link,
  Spinner,
  Text,
  Textarea,
  Badge,
  useToast,
  Heading,
  useMediaQuery,
  Image,
  SimpleGrid,
  Divider,
} from '@chakra-ui/react';
import Head from 'next/head';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import React from 'react';
import { useAPICreateComment } from '@/hooks/api/event/useAPICreateComment';
import CommentCard from '@/components/common/Comment';
import { Tab } from 'src/types/header/tab/types';
import { dateTimeFormatterFromJSDDate } from 'src/utils/dateTimeFormatter';
import generateYoutubeId from 'src/utils/generateYoutubeId';
import { useMemo } from 'react';
import { useAPIDeleteEvent } from '@/hooks/api/event/useAPIDeleteEvent';
import { useAPIUpdateEvent } from '@/hooks/api/event/useAPIUpdateEvent';
import noImage from '@/public/no-image.jpg';
import { useHeaderTab } from '@/hooks/headerTab/useHeaderTab';
import { EventFile, EventType, SubmissionFile, UserRole } from 'src/types';
import { useAPIDownloadEventCsv } from '@/hooks/api/event/useAPIDownloadEventCsv';
import { useAPIUploadStorage } from '@/hooks/api/storage/useAPIUploadStorage';
import { useAPISaveSubmission } from '@/hooks/api/event/useAPISaveSubmission';
import clsx from 'clsx';
import { useAPIDonwloadSubmissionZip } from '@/hooks/api/event/useAPIDonwloadSubmissionZip';
import { FcSportsMode } from 'react-icons/fc';
import { MdAssignment } from 'react-icons/md';
import boldayImage1 from '@/public/bolday_1.jpg';
import impressiveUnivertyImage from '@/public/impressive_university_1.png';
import studyMeeting1Image from '@/public/study_meeting_1.jpg';
import portalLinkBoxStyles from '@/styles/components/PortalLinkBox.module.scss';
import { useAPISaveUserJoiningEvent } from '@/hooks/api/event/useAPISaveUserJoiningEvent';
import { userNameFactory } from 'src/utils/factory/userNameFactory';
import { tagColorFactory } from 'src/utils/factory/tagColorFactory';
import { useAPICancelEvent } from '@/hooks/api/event/useAPICancelEvent';
import coachImage from '@/public/coach_1.jpeg';
import { eventTypeColorFactory } from 'src/utils/factory/eventTypeColorFactory';
import eventTypeNameFactory from 'src/utils/factory/eventTypeNameFactory';
import { responseErrorMsgFactory } from 'src/utils/factory/responseErrorMsgFactory';
import { darkFontColor } from 'src/utils/colors';
import { isEditableEvent } from 'src/utils/factory/isCreatableEvent';
import { MdCancel } from 'react-icons/md';
import { useAPIDeleteSubmission } from '@/hooks/api/event/useAPIDeleteSubmission';
import { hideScrollbarCss } from 'src/utils/chakra/hideScrollBar.css';
import { componentDecorator } from 'src/utils/componentDecorator';

type FileIconProps = {
  url: string;
  name: string;
  submitted?: boolean;
};

const FileIcon: React.FC<FileIconProps> = ({ url, name, submitted }) => {
  return (
    <Link
      onClick={() => saveAs(url, name)}
      display="flex"
      flexDir="column"
      alignItems="center"
      justifyContent="center"
      border="1px solid #e0e0e0"
      rounded="md"
      p="8px"
      w="136px"
      h="136px"
      bg={!submitted ? 'white' : 'lightblue'}>
      <AiOutlineFileProtect className={eventDetailStyles.file_icon} />
      <Text isTruncated={true} w="100%" textAlign="center">
        {name}
      </Text>
    </Link>
  );
};

const EventDetail = () => {
  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');
  const [isSmallerThan1024] = useMediaQuery('(max-width: 1024px)');
  const router = useRouter();
  const { id } = router.query as { id: string };
  const { mutate: downloadEvent, isLoading: loadingEventCsv } =
    useAPIDownloadEventCsv();
  const { mutate: downloadZip, isLoading: loadingSubmissionZip } =
    useAPIDonwloadSubmissionZip();
  const [editModal, setEditModal] = useState(false);
  const [commentVisible, setCommentVisible] = useState(false);
  const [showingCommentCount, setShowingCommentCount] = useState(3);
  const [newComment, setNewComment] = useState<string>('');
  const { user } = useAuthenticate();
  const {
    data,
    refetch,
    isLoading: loadingEventDetail,
  } = useAPIGetEventDetail(id);
  const submissionRef = useRef<HTMLInputElement | null>(null);
  const toast = useToast();
  const [submitFiles, setSubmitFiles] = useState<
    Partial<SubmissionFile & { submitUnFinished: boolean }>[]
  >([]);
  // const imageSource = useMemo(() => {
  //   switch (data?.type) {
  //     case EventType.STUDY_MEETING:
  //       return <Image src={studyMeeting1Image.src} alt="イベント画像" />;
  //     case EventType.BOLDAY:
  //       return <Image src={boldayImage1.src} alt="イベント画像" />;
  //     case EventType.CLUB:
  //       return (
  //         <FcSportsMode
  //           style={{ height: '100%', width: '100%' }}
  //           className={clsx(portalLinkBoxStyles.club_icon)}
  //         />
  //       );
  //     case EventType.IMPRESSIVE_UNIVERSITY:
  //       return <Image src={impressiveUnivertyImage.src} alt="イベント画像" />;
  //     case EventType.COACH:
  //       return <Image src={coachImage.src} alt="イベント画像" />;
  //     case EventType.SUBMISSION_ETC:
  //       return (
  //         <MdAssignment
  //           style={{ height: '100%', width: '100%' }}
  //           className={clsx(portalLinkBoxStyles.submission_etc_icon)}
  //         />
  //       );

  //     default:
  //       return <Image src={noImage.src} alt="イベント画像" />;
  //   }
  // }, [data?.type]);

  const { mutate: saveSubmission } = useAPISaveSubmission({
    onSuccess: () => {
      toast({
        title: `ファイルを提出しました`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetch();
    },
  });

  const { mutate: deleteSubmission } = useAPIDeleteSubmission({
    onSuccess: () => {
      toast({
        title: `ファイルを削除しました`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetch();
    },
  });
  const { mutate: uploadStorage, isLoading: loadingUplaod } =
    useAPIUploadStorage();

  const { mutate: joinEvent } = useAPIJoinEvent({
    onSuccess: () => refetch(),
    onError: (err) => {
      if (err.response?.data?.message) {
        toast({
          description: err.response?.data?.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });
  const { mutate: cancelEvent } = useAPICancelEvent({
    onSuccess: () => refetch(),
  });
  const { mutate: saveEvent } = useAPIUpdateEvent({
    onSuccess: () => {
      setEditModal(false);
      refetch();
    },
    onError: (e) => {
      const messages = responseErrorMsgFactory(e);
      toast({
        description: messages,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    },
  });
  const { mutate: handleChangeJoiningData } = useAPISaveUserJoiningEvent({
    onSuccess: () => {
      refetch();
    },
  });

  const { mutate: deleteEvent } = useAPIDeleteEvent({
    onSuccess: () => {
      router.push('list');
    },
  });

  const onDeleteClicked = () => {
    if (confirm(`このイベントを削除して宜しいですか？`) && data) {
      deleteEvent({ eventId: data.id });
    }
  };

  const { mutate: createComment } = useAPICreateComment({
    onSuccess: () => {
      setCommentVisible(false);
      setNewComment('');
      refetch();
    },
    onError: (e) => {
      const messages = responseErrorMsgFactory(e);
      toast({
        description: messages,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    },
  });

  const handleCreateComment = () => {
    if (newComment.length > 500) {
      toast({
        description: 'コメントは500文字以内で入力してください',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    createComment({
      body: newComment,
      eventSchedule: data,
    });
  };
  const isCommonUser = user?.role === UserRole.COMMON;
  const isAdminUser = user?.role === UserRole.ADMIN;

  const isEditable = data ? isEditableEvent(data, user) : false;

  const doesntExist = !loadingEventDetail && (!data || !data?.id);

  const previousUrl = document.referrer;
  const tabs: Tab[] = useHeaderTab({
    previousUrl,
    headerTabType: 'eventDetail',
    onDeleteClicked:
      (user?.role === UserRole.ADMIN || user?.id === data?.author?.id) &&
      !doesntExist
        ? onDeleteClicked
        : undefined,
    onEditClicked: isEditable ? () => setEditModal(true) : undefined,
  });

  const initialHeaderValue = {
    title: 'イベント詳細',
    // rightButtonName: isEditable ? 'イベントを編集' : undefined,
    // onClickRightButton: isEditable ? () => setEditModal(true) : undefined,
    tabs: tabs,
  };

  const isFinished = useMemo(() => {
    if (data?.endAt) {
      return new Date(data.endAt) <= new Date();
    }
    return false;
  }, [data?.endAt]);

  useEffect(() => {
    if (data && data.submissionFiles && data.submissionFiles.length) {
      setSubmitFiles(data.submissionFiles);
    }
  }, [data]);

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: SidebarScreenName.EVENT }}
      header={initialHeaderValue}>
      {doesntExist ? (
        <Text>このイベントは存在しないか、権限がありません。</Text>
      ) : null}
      <CreateEventModal
        enabled={editModal}
        onCancelPressed={() => setEditModal(false)}
        event={data}
        createEvent={(newEvent) => saveEvent(newEvent)}
      />
      {data && data.id ? (
        <Box
          w="100%"
          pb="20px"
          display="flex"
          flexDir="column"
          justifyContent="space-between">
          <Box
            w="100%"
            display="flex"
            flexDir="column"
            justifyContent="space-between"
            p={5}
            borderRadius={5}
            bg="white">
            <Box
              display="flex"
              flexDir={isSmallerThan768 ? 'column' : 'row'}
              alignItems={isSmallerThan768 ? 'center' : ''}>
              <Box w={isSmallerThan768 ? '60%' : '40%'} mb={5}>
                {data.imageURL ? (
                  <Image src={data.imageURL} alt="イベント画像" />
                ) : (
                  <Image src={noImage.src} alt="イベント画像" />
                )}
              </Box>

              <Box
                w={isSmallerThan768 ? '90%' : '60%'}
                pl={isSmallerThan768 ? 0 : 4}>
                <Box mb="8px">
                  <Badge
                    py="4px"
                    px="8px"
                    color="white"
                    fontSize="smaller"
                    background={eventTypeColorFactory(data.type)}
                    borderRadius={50}
                    alignItems="center">
                    {eventTypeNameFactory(data.type)}
                  </Badge>
                </Box>
                <Box mb="20px" minH="160px" mr={4} mt={3}>
                  <Heading fontWeight="bold"> {data.title}</Heading>
                  <Box>
                    <Linkify componentDecorator={componentDecorator}>
                      <Text
                        as="span"
                        mt={3}
                        fontSize={12}
                        whiteSpace="pre-line">
                        {data.description}
                      </Text>
                    </Linkify>
                  </Box>
                </Box>
                <Box w="100%">
                  <Heading size="xs" mb={1}>
                    タグ
                  </Heading>
                  <Box
                    display="flex"
                    flexDir="row"
                    flexWrap="wrap"
                    ml={-1}
                    mb={1}>
                    {data.tags && data.tags.length
                      ? data.tags.map((t) => (
                          <Link
                            _hover={{ textDecoration: 'none' }}
                            href={`/event/list?tag=${t.id}`}
                            key={t.id}>
                            <Badge
                              ml={1}
                              mb={1}
                              p={2}
                              as="sub"
                              fontSize="x-small"
                              display="flex"
                              colorScheme={tagColorFactory(t.type)}
                              borderRadius={50}
                              alignItems="center"
                              variant="outline"
                              borderWidth={1}>
                              {t.name}
                            </Badge>
                          </Link>
                        ))
                      : null}
                  </Box>
                </Box>
                <Box
                  mt={2}
                  display="flex"
                  flexDir="column"
                  justifyContent="space-between">
                  <Heading mb={2} size="xs">
                    日時
                  </Heading>
                  <Text fontSize={14}>
                    {dateTimeFormatterFromJSDDate({
                      dateTime: new Date(data.startAt),
                      format: '開始: yyyy/LL/dd HH:mm ',
                    })}
                  </Text>
                  <Text fontSize={14} mt="5px">
                    {dateTimeFormatterFromJSDDate({
                      dateTime: new Date(data.endAt),
                      format: '終了: yyyy/LL/dd HH:mm',
                    })}
                  </Text>
                </Box>
                <Box mt={3}>
                  <Heading size="xs" mb={2}>
                    開催者
                  </Heading>
                  {data && data.hostUsers && data.hostUsers.length ? (
                    <div className={eventDetailStyles.tags_wrapper}>
                      {data.hostUsers.map((hostUser) => (
                        <Link
                          href={`/account/${hostUser.id}`}
                          key={hostUser.id}>
                          <a className={eventDetailStyles.tag}>
                            <Button colorScheme="purple" size="xs">
                              {userNameFactory(hostUser)}
                            </Button>
                          </a>
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </Box>
              </Box>
            </Box>
            <Box
              mt={3}
              display="flex"
              flexDir="column"
              alignItems="center"
              w="100%">
              {!isCommonUser ? (
                <Button
                  mb={3}
                  borderRadius={50}
                  colorScheme="blue"
                  variant="outline"
                  w="50%"
                  onClick={() => downloadEvent({ id, name: data.title })}>
                  {loadingEventCsv ? (
                    <Spinner />
                  ) : (
                    <Text>イベントデータをCSV出力</Text>
                  )}
                </Button>
              ) : null}
              {!isFinished ? (
                <>
                  {!data.isCanceled && (
                    <Button
                      w="50%"
                      borderRadius={50}
                      colorScheme="blue"
                      onClick={() => {
                        if (!data.isJoining) {
                          if (confirm(`イベントに参加しますか？`)) {
                            joinEvent({ eventID: Number(id) });
                          }
                        } else {
                          if (
                            confirm(`イベントへの参加をキャンセルしますか？`)
                          ) {
                            cancelEvent({ eventID: Number(id) });
                          }
                        }
                      }}>
                      {data.isJoining ? 'キャンセルする' : 'イベントに参加'}
                    </Button>
                  )}
                  {data.isJoining && data.isCanceled ? (
                    <Text
                      p={2}
                      color="tomato"
                      w="50%"
                      textAlign="center"
                      borderRadius={50}
                      borderColor="red"
                      borderWidth="1px">
                      キャンセル済み
                    </Text>
                  ) : null}
                </>
              ) : isFinished ? (
                <Text
                  p={2}
                  color="tomato"
                  w="50%"
                  textAlign="center"
                  borderRadius={50}
                  borderColor="red"
                  borderWidth="1px">
                  締切済み
                </Text>
              ) : null}
            </Box>
          </Box>

          <Heading
            fontSize="16px"
            my="8px"
            display="block"
            alignSelf="flex-start">
            参考資料
          </Heading>
          {data.files && data.files.length ? (
            <Box
              bg="white"
              display="flex"
              flexDir="row"
              flexWrap="wrap"
              mb="16px"
              w="100%">
              {data.files.map((f) => (
                <FileIcon url={f.url} name={f.name} key={f.id} />
              ))}
            </Box>
          ) : (
            <Text mb="16px" mx="auto">
              参考資料はありません
            </Text>
          )}
          <Heading
            fontSize="16px"
            mb="8px"
            display="block"
            alignSelf="flex-start">
            関連動画
          </Heading>
          {data.videos && data.videos.length ? (
            <SimpleGrid
              minChildWidth="250px"
              maxChildWidth="400px"
              spacing="10px">
              {data.videos.map((v) => (
                <Youtube
                  key={v.id}
                  className={eventDetailStyles.video}
                  videoId={generateYoutubeId(v.url)}
                />
              ))}
            </SimpleGrid>
          ) : (
            <Text mb="16px" mx="auto">
              関連動画はありません
            </Text>
          )}
          <>
            <Box w="100%" mt={2}>
              <Heading fontSize="16px">参加者一覧</Heading>
              <EventParticipants
                onChangeJoiningData={(uje) => handleChangeJoiningData(uje)}
                userJoiningEvent={data.userJoiningEvent}
              />
            </Box>
            <Box w="100%" mt={5}>
              <div className={eventDetailStyles.count_and_button_wrapper}>
                <Box alignSelf="center" display="flex" flexDir="row">
                  <Heading fontSize="16px">イベントの感想</Heading>
                  {data.comments?.length ? (
                    <Text fontSize="11px" ml={2} alignSelf="center">
                      {data.comments.length}件
                    </Text>
                  ) : null}
                </Box>
                <Box display="flex" flexDir="row">
                  <Button
                    borderRadius={50}
                    colorScheme="blue"
                    size="sm"
                    onClick={() => {
                      commentVisible && newComment
                        ? handleCreateComment()
                        : setCommentVisible(true);
                    }}>
                    感想を投稿
                  </Button>
                  {showingCommentCount < data.comments.length && (
                    <Heading
                      onClick={() => setShowingCommentCount((c) => c + 3)}
                      fontSize="16px"
                      cursor="pointer"
                      alignSelf="center"
                      ml={4}>
                      もっと見る
                    </Heading>
                  )}
                </Box>
              </div>
              {commentVisible && (
                <Textarea
                  height="56"
                  background="white"
                  placeholder="コメントを記入してください。"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className={eventDetailStyles.comment_input}
                  autoFocus
                />
              )}
              <Box rounded="md" display="flex" flexDir="column" bg="white">
                {data.comments && data.comments.length
                  ? data.comments.map((comment, index) =>
                      index < showingCommentCount && comment.writer ? (
                        <CommentCard
                          key={comment.id}
                          body={comment.body}
                          date={comment.createdAt}
                          writer={comment.writer}
                        />
                      ) : null,
                    )
                  : null}
              </Box>
            </Box>
          </>
          {!isFinished ? (
            <>
              <Box
                borderBottomColor="green.500"
                borderBottomWidth={1}
                pb="10px"
                mb="16px">
                <Box
                  display="flex"
                  flexFlow="row"
                  justifyContent="space-between">
                  <Button
                    size="sm"
                    colorScheme="blue"
                    marginRight="16px"
                    onClick={() => {
                      submissionRef.current?.click();
                    }}>
                    {loadingUplaod ? <Spinner /> : <Text>提出物を追加</Text>}
                  </Button>
                  <Button
                    size="sm"
                    colorScheme={'pink'}
                    onClick={() => {
                      saveSubmission(submitFiles);
                    }}>
                    提出状況を保存
                  </Button>
                </Box>
                <Text color={darkFontColor} fontSize={'16px'} fontWeight="bold">
                  {data.submissionFiles.length + '件のファイルを提出済み'}
                </Text>
                <Text color="tomato">
                  ※水色のアイコンのファイルはまだ提出状況が保存されていません
                </Text>
                <input
                  type="file"
                  hidden
                  ref={submissionRef}
                  multiple
                  onChange={() => {
                    const files = submissionRef.current?.files;
                    const fileArr: File[] = [];
                    if (!files) {
                      return;
                    }
                    for (let i = 0; i < files.length; i++) {
                      const renamedFile = new File([files[i]], files[i].name, {
                        type: files[i].type,
                        lastModified: files[i].lastModified,
                      });
                      fileArr.push(renamedFile);
                    }
                    uploadStorage(fileArr, {
                      onSuccess: (urls) => {
                        const filesNotSubmitted: Partial<SubmissionFile>[] =
                          urls.map((u, i) => ({
                            url: u,
                            name: fileArr[i].name,
                            eventSchedule: data,
                            userSubmitted: user,
                            submitUnFinished: true,
                          }));
                        setSubmitFiles((files) => [
                          ...files,
                          ...filesNotSubmitted,
                        ]);
                      },
                    });
                  }}
                />
              </Box>
              {submitFiles && submitFiles.length ? (
                <Box display="flex" flexDir="row" flexWrap="wrap" mb="16px">
                  {submitFiles.map((f) =>
                    f.url && f.name ? (
                      <>
                        <Box key={f.url} mb="4px" mr="10px" display="flex">
                          <FileIcon
                            url={f.url}
                            name={f.name}
                            submitted={f.submitUnFinished}
                          />
                          <Box ml="-13px" mt="-2">
                            <MdCancel
                              size="25px"
                              onClick={() => {
                                if (f.id) {
                                  if (
                                    confirm(
                                      'ファイルを削除してよろしいですか？',
                                    )
                                  ) {
                                    deleteSubmission({ submissionId: f.id });
                                  }
                                } else {
                                  const files = submitFiles.filter(
                                    (file) => file.url !== f.url,
                                  );
                                  setSubmitFiles(files);
                                }
                              }}
                            />
                          </Box>
                        </Box>
                      </>
                    ) : null,
                  )}
                </Box>
              ) : (
                <></>
              )}
            </>
          ) : null}
        </Box>
      ) : null}
    </LayoutWithTab>
  );
};

export default EventDetail;
