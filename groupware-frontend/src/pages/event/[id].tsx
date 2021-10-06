import LayoutWithTab from '@/components/LayoutWithTab';
import { ScreenName } from '@/components/Sidebar';
import { useAPIGetEventDetail } from '@/hooks/api/event/useAPIGetEventDetail';
import { useRouter } from 'next/router';
import eventDetailStyles from '@/styles/layouts/EventDetail.module.scss';
import Youtube from 'react-youtube';
import { useAPIJoinEvent } from '@/hooks/api/event/useAPIJoinEvent';
import { useState } from 'react';
import { AiOutlineFileProtect } from 'react-icons/ai';
import CreateEventModal from '@/components/CreateEventModal';
import EventParticipants from '@/components/EventParticepants';
import Linkify from 'react-linkify';
import { Button, Textarea } from '@chakra-ui/react';
import Head from 'next/head';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import Link from 'next/link';
import React from 'react';
import { useAPICreateComment } from '@/hooks/api/event/useAPICreateComment';
import EventCommentCard from '@/components/EventComment';
import { Tab } from 'src/types/header/tab/types';
import { dateTimeFormatterFromJSDDate } from 'src/utils/dateTimeFormatter';
import generateYoutubeId from 'src/utils/generateYoutubeId';
import { useMemo } from 'react';
import { useAPIDeleteEvent } from '@/hooks/api/event/useAPIDeleteEvent';
import { useAPIUpdateEvent } from '@/hooks/api/event/useAPIUpdateEvent';
import Image from 'next/image';
import noImage from '@/public/no-image.jpg';
import { useHeaderTab } from '@/hooks/headerTab/useHeaderTab';
import { UserRole } from 'src/types';
import { useAPIDownloadEventCsv } from '@/hooks/api/event/useAPIDownloadEventCsv';

const EventDetail = () => {
  const router = useRouter();
  const { id } = router.query as { id: string };
  const { mutate: downloadEvent } = useAPIDownloadEventCsv();
  const [editModal, setEditModal] = useState(false);
  const [commentVisible, setCommentVisible] = useState(false);
  const [newComment, setNewComment] = useState<string>('');
  const { data, refetch } = useAPIGetEventDetail(
    typeof id === 'string' ? id : '0',
  );

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

  const { user } = useAuthenticate();

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
                <div className={eventDetailStyles.join_event_wrapper}>
                  {user?.role === UserRole.ADMIN && (
                    <Button
                      colorScheme={'green'}
                      onClick={() => downloadEvent({ id, name: data.title })}>
                      CSV出力
                    </Button>
                  )}
                </div>
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
                  <a
                    href={f.url}
                    download
                    key={f.id}
                    className={eventDetailStyles.file}>
                    <AiOutlineFileProtect
                      className={eventDetailStyles.file_icon}
                    />
                    <span>
                      {(f.url.match('.+/(.+?)([?#;].*)?$') || ['', f.url])[1]}
                    </span>
                  </a>
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
          </div>
        </div>
      )}
    </LayoutWithTab>
  );
};

export default EventDetail;
