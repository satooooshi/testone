/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { EventSchedule, EventType } from 'src/types';
import { eventPropGetter } from 'src/utils/eventPropGetter';
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

const AnnualCalendar: React.FC = () => {
  const router = useRouter();
  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');

  const searchQuery: SearchQueryToGetEvents = {
    page: '',
    word: '',
    tag: '',
    status: undefined,
    type: EventType.IMPRESSIVE_UNIVERSITY,
    from: DateTime.fromJSDate(new Date())
      .minus({ months: 1 })
      .toJSDate()
      .toDateString(),
    to: DateTime.fromJSDate(new Date())
      .plus({ months: 7 })
      .toJSDate()
      .toDateString(),
    personal: '',
  };

  const {
    data: events,
    refetch,
    isLoading: isLoadingEvents,
  } = useAPIGetEventList(searchQuery);

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

  useEffect(() => {
    console.log('mounted, refetch called');
    refetch();
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
          .minus({ months: 0 })
          .toFormat('yyyy年 M月 ~ ')}
        {DateTime.fromJSDate(new Date())
          .plus({ months: 5 })
          .toFormat('yyyy年 M月')}
      </Text>
      {isLoadingEvents ? (
        <Box display="flex" flexDir="row" justifyContent="center">
          <Spinner />
        </Box>
      ) : (
        <>
          {_.range(0, 6).map((i) => (
            <Box
              key={i}
              display="flex"
              flexDir="column"
              justifyContent="flex-start"
              mb="72px">
              <Box
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
                  events={changeToBigCalendarEvent(events?.events)}
                  formats={formats}
                  defaultView={Views.MONTH}
                  popup={true}
                  onSelectEvent={(e) => {
                    const eventSchedule = e as EventSchedule;
                    router.push('/event/' + eventSchedule.id);
                  }}
                  eventPropGetter={eventPropGetter}
                  components={{
                    // eslint-disable-next-line react/display-name
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
