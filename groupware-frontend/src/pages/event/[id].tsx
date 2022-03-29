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
  useToast,
} from '@chakra-ui/react';
import Head from 'next/head';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import React from 'react';
import { useAPICreateComment } from '@/hooks/api/event/useAPICreateComment';
import EventCommentCard from '@/components/event/EventComment';
import { Tab } from 'src/types/header/tab/types';
import { dateTimeFormatterFromJSDDate } from 'src/utils/dateTimeFormatter';
import generateYoutubeId from 'src/utils/generateYoutubeId';
import { useMemo } from 'react';
import { useAPIDeleteEvent } from '@/hooks/api/event/useAPIDeleteEvent';
import { useAPIUpdateEvent } from '@/hooks/api/event/useAPIUpdateEvent';
import Image from 'next/image';
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
import { fileNameTransformer } from 'src/utils/factory/fileNameTransformer';
import { isEditableEvent } from 'src/utils/factory/isCreatableEvent';

type FileIconProps = {
  file: EventFile;
  submitted?: boolean;
};

const FileIcon: React.FC<FileIconProps> = ({ file, submitted }) => {
  return (
    <Link
      onClick={() => saveAs(file.url, file.name)}
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
        {file.name}
      </Text>
    </Link>
  );
};

const EventDetail = () => {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const { mutate: downloadEvent, isLoading: loadingEventCsv } =
    useAPIDownloadEventCsv();
  const { mutate: downloadZip, isLoading: loadingSubmissionZip } =
    useAPIDonwloadSubmissionZip();
  const [editModal, setEditModal] = useState(false);
  const [commentVisible, setCommentVisible] = useState(false);
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
  const imageSource = useMemo(() => {
    switch (data?.type) {
      case EventType.STUDY_MEETING:
        return <Image src={studyMeeting1Image} alt="イベント画像" />;
      case EventType.BOLDAY:
        return <Image src={boldayImage1} alt="イベント画像" />;
      case EventType.CLUB:
        return (
          <FcSportsMode
            style={{ height: '100%', width: '100%' }}
            className={clsx(portalLinkBoxStyles.club_icon)}
          />
        );
      case EventType.IMPRESSIVE_UNIVERSITY:
        return <Image src={impressiveUnivertyImage} alt="イベント画像" />;
      case EventType.COACH:
        return <Image src={coachImage} alt="イベント画像" />;
      case EventType.SUBMISSION_ETC:
        return (
          <MdAssignment
            style={{ height: '100%', width: '100%' }}
            className={clsx(portalLinkBoxStyles.submission_etc_icon)}
          />
        );

      default:
        return <Image src={noImage} alt="イベント画像" />;
    }
  }, [data?.type]);

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
  const { mutate: uploadStorage, isLoading: loadingUplaod } =
    useAPIUploadStorage({
      onSuccess: (urls) => {
        const filesNotSubmitted: Partial<SubmissionFile>[] = [];
        for (const url of urls) {
          const submitFileObj = {
            url: url,
            eventSchedule: data,
            userSubmitted: user,
            submitUnFinished: true,
          };
          filesNotSubmitted.push(submitFileObj);
        }
        setSubmitFiles((files) => [...files, ...filesNotSubmitted]);
      },
    });

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

  const tabs: Tab[] = useHeaderTab(
    user?.role === UserRole.ADMIN && !doesntExist
      ? {
          headerTabType: 'adminEventDetail',
          onDeleteClicked,
        }
      : {
          headerTabType: 'eventDetail',
        },
  );

  const initialHeaderValue = {
    title: 'イベント詳細',
    rightButtonName: isEditable ? 'イベントを編集' : undefined,
    onClickRightButton: isEditable ? () => setEditModal(true) : undefined,
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
        <div className={eventDetailStyles.main}>
          <Head>
            <title>ボールド | {data.title}</title>
          </Head>
          <div className={eventDetailStyles.all_wrapper}>
            <div className={eventDetailStyles.event_info_wrapper}>
              <div className={eventDetailStyles.event_info_left}>
                {data.imageURL ? (
                  <img src={data.imageURL} alt="イベント画像" />
                ) : (
                  imageSource
                )}
              </div>
              <div className={eventDetailStyles.event_info_right}>
                <span className={eventDetailStyles.event_title}>
                  {data.title}
                </span>
                <div className={eventDetailStyles.type_wrapper}>
                  <Button
                    background={eventTypeColorFactory(data.type)}
                    _hover={{}}
                    size="sm"
                    color="white">
                    {eventTypeNameFactory(data.type)}
                  </Button>
                </div>
                <div className={eventDetailStyles.event_dates_wrapper}>
                  {data.type !== EventType.SUBMISSION_ETC && (
                    <span className={eventDetailStyles.start_date}>
                      {`開始: ${dateTimeFormatterFromJSDDate({
                        dateTime: new Date(data.startAt),
                        format: 'yyyy/LL/dd HH:mm',
                      })} ~ `}
                    </span>
                  )}
                  <span className={eventDetailStyles.end_date}>
                    {`
                  ${
                    data.type !== EventType.SUBMISSION_ETC ? '終了' : '締切'
                  }: ${dateTimeFormatterFromJSDDate({
                      dateTime: new Date(data.endAt),
                      format: 'yyyy/LL/dd HH:mm',
                    })}
                `}
                  </span>
                </div>
                <span className={eventDetailStyles.sub_title}>概要</span>
                <div className={eventDetailStyles.description_wrapper}>
                  <Linkify>
                    <span className={eventDetailStyles.description}>
                      {data.description}
                    </span>
                  </Linkify>
                </div>
                {data.type !== EventType.SUBMISSION_ETC && (
                  <>
                    <span className={eventDetailStyles.sub_title}>
                      開催者/講師
                    </span>
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
                  </>
                )}
                <span className={eventDetailStyles.sub_title}>タグ</span>
                {data && data.tags && data.tags.length ? (
                  <div className={eventDetailStyles.tags_wrapper}>
                    {data.tags.map((tag) => (
                      <Link href={`/event/list?tag=${tag.id}`} key={tag.id}>
                        <a className={eventDetailStyles.tag}>
                          <Button
                            colorScheme={tagColorFactory(tag.type)}
                            size="xs">
                            {tag.name}
                          </Button>
                        </a>
                      </Link>
                    ))}
                  </div>
                ) : null}
                <div className={eventDetailStyles.join_event_wrapper}>
                  {data.type !== 'submission_etc' && !isFinished ? (
                    <>
                      {!data.isCanceled && (
                        <Button
                          className={eventDetailStyles.join_event_button}
                          colorScheme={data.isJoining ? 'teal' : 'pink'}
                          onClick={() =>
                            !data.isJoining &&
                            joinEvent({ eventID: Number(id) })
                          }>
                          {data.isJoining ? '参加済' : 'イベントに参加'}
                        </Button>
                      )}
                      {data.isJoining && !data.isCanceled ? (
                        <Button
                          colorScheme={'red'}
                          onClick={() => cancelEvent({ eventID: Number(id) })}>
                          キャンセルする
                        </Button>
                      ) : data.isJoining && data.isCanceled ? (
                        <Text color="tomato">キャンセル済み</Text>
                      ) : null}
                    </>
                  ) : isFinished ? (
                    <Text color="tomato">締切済み</Text>
                  ) : null}
                </div>
                {isAdminUser && data.type === EventType.SUBMISSION_ETC ? (
                  <div className={eventDetailStyles.admin_buttons_wrapper}>
                    <Button
                      colorScheme={'green'}
                      onClick={() =>
                        downloadZip({
                          id: data.id.toString(),
                          name: data.title,
                        })
                      }>
                      {loadingSubmissionZip ? (
                        <Text>
                          一括ダウンロードには時間がかかります
                          <Spinner />
                        </Text>
                      ) : (
                        <Text>提出物を一括ダウンロード</Text>
                      )}
                    </Button>
                  </div>
                ) : null}
                {!isCommonUser && data.type !== EventType.SUBMISSION_ETC ? (
                  <div className={eventDetailStyles.admin_buttons_wrapper}>
                    <Button
                      colorScheme={'green'}
                      onClick={() => downloadEvent({ id, name: data.title })}>
                      {loadingEventCsv ? (
                        <Spinner />
                      ) : (
                        <Text>イベントデータをCSV出力</Text>
                      )}
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
            <Text
              fontSize="16px"
              mb="8px"
              display="block"
              alignSelf="flex-start">
              参考資料
            </Text>
            {data.files && data.files.length ? (
              <Box display="flex" flexDir="row" flexWrap="wrap" mb="16px">
                {data.files.map((f) => (
                  <Box mr="4px" mb="4px" key={f.id}>
                    <FileIcon file={f} />
                  </Box>
                ))}
              </Box>
            ) : (
              <Text mb="16px" display="block" alignSelf="flex-start">
                参考資料はありません
              </Text>
            )}
            <Text
              fontSize="16px"
              mb="8px"
              display="block"
              alignSelf="flex-start">
              関連動画
            </Text>
            {data.videos && data.videos.length ? (
              <div className={eventDetailStyles.videos}>
                {data.videos.map((v) => (
                  <Youtube
                    key={v.id}
                    className={eventDetailStyles.video}
                    videoId={generateYoutubeId(v.url)}
                  />
                ))}
              </div>
            ) : (
              <Text mb="16px" display="block" alignSelf="flex-start">
                関連動画はありません
              </Text>
            )}
            {data.type !== EventType.SUBMISSION_ETC && (
              <div className={eventDetailStyles.comment_participants_wrapper}>
                <div className={eventDetailStyles.event_participants_wrapper}>
                  <EventParticipants
                    onChangeJoiningData={(uje) => handleChangeJoiningData(uje)}
                    userJoiningEvent={data.userJoiningEvent}
                  />
                </div>
                <div className={eventDetailStyles.width}>
                  <div className={eventDetailStyles.count_and_button_wrapper}>
                    <p className={eventDetailStyles.comment_count}>
                      コメント{data.comments?.length ? data.comments.length : 0}
                      件
                    </p>
                    <Button
                      size="sm"
                      colorScheme="teal"
                      onClick={() => {
                        commentVisible && newComment
                          ? handleCreateComment()
                          : setCommentVisible(true);
                      }}>
                      {commentVisible ? 'コメントを投稿する' : 'コメントを追加'}
                    </Button>
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
                  {data.comments && data.comments.length
                    ? data.comments.map(
                        (comment) =>
                          comment.writer && (
                            <>
                              <EventCommentCard
                                key={comment.id}
                                body={comment.body}
                                date={comment.createdAt}
                                writer={comment.writer}
                              />
                            </>
                          ),
                      )
                    : null}
                </div>
              </div>
            )}
            {data.type === EventType.SUBMISSION_ETC && !isFinished ? (
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
                  <Text
                    color={darkFontColor}
                    fontSize={'16px'}
                    fontWeight="bold">
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
                        const renamedFile = new File(
                          [files[i]],
                          files[i].name,
                          {
                            type: files[i].type,
                            lastModified: files[i].lastModified,
                          },
                        );
                        fileArr.push(renamedFile);
                      }
                      uploadStorage(fileArr);
                    }}
                  />
                </Box>
                {submitFiles && submitFiles.length ? (
                  <Box display="flex" flexDir="row" flexWrap="wrap" mb="16px">
                    {submitFiles.map((f) => (
                      <Box key={f.url} mb="4px" mr="4px">
                        <FileIcon
                          href={f.url || ''}
                          submitted={f.submitUnFinished}
                        />
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <></>
                )}
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </LayoutWithTab>
  );
};

export default EventDetail;
