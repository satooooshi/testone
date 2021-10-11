import LayoutWithTab from '@/components/LayoutWithTab';
import { ScreenName } from '@/components/Sidebar';
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
import { Button, Textarea, useToast } from '@chakra-ui/react';
import Head from 'next/head';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import Link from 'next/link';
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
import { EventType, SubmissionFile, UserRole } from 'src/types';
import { useAPIDownloadEventCsv } from '@/hooks/api/event/useAPIDownloadEventCsv';
import { useAPIUploadStorage } from '@/hooks/api/storage/useAPIUploadStorage';
import { useAPISaveSubmission } from '@/hooks/api/event/useAPISaveSubmission';
import clsx from 'clsx';
import { useAPIDonwloadSubmissionZip } from '@/hooks/api/event/useAPIDonwloadSubmissionZip';

type FileIconProps = {
  href?: string;
  submitted?: boolean;
};

const FileIcon: React.FC<FileIconProps> = ({ href, submitted }) => {
  return (
    <a
      href={href}
      download
      className={clsx(
        eventDetailStyles.file,
        submitted
          ? eventDetailStyles.unsubmitted_file_color
          : eventDetailStyles.submitted_file_color,
      )}>
      <AiOutlineFileProtect className={eventDetailStyles.file_icon} />
      <span>{(href?.match('.+/(.+?)([?#;].*)?$') || ['', href])[1]}</span>
    </a>
  );
};

const EventDetail = () => {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const { mutate: downloadEvent } = useAPIDownloadEventCsv();
  const { mutate: downloadZip } = useAPIDonwloadSubmissionZip();
  const [editModal, setEditModal] = useState(false);
  const [commentVisible, setCommentVisible] = useState(false);
  const [newComment, setNewComment] = useState<string>('');
  const { user } = useAuthenticate();
  const { data, refetch } = useAPIGetEventDetail(
    typeof id === 'string' ? id : '0',
  );
  const submissionRef = useRef<HTMLInputElement | null>(null);
  const downloadSubmissionRef = useRef<HTMLInputElement | null>(null);
  const toast = useToast();
  const [submitFiles, setSubmitFiles] = useState<
    Partial<SubmissionFile & { submitUnFinished: boolean }>[]
  >([]);

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
  const { mutate: uploadStorage } = useAPIUploadStorage({
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

  const { mutate: joinEvent } = useAPIJoinEvent({ onSuccess: () => refetch() });
  const { mutate: saveEvent } = useAPIUpdateEvent({
    onSuccess: () => {
      setEditModal(false);
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
  });

  const isEditable = useMemo(
    () => user?.id === data?.author?.id || user?.role === 'admin',
    [user, data],
  );

  const tabs: Tab[] = useHeaderTab({
    headerTabType: 'eventDetail',
    onDeleteClicked,
  });

  const initialHeaderValue = {
    title: 'イベント詳細',
    rightButtonName: isEditable ? 'イベントを編集' : undefined,
    onClickRightButton: isEditable ? () => setEditModal(true) : undefined,
    tabs: tabs,
  };

  useEffect(() => {
    if (data && data.submissionFiles && data.submissionFiles.length) {
      setSubmitFiles(data.submissionFiles);
    }
  }, [data]);

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: ScreenName.EVENT }}
      header={initialHeaderValue}>
      <CreateEventModal
        enabled={editModal}
        onCancelPressed={() => setEditModal(false)}
        event={data}
        createEvent={(newEvent) => saveEvent(newEvent)}
      />
      {data && (
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
                  <Image src={noImage} alt="イベント画像" />
                )}
              </div>
              <div className={eventDetailStyles.event_info_right}>
                {user?.role === UserRole.ADMIN &&
                data.type === EventType.SUBMISSION_ETC ? (
                  <div className={eventDetailStyles.admin_buttons_wrapper}>
                    <Button
                      colorScheme={'green'}
                      onClick={() =>
                        downloadZip({
                          id: data.id.toString(),
                          name: data.title,
                        })
                      }>
                      提出物を一括ダウンロード
                    </Button>
                  </div>
                ) : null}
                {user?.role === UserRole.ADMIN &&
                data.type !== EventType.SUBMISSION_ETC ? (
                  <div className={eventDetailStyles.admin_buttons_wrapper}>
                    <Button
                      colorScheme={'green'}
                      onClick={() => downloadEvent({ id, name: data.title })}>
                      イベントデータをCSV出力
                    </Button>
                  </div>
                ) : null}
                <span className={eventDetailStyles.event_title}>
                  {data.title}
                </span>
                <span className={eventDetailStyles.sub_title}>概要</span>
                <div className={eventDetailStyles.description_wrapper}>
                  <Linkify>
                    <span className={eventDetailStyles.description}>
                      {data.description}
                    </span>
                  </Linkify>
                </div>
                <div className={eventDetailStyles.join_event_wrapper}>
                  {data.type !== 'submission_etc' && (
                    <Button
                      colorScheme={data.isJoining ? 'teal' : 'pink'}
                      onClick={() =>
                        !data.isJoining && joinEvent({ eventID: Number(id) })
                      }>
                      {data.isJoining ? '参加済' : 'イベントに参加'}
                    </Button>
                  )}
                </div>
                <div className={eventDetailStyles.event_dates_wrapper}>
                  <span className={eventDetailStyles.start_date}>
                    {`開始: ${dateTimeFormatterFromJSDDate({
                      dateTime: new Date(data.startAt),
                      format: 'yyyy/LL/dd HH:mm',
                    })} ~ `}
                  </span>
                  <span className={eventDetailStyles.end_date}>
                    {`終了: ${dateTimeFormatterFromJSDDate({
                      dateTime: new Date(data.endAt),
                      format: 'yyyy/LL/dd HH:mm',
                    })}`}
                  </span>
                </div>
                {data && data.tags && data.tags.length ? (
                  <div className={eventDetailStyles.tags_wrapper}>
                    {data.tags.map((tag) => (
                      <Link href={`/event/list?tag=${tag.id}`} key={tag.id}>
                        <a className={eventDetailStyles.tag}>
                          <Button colorScheme="purple" height="28px">
                            {tag.name}
                          </Button>
                        </a>
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
            <span className={eventDetailStyles.sub_title}>参考資料</span>
            {data.files && data.files.length ? (
              <div className={eventDetailStyles.files_wrapper}>
                {data.files.map((f) => (
                  <FileIcon href={f.url} key={f.id} />
                ))}
              </div>
            ) : (
              <p className={eventDetailStyles.none_text}>
                参考資料はありません
              </p>
            )}
            <p className={eventDetailStyles.sub_title}>関連動画</p>
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
              <p className={eventDetailStyles.none_text}>
                関連動画はありません
              </p>
            )}
            <div className={eventDetailStyles.event_participants_wrapper}>
              {data.type !== 'submission_etc' && (
                <EventParticipants participants={data.users} />
              )}
            </div>
            {data.type === EventType.SUBMISSION_ETC ? (
              <>
                <div className={eventDetailStyles.count_and_button_wrapper}>
                  <div className={eventDetailStyles.submission_bar_left}>
                    <p className={eventDetailStyles.submission_bar_left_info}>
                      {data.submissionFiles.length
                        ? data.submissionFiles.length + '件のファイルを提出済み'
                        : '提出物を送信してください'}
                    </p>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      marginRight="16px"
                      onClick={() => {
                        submissionRef.current?.click();
                      }}>
                      提出物を追加
                    </Button>
                    <p className={eventDetailStyles.caution_message}>
                      ※水色のアイコンのファイルはまだ提出状況が保存されていません
                    </p>
                  </div>
                  <div className={eventDetailStyles.submit_buttons_wrapper}>
                    <Button
                      size="sm"
                      colorScheme={submitFiles.length ? 'pink' : 'blue'}
                      onClick={() => {
                        saveSubmission(submitFiles);
                      }}>
                      提出状況を保存
                    </Button>
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
                          fileArr.push(files[i]);
                        }
                        uploadStorage(fileArr);
                      }}
                    />
                  </div>
                </div>
                {submitFiles && submitFiles.length ? (
                  <div className={eventDetailStyles.submission_files_wrapper}>
                    {submitFiles.map((f) => (
                      <div
                        key={f.url}
                        className={clsx(
                          eventDetailStyles.submission_file_icon_item_wrapper,
                        )}>
                        <FileIcon href={f.url} submitted={f.submitUnFinished} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <></>
                )}
              </>
            ) : (
              <>
                <div className={eventDetailStyles.count_and_button_wrapper}>
                  <p className={eventDetailStyles.comment_count}>
                    コメント{data.comments?.length ? data.comments.length : 0}件
                  </p>
                  <Button
                    size="sm"
                    colorScheme="teal"
                    onClick={() => {
                      commentVisible && newComment
                        ? createComment({
                            body: newComment,
                            eventSchedule: data,
                          })
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
              </>
            )}
          </div>
        </div>
      )}
    </LayoutWithTab>
  );
};

export default EventDetail;
