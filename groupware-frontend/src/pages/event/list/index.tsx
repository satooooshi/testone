/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Tab } from 'src/types/header/tab/types';
import { SidebarScreenName } from '@/components/layout/Sidebar';
import eventListStyles from '@/styles/layouts/EventList.module.scss';
import { eventPropGetter } from 'src/utils/eventPropGetter';
import EventCard from '@/components/common/EventCard';
import { useRouter } from 'next/router';
import paginationStyles from '@/styles/components/Pagination.module.scss';
import dynamic from 'next/dynamic';
const ReactPaginate = dynamic(() => import('react-paginate'), { ssr: false });
import { useEffect, useMemo, useRef, useState } from 'react';

import LayoutWithTab from '@/components/layout/LayoutWithTab';
import CreateEventModal, {
  CreateEventRequest,
} from '@/components/event/CreateEventModal';
import SearchForm from '@/components/common/SearchForm';
import { EventSchedule, EventType, Tag } from 'src/types';
import { EventTab } from 'src/types/header/tab/types';
import { toggleTag } from 'src/utils/toggleTag';
import { generateEventSearchQueryString } from 'src/utils/eventQueryRefresh';
import {
  Calendar,
  DateRange,
  Formats,
  momentLocalizer,
  Views,
} from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import bigCalendarStyles from '@/styles/components/BigCalendar.module.scss';
import moment from 'moment';
import 'moment/locale/ja';
import { dateTimeFormatterFromJSDDate } from 'src/utils/dateTimeFormatter';
import { DateTime } from 'luxon';
import Head from 'next/head';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import TopTabBar, { TopTabBehavior } from '@/components/layout/TopTabBar';
import { useAPICreateEvent } from '@/hooks/api/event/useAPICreateEvent';
import {
  SearchQueryToGetEvents,
  useAPIGetEventList,
} from '@/hooks/api/event/useAPIGetEventList';
import { useAPIGetTag } from '@/hooks/api/tag/useAPIGetTag';
import { useHeaderTab } from '@/hooks/headerTab/useHeaderTab';
import { useAPIUpdateEvent } from '@/hooks/api/event/useAPIUpdateEvent';
import { Box, useMediaQuery, useToast } from '@chakra-ui/react';
import { responseErrorMsgFactory } from 'src/utils/factory/responseErrorMsgFactory';
import { hideScrollbarCss } from 'src/utils/chakra/hideScrollBar.css';
import { isEditableEvent } from 'src/utils/factory/isCreatableEvent';

const localizer = momentLocalizer(moment);
//@ts-ignore
const BigCalendar = withDragAndDrop(Calendar);
const formats: Formats = {
  dateFormat: 'D',
  dayFormat: 'D(ddd)',
  monthHeaderFormat: 'YYYY年M月',
  dayRangeHeaderFormat: (range: DateRange) => {
    return (
      dateTimeFormatterFromJSDDate({
        dateTime: new Date(range.start),
        format: 'yyyy年LL月dd日 - ',
      }) +
      dateTimeFormatterFromJSDDate({
        dateTime: new Date(range.end),
        format: 'LL月dd日',
      })
    );
  },
  dayHeaderFormat: 'M月D日(ddd)',
};

export interface DatetimeSettings {
  addDays: number;
  hours: number;
  minutes: number;
}

const setDateTime = (setting: DatetimeSettings) => {
  const today = new Date();
  today.setDate(today.getDate() + setting.addDays);
  today.setHours(setting.hours, setting.minutes);
  return today;
};

const initialEventValue = {
  title: '',
  description: '',
  startAt: setDateTime({
    addDays: 1,
    hours: 19,
    minutes: 0,
  }),
  endAt: setDateTime({
    addDays: 1,
    hours: 21,
    minutes: 0,
  }),
  type: EventType.STUDY_MEETING,
  imageURL: '',
  chatNeeded: false,
  hostUsers: [],
  tags: [],
  files: [],
  videos: [],
};

const eventTitleText = {
  [EventType.IMPRESSIVE_UNIVERSITY]: '感動大学',
  [EventType.STUDY_MEETING]: '勉強会',
  [EventType.BOLDAY]: 'BOLDay',
  [EventType.COACH]: 'コーチ制度',
  [EventType.CLUB]: '部活動',
  [EventType.SUBMISSION_ETC]: '提出物等',
  [EventType.OTHER]: 'その他',
};

type EventListGetParams = SearchQueryToGetEvents & {
  personal?: string;
};

const EventList = () => {
  const router = useRouter();
  const toast = useToast();
  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');

  const {
    page = '1',
    word = '',
    tag = '',
    status = 'future',
    type,
    from,
    to,
    personal,
  } = router.query as EventListGetParams;

  const {
    data: events,
    refetch,
    isLoading: isLoadingEvents,
  } = useAPIGetEventList({
    page,
    word,
    tag,
    status,
    type,
    from,
    to,
    personal,
  });
  const { user } = useAuthenticate();
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const { data: tags } = useAPIGetTag();
  const [searchWord, setSearchWord] = useState(word);
  const [modalVisible, setModalVisible] = useState(false);
  const calendarRef = useRef<HTMLDivElement | null>(null);
  const { mutate: createEvent } = useAPICreateEvent({
    onSuccess: () => {
      setNewEvent(initialEventValue);
      setModalVisible(false);
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
  const { mutate: updateEvent } = useAPIUpdateEvent({
    onSuccess: () => {
      setModalVisible(false);
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
  const [newEvent, setNewEvent] = useState<CreateEventRequest>();

  const onToggleTag = (t: Tag) => {
    setSelectedTags((s) => toggleTag(s, t));
  };

  const isCalendar: boolean = useMemo(() => {
    if ((!from && from !== '') || (!to && to !== '')) {
      return false;
    }
    return true;
  }, [from, to]);

  const queryRefresh = (newQuery: EventListGetParams) => {
    const selectedTagIDs = selectedTags.map((t) => t.id.toString());
    const url = generateEventSearchQueryString({
      ...router.query,
      ...newQuery,
      tag: selectedTagIDs.join('+'),
    });
    router.push(url, undefined, {
      shallow: true,
    });
  };

  const tabs: Tab[] = useHeaderTab({
    headerTabType: 'event',
    queryRefresh,
    personal,
    from,
    to,
  });

  const hrefTagClick = (t: Tag): string => {
    const url = generateEventSearchQueryString({
      ...router.query,
      tag: t.id.toString(),
    });
    return url;
  };

  const activeTabName = () => {
    if (type === EventType.IMPRESSIVE_UNIVERSITY) {
      return EventTab.IMPRESSIVE_UNIVERSITY;
    }
    if (type === EventType.BOLDAY) {
      return EventTab.BOLDAY;
    }
    if (type === EventType.STUDY_MEETING) {
      return EventTab.STUDY_MEETING;
    }
    if (type === EventType.COACH) {
      return EventTab.COACH;
    }
    if (type === EventType.CLUB) {
      return EventTab.CLUB;
    }
    if (type === EventType.SUBMISSION_ETC) {
      return EventTab.SUBMISSION_ETC;
    }
    if (type === EventType.OTHER) {
      return EventTab.OTHER;
    }
    return EventTab.ALL;
  };

  const handleNewEventFromCalendar = (event: any) => {
    const newEventObject = {
      ...initialEventValue,
      startAt: event.start,
      endAt: event.end,
    };
    if (type) {
      newEventObject.type = type;
    }
    setNewEvent(newEventObject);
    setModalVisible(true);
  };

  const isAuthor = (event: EventSchedule) => {
    if (event?.author?.id === user?.id) {
      return true;
    }
    return false;
  };

  const resizeEvent = async ({ event, start, end }: any) => {
    if (!isEditableEvent(event.type, user) && !isAuthor(event)) {
      alert('イベントを編集する権限がありません');
      return;
    }
    if (end < new Date()) {
      alert('終了したイベントは編集できません');
      return;
    }
    if (confirm('イベント日時が変更されます。よろしいですか？')) {
      const newEventInfo = { ...event, startAt: start, endAt: end };
      updateEvent(newEventInfo);
    }
  };

  const moveEvent = async ({ event, start, end }: any) => {
    if (!isEditableEvent(event.type, user) && !isAuthor(event)) {
      alert('イベントを編集する権限がありません');
      return;
    }
    if (end < new Date()) {
      alert('終了したイベントは編集できません');
      return;
    }
    if (confirm('イベント日時が変更されます。よろしいですか？')) {
      const newEventInfo = { ...event, startAt: start, endAt: end };
      updateEvent(newEventInfo);
    }
  };

  const memorizedEvent = useMemo<any[] | undefined>(() => {
    const changeToBigCalendarEvent = (ev?: EventSchedule[]) => {
      if (ev) {
        // if (personal === 'true') {
        //   ev = ev.filter((e) => {
        //     if (
        //       e.userJoiningEvent?.filter((u) => u?.user?.id === user?.id).length
        //     ) {
        //       return true;
        //     }
        //   });
        // }
        const events: any[] = ev.map((e) => ({
          ...e,
          start: new Date(e.startAt),
          end: new Date(e.endAt),
        }));
        return events;
      }
      return [];
    };
    return changeToBigCalendarEvent(events?.events);
  }, [events, personal, user]);

  const handleCalendarRangeChange = (
    range: Date[] | { start: Date | string; end: Date | string },
  ) => {
    if (Array.isArray(range)) {
      const dateArr: Date[] = range;
      const start = dateArr[0];
      const lastDay = dateArr[dateArr.length - 1];
      const from = DateTime.fromJSDate(start, { zone: 'Asia/Tokyo' }).toFormat(
        'yyyy-LL-dd',
      );
      // lastDay's time is 00:00:00, so must fetch 1 day later than lastDay
      const to = DateTime.fromJSDate(lastDay, { zone: 'Asia/Tokyo' })
        .plus({ day: 1 })
        .toFormat('yyyy-LL-dd');
      queryRefresh({ from, to, personal });
    } else {
      const dateRange: {
        start: string | Date;
        end: string | Date;
      } = range;
      if (range.start && range.end) {
        const from = dateTimeFormatterFromJSDDate({
          dateTime: new Date(dateRange.start),
          format: 'yyyy-LL-dd',
        });
        const to = dateTimeFormatterFromJSDDate({
          dateTime: new Date(dateRange.end),
          format: 'yyyy-LL-dd',
        });
        queryRefresh({ from, to, personal });
      }
    }
  };

  // const initialCalendarDate: Date = useMemo(() => {
  //   if (from && to) {
  //     return DateTime.fromFormat(from, 'yyyy-LL-dd').toJSDate();
  //   }
  //   return new Date();
  // }, [from, to]);

  useEffect(() => {
    calendarRef?.current?.scrollIntoView();
  }, []);

  const initialHeaderValue = {
    title: 'Events',
    activeTabName: activeTabName(),
    tabs: tabs,
    rightButtonName: 'イベントを追加',
    onClickRightButton: () => setModalVisible(true),
    resetEventForm: () => setNewEvent(initialEventValue),
  };

  useEffect(() => {
    if (tags) {
      const tagsInQueryParams = tag.split(' ');
      const searchedTags =
        tags.filter((t) => tagsInQueryParams.includes(t.id.toString())) || [];
      setSelectedTags(searchedTags);
    }
  }, [tag, tags]);

  const topTabBehaviorList: TopTabBehavior[] = [
    {
      tabName: 'Myカレンダー',
      onClick: () => {
        queryRefresh({
          page: '1',
          personal: 'true',
          from: from || '',
          to: to || '',
        });
      },
      isActiveTab: !!(isCalendar && personal),
    },
    {
      tabName: '全体カレンダー',
      onClick: () => {
        queryRefresh({
          personal: '',
          page: '1',
          from: from || '',
          to: to || '',
        });
      },
      isActiveTab: !!(isCalendar && !personal),
    },
    {
      tabName: '今後のイベント',
      onClick: () => {
        queryRefresh({
          page: '1',
          status: 'future',
          from: undefined,
          to: undefined,
        });
      },
      isActiveTab: !isCalendar && status === 'future',
    },
    {
      tabName: '過去のイベント',
      onClick: () => {
        queryRefresh({
          page: '1',
          status: 'past',
          from: undefined,
          to: undefined,
        });
      },
      isActiveTab: !isCalendar && status === 'past',
    },
    {
      tabName: '進行中のイベント',
      onClick: () => {
        queryRefresh({
          page: '1',
          status: 'current',
          from: undefined,
          to: undefined,
        });
      },
      isActiveTab: !isCalendar && status === 'current',
    },
  ];

  return (
    <LayoutWithTab
      header={initialHeaderValue}
      sidebar={{ activeScreenName: SidebarScreenName.EVENT }}>
      <Head>
        <title>
          ボールド | {type ? eventTitleText[type] : '全てのイベント'}
        </title>
      </Head>
      <CreateEventModal
        enabled={modalVisible}
        onCancelPressed={() => setModalVisible(false)}
        createEvent={createEvent}
        event={newEvent}
      />
      <Box
        display="flex"
        flexDir="column"
        justifyContent="flex-start"
        mb="72px">
        <Box mb="24px">
          <TopTabBar topTabBehaviorList={topTabBehaviorList} />
        </Box>

        {isCalendar && (
          <Box
            ref={calendarRef}
            justifyContent="center"
            alignItems="center"
            maxW={isSmallerThan768 ? '99vw' : undefined}
            overflowX="auto"
            css={hideScrollbarCss}
            alignSelf="center">
            <BigCalendar
              selectable
              resizable
              scrollToTime={DateTime.now()
                .set({ hour: 10, minute: 0 })
                .toJSDate()}
              views={['month', 'week', 'day']}
              className={bigCalendarStyles.big_calendar}
              localizer={localizer}
              events={memorizedEvent}
              formats={formats}
              defaultView={Views.MONTH}
              onEventResize={resizeEvent}
              onEventDrop={moveEvent}
              onRangeChange={(range) => {
                handleCalendarRangeChange(range);
              }}
              popup={true}
              // defaultDate={initialCalendarDate}
              onSelectSlot={handleNewEventFromCalendar}
              onSelectEvent={(e) => {
                const eventSchedule = e as EventSchedule;
                router.push('/event/' + eventSchedule.id);
              }}
              eventPropGetter={eventPropGetter}
            />
          </Box>
        )}

        {!isCalendar && (
          <>
            <div className={eventListStyles.search_form_wrapper}>
              <SearchForm
                onClear={() => setSelectedTags([])}
                onClickButton={(w) => queryRefresh({ page: '1', word: w })}
                tags={tags || []}
                selectedTags={selectedTags}
                toggleTag={onToggleTag}
              />
            </div>
            <div className={eventListStyles.event_list_wrapper}>
              {events?.events.length ? (
                <div className={eventListStyles.event_card__row}>
                  {events.events.map((e) => (
                    <div
                      key={e.id}
                      className={eventListStyles.event_card_margin}>
                      <EventCard
                        hrefTagClick={hrefTagClick}
                        eventSchedule={e}
                      />
                    </div>
                  ))}
                </div>
              ) : !isLoadingEvents ? (
                <p className={eventListStyles.no_result_text}>
                  検索結果が見つかりませんでした
                </p>
              ) : null}
            </div>
          </>
        )}
      </Box>
      <div className={eventListStyles.pagination_wrapper}>
        {typeof window !== 'undefined' &&
        !isCalendar &&
        events &&
        events.pageCount ? (
          <ReactPaginate
            pageCount={events.pageCount}
            onPageChange={({ selected }) => {
              queryRefresh({ page: (selected + 1).toString() });
            }}
            initialPage={page ? Number(page) - 1 : 1}
            forcePage={page ? Number(page) - 1 : 1}
            disableInitialCallback={true}
            previousLabel={'前へ'}
            nextLabel={'次へ'}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            containerClassName={paginationStyles.pagination}
            activeClassName={paginationStyles.active}
            disabledClassName={paginationStyles.button__disabled}
          />
        ) : null}
      </div>
    </LayoutWithTab>
  );
};

export default EventList;
