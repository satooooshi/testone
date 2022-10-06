/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
const ReactPaginate = dynamic(() => import('react-paginate'), { ssr: false });
import { useEffect, useMemo, useRef, useState } from 'react';
import { EventSchedule, EventType, Tag } from 'src/types';

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
import {
  SearchQueryToGetEvents,
  useAPIGetEventList,
} from '@/hooks/api/event/useAPIGetEventList';
import { Box, useMediaQuery, Spinner, Text } from '@chakra-ui/react';
import { hideScrollbarCss } from 'src/utils/chakra/hideScrollBar.css';
import _ from 'lodash';

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

type EventListGetParams = SearchQueryToGetEvents & {
  personal?: string;
};

const AnnualCalendar = () => {
  const router = useRouter();
  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');

  const searchQuery: SearchQueryToGetEvents = {
    page: '1',
    word: '',
    tag: '',
    status: undefined,
    type: '',
    from: DateTime.fromJSDate(new Date())
      .minus({ months: 2 })
      .toJSDate()
      .toDateString(),
    to: DateTime.fromJSDate(new Date())
      .plus({ months: 13 })
      .toJSDate()
      .toDateString(),
    personal: '',
  };

  const {
    data: events,
    refetch,
    isLoading: isLoadingEvents,
  } = useAPIGetEventList(searchQuery);
  const calendarRef = useRef<HTMLDivElement | null>(null);

  const eventPropGetter = (event: any): any => {
    const type = event.type;
    switch (type) {
      case EventType.IMPRESSIVE_UNIVERSITY:
        return { style: { backgroundColor: '#3182ce' } };
      case EventType.STUDY_MEETING:
        return { style: { backgroundColor: '#38a169' } };
      case EventType.BOLDAY:
        return { style: { backgroundColor: '#f6ad55' } };
      case EventType.COACH:
        return { style: { backgroundColor: '#90cdf4', color: '#65657d' } };
      case EventType.CLUB:
        return { style: { backgroundColor: '#f56565' } };
      case EventType.SUBMISSION_ETC:
        return { style: { backgroundColor: '#086f83' } };
      case EventType.OTHER:
        return { style: { backgroundColor: '#a9a9a9' } };
    }
  };

  const memorizedEvent = useMemo<any[] | undefined>(() => {
    const changeToBigCalendarEvent = (ev?: EventSchedule[]) => {
      if (ev) {
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
  }, [events]);

  useEffect(() => {
    calendarRef?.current?.scrollIntoView();
    refetch();
    console.log('refetch called.');
  }, []);

  return (
    <>
      <Text fontWeight="bold" fontSize={20} textAlign="center">
        {DateTime.fromJSDate(new Date()).toFormat('yyyy / M / d')}
      </Text>
      <Text fontWeight="bold" fontSize={20} textAlign="center">
        感動大学開講カレンダー
      </Text>
      <Text fontWeight="bold" fontSize={20} textAlign="center" mb={10}>
        {DateTime.fromJSDate(new Date())
          .minus({ months: 1 })
          .toFormat('yyyy年 M月 ~ ')}
        {DateTime.fromJSDate(new Date())
          .plus({ months: 12 })
          .toFormat('yyyy年 M月')}
      </Text>
      {isLoadingEvents ? (
        <Box display="flex" flexDir="row" justifyContent="center">
          <Spinner />
        </Box>
      ) : (
        <>
          {_.range(-1, 13).map((i) => (
            <Box
              display="flex"
              flexDir="column"
              justifyContent="flex-start"
              mb="72px">
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
                  defaultDate={DateTime.fromJSDate(new Date())
                    .plus({ months: i })
                    .toJSDate()}
                  views={[Views.MONTH]}
                  className={bigCalendarStyles.big_calendar}
                  localizer={localizer}
                  events={memorizedEvent}
                  formats={formats}
                  defaultView={Views.MONTH}
                  popup={true}
                  onSelectEvent={(e) => {
                    const eventSchedule = e as EventSchedule;
                    router.push('/event/' + eventSchedule.id);
                  }}
                  eventPropGetter={eventPropGetter}
                  components={{
                    toolbar: () => (
                      <Text
                        fontWeight="bold"
                        fontSize={20}
                        mb={8}
                        textAlign="center">
                        {DateTime.fromJSDate(new Date())
                          .plus({ months: i })
                          .toFormat('yyyy年M月')}
                      </Text>
                    ),
                  }}
                />
              </Box>
            </Box>
          ))}
        </>
      )}
    </>
  );
};

export default AnnualCalendar;
