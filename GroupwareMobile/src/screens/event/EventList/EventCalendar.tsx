import React, {
  useState,
  useMemo,
  Dispatch,
  SetStateAction,
  useEffect,
} from 'react';
import {
  Calendar,
  CalendarHeader,
  getDatesInWeek,
  isAllDayEvent,
  MIN_HEIGHT,
  WeekNum,
} from 'react-native-big-calendar';
import {useWindowDimensions} from 'react-native';
import {EventSchedule} from '../../../types';
import {
  SearchQueryToGetEvents,
  SearchResultToGetEvents,
} from '../../../hooks/api/event/useAPIGetEventList';
import {useAuthenticate} from '../../../contexts/useAuthenticate';
import {eventTypeColorFactory} from '../../../utils/factory/eventTypeColorFactory';
import {EventListNavigationProps} from '../../../types/navigator/screenProps/Event';
import {Button, Div, Icon} from 'react-native-magnus';
import {darkFontColor} from '../../../utils/colors';
import {calendarStyles} from '../../../styles/component/event/eventCalendar.style';
import {DateTime} from 'luxon';
import {
  daysQueryFactoryFromTargetDate,
  monthQueryFactoryFromTargetDate,
  weekQueryFactoryFromTargetDate,
} from '../../../utils/eventQueryRefresh';

type PersonalCalendarProps = {
  personal?: boolean;
  searchResult?: SearchResultToGetEvents;
  navigation: EventListNavigationProps;
  searchQuery: SearchQueryToGetEvents;
  setSearchQuery: Dispatch<SetStateAction<SearchQueryToGetEvents>>;
};

type CustomMode = 'week' | 'day' | 'month';

const EventCalendar: React.FC<PersonalCalendarProps> = ({
  navigation,
  personal,
  searchResult,
  setSearchQuery,
}) => {
  const {user} = useAuthenticate();
  const [calendarMode, setCalendarMode] = useState<{
    mode: CustomMode;
    targetDate: Date;
  }>({
    mode: 'day',
    targetDate: new Date(),
  });
  const {height: windowHeight, width: windowWidth} = useWindowDimensions();

  const memorizedEvent = useMemo<any[]>(() => {
    const changeToBigCalendarEvent = (ev?: EventSchedule[]): any[] => {
      if (ev) {
        if (personal) {
          ev = ev.filter(e => {
            if (
              e.userJoiningEvent?.filter(u => u?.user?.id === user?.id).length
            ) {
              return true;
            }
          });
        }
        const modifiedEvents: any[] = ev.map(e => ({
          ...e,
          start: new Date(e.startAt),
          end: new Date(e.endAt),
        }));
        return modifiedEvents;
      }
      return [];
    };
    return changeToBigCalendarEvent(searchResult?.events);
  }, [personal, searchResult?.events, user?.id]);

  const dateRange = React.useMemo(() => {
    if (calendarMode.mode === 'day') {
      return getDatesInWeek(
        calendarMode.targetDate,
        (calendarMode.targetDate.getDay() - 3) as WeekNum,
        'ja',
      );
    }
    return getDatesInWeek(new Date(), 0, 'ja');
  }, [calendarMode.mode, calendarMode.targetDate]);
  const calendarHeight = windowHeight - 60;

  const headerCellHeight = useMemo(() => MIN_HEIGHT / 24 - 20, []);

  const allDayEvents = useMemo(() => {
    return memorizedEvent.filter(event =>
      isAllDayEvent(event.startAt, event.endAt),
    );
  }, [memorizedEvent]);

  const onPressDateHeader = (date: Date) => {
    setCalendarMode({mode: 'day', targetDate: date});
  };
  const eventWidth = (event: any): number => {
    const existCount = memorizedEvent.filter(
      e => e.startAt === event.startAt,
    ).length;
    if (existCount) {
      return 100 / existCount;
    }
    return 0;
  };
  const eventPosition = (event: any): number => {
    const maxLeftMarginNum = windowWidth * 0.8;
    const filteredEvents = memorizedEvent.filter(e => {
      return (
        DateTime.fromJSDate(e.startAt).toFormat('yyyy/LL/dd HH:mm') ===
        DateTime.fromJSDate(event.startAt).toFormat('yyyy/LL/dd HH:mm')
      );
    });
    const existCount = filteredEvents.length;
    if (existCount) {
      const filteredEventIds = filteredEvents.map(e => e.id);

      return (
        filteredEventIds.indexOf(event.id) *
        Math.floor(maxLeftMarginNum / filteredEvents.length)
      );
    }
    return 0;
  };

  const onPressModeChangerButton = (modeLiteral: CustomMode) => {
    setCalendarMode(m => ({...m, mode: modeLiteral}));
  };

  const onPressNextOrPreviousButton = (changeTo: 'previous' | 'next') => {
    let newTargetDate: Date;
    if (changeTo === 'next') {
      switch (calendarMode.mode) {
        case 'month':
          newTargetDate = DateTime.fromJSDate(calendarMode.targetDate)
            .plus({months: 1})
            .toJSDate();
          break;
        case 'week':
          newTargetDate = DateTime.fromJSDate(calendarMode.targetDate)
            .plus({weeks: 1})
            .toJSDate();
          break;
        case 'day':
          newTargetDate = DateTime.fromJSDate(calendarMode.targetDate)
            .plus({days: 1})
            .toJSDate();
          break;
      }
    } else {
      switch (calendarMode.mode) {
        case 'month':
          newTargetDate = DateTime.fromJSDate(calendarMode.targetDate)
            .minus({months: 1})
            .toJSDate();
          break;
        case 'week':
          newTargetDate = DateTime.fromJSDate(calendarMode.targetDate)
            .minus({weeks: 1})
            .toJSDate();
          break;
        case 'day':
          newTargetDate = DateTime.fromJSDate(calendarMode.targetDate)
            .minus({days: 1})
            .toJSDate();
          break;
      }
    }
    setCalendarMode(m => ({...m, targetDate: newTargetDate}));
  };

  const onPressTodayButton = () => {
    setCalendarMode(m => ({...m, targetDate: new Date()}));
  };

  useEffect(() => {
    let queryObj: Partial<SearchQueryToGetEvents>;
    switch (calendarMode.mode) {
      case 'month':
        queryObj = monthQueryFactoryFromTargetDate(calendarMode.targetDate);
        setSearchQuery(q => ({...q, ...queryObj}));
        break;
      case 'week':
        queryObj = weekQueryFactoryFromTargetDate(calendarMode.targetDate);
        setSearchQuery(q => ({...q, ...queryObj}));
        break;
      case 'day':
        queryObj = daysQueryFactoryFromTargetDate(calendarMode.targetDate);
        setSearchQuery(q => ({...q, ...queryObj}));
        break;
    }
  }, [calendarMode.mode, calendarMode.targetDate, setSearchQuery]);

  return (
    <>
      <Div flexDir="row" justifyContent="space-between" w={'100%'}>
        <Div flexDir="row">
          <Button
            rounded="sm"
            bg="white"
            borderColor="#e0e0e0"
            borderWidth={1}
            h={40}
            w={80}
            justifyContent="center"
            alignItems="center"
            p={0}
            onPress={onPressTodayButton}
            color={darkFontColor}>
            今日
          </Button>
          <Button
            rounded="sm"
            bg="white"
            borderColor="#e0e0e0"
            borderWidth={1}
            h={40}
            w={40}
            justifyContent="center"
            alignItems="center"
            p={0}
            onPress={() => onPressNextOrPreviousButton('previous')}
            color={darkFontColor}>
            <Icon name="left" />
          </Button>
          <Button
            rounded="sm"
            bg="white"
            borderColor="#e0e0e0"
            borderWidth={1}
            h={40}
            w={40}
            justifyContent="center"
            alignItems="center"
            p={0}
            onPress={() => onPressNextOrPreviousButton('next')}
            color={darkFontColor}>
            <Icon name="right" />
          </Button>
        </Div>
        <Div flexDir="row">
          <Button
            rounded="sm"
            bg="white"
            borderColor="#e0e0e0"
            borderWidth={1}
            h={40}
            w={40}
            justifyContent="center"
            alignItems="center"
            p={0}
            onPress={() => onPressModeChangerButton('month')}
            color={darkFontColor}>
            月
          </Button>
          <Button
            rounded="sm"
            bg="white"
            borderColor="#e0e0e0"
            borderWidth={1}
            h={40}
            w={40}
            justifyContent="center"
            alignItems="center"
            p={0}
            onPress={() => onPressModeChangerButton('week')}
            color={darkFontColor}>
            週
          </Button>
          <Button
            rounded="sm"
            bg="white"
            borderColor="#e0e0e0"
            borderWidth={1}
            h={40}
            w={40}
            justifyContent="center"
            alignItems="center"
            p={0}
            onPress={() => onPressModeChangerButton('day')}
            color={darkFontColor}>
            日
          </Button>
        </Div>
      </Div>
      <Calendar
        bodyContainerStyle={calendarStyles.container}
        headerContainerStyle={calendarStyles.container}
        onPressDateHeader={onPressDateHeader}
        renderHeader={
          calendarMode.mode === 'day'
            ? () => (
                <CalendarHeader
                  onPressDateHeader={onPressDateHeader}
                  dateRange={dateRange}
                  cellHeight={headerCellHeight}
                  allDayEvents={allDayEvents}
                  style={calendarStyles.container}
                  activeDate={calendarMode.targetDate}
                />
              )
            : undefined
        }
        activeDate={calendarMode.targetDate}
        date={calendarMode.targetDate}
        events={memorizedEvent}
        mode={calendarMode.mode}
        onPressEvent={event => {
          navigation.navigate('EventDetail', {id: event.id});
        }}
        onPressCell={date => setCalendarMode({mode: 'day', targetDate: date})}
        height={calendarHeight}
        eventCellStyle={
          calendarMode.mode === 'day'
            ? event => ({
                backgroundColor: eventTypeColorFactory(event.type),
                borderColor: '#e0e0e0',
                borderWidth: 1,
                width: `${eventWidth(event)} %`,
                minWidth: '33%',
                marginLeft: eventPosition(event),
              })
            : event => ({
                backgroundColor: eventTypeColorFactory(event.type),
                borderColor: '#e0e0e0',
                borderWidth: 1,
              })
        }
      />
    </>
  );
};

export default EventCalendar;
