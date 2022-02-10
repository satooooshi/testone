import React, {useState, useMemo, useEffect, useCallback} from 'react';
import {
  Calendar,
  CalendarHeader,
  getDatesInWeek,
  isAllDayEvent,
  MIN_HEIGHT,
  WeekNum,
} from 'react-native-big-calendar';
import {Alert, useWindowDimensions} from 'react-native';
import {EventSchedule} from '../../../types';
import {
  SearchQueryToGetEvents,
  useAPIGetEventList,
} from '../../../hooks/api/event/useAPIGetEventList';
import {useAuthenticate} from '../../../contexts/useAuthenticate';
import {eventTypeColorFactory} from '../../../utils/factory/eventTypeColorFactory';
import {Button, Div, Icon, ScrollDiv, Text} from 'react-native-magnus';
import {darkFontColor} from '../../../utils/colors';
import {calendarStyles} from '../../../styles/component/event/eventCalendar.style';
import {DateTime} from 'luxon';
import {
  daysQueryFactoryFromTargetDate,
  defaultWeekQuery,
  monthQueryFactoryFromTargetDate,
  weekQueryFactoryFromTargetDate,
} from '../../../utils/eventQueryRefresh';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {EventListNavigationProps} from '../../../types/navigator/drawerScreenProps';
import {dateTimeFormatterFromJSDDate} from '../../../utils/dateTimeFormatterFromJSDate';
import {ActivityIndicator} from 'react-native-paper';
import {useAPICreateEvent} from '../../../hooks/api/event/useAPICreateEvent';
import EventFormModal from '../../../components/events/EventFormModal';
import {useEventCardListSearchQuery} from '../../../contexts/event/useEventSearchQuery';

type EventCalendarProps = {
  personal?: boolean;
  visibleEventFormModal: boolean;
  hideEventFormModal: () => void;
};

type CustomMode = 'week' | 'day' | 'month';

const EventCalendar: React.FC<EventCalendarProps> = ({
  personal,
  visibleEventFormModal,
  hideEventFormModal,
}) => {
  const navigation = useNavigation<EventListNavigationProps>();
  const {user} = useAuthenticate();
  const [calendarMode, setCalendarMode] = useState<{
    mode: CustomMode;
    targetDate: Date;
  }>({
    mode: 'month',
    targetDate: new Date(),
  });
  const [searchQuery, setSearchQuery] = useState<SearchQueryToGetEvents>(
    defaultWeekQuery(),
  );
  const {partOfSearchQuery, setPartOfSearchQuery} =
    useEventCardListSearchQuery();
  const {mutate: saveEvent} = useAPICreateEvent({
    onSuccess: () => {
      hideEventFormModal();
      refetchEvents();
    },
    onError: () => {
      Alert.alert(
        'イベント作成中にエラーが発生しました。\n時間をおいて再実行してください。',
      );
    },
  });

  const {
    data: searchResult,
    refetch: refetchEvents,
    isLoading,
  } = useAPIGetEventList(searchQuery);
  const {height: windowHeight, width: windowWidth} = useWindowDimensions();

  useFocusEffect(
    useCallback(() => {
      refetchEvents();
    }, [refetchEvents]),
  );

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
          end:
            (DateTime.fromJSDate(new Date(e.endAt)).hour === 0 &&
              DateTime.fromJSDate(new Date(e.endAt)).minute) === 0
              ? DateTime.fromJSDate(new Date(e.endAt))
                  .minus({minutes: 1})
                  .toJSDate()
              : new Date(e.endAt),
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
  const calendarHeight = windowHeight - 120;

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
      const marginLeft =
        filteredEventIds.indexOf(event.id) *
        Math.floor(maxLeftMarginNum / filteredEvents.length);

      return marginLeft;
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

  const isSelectedMode = useCallback(
    (whichMode: CustomMode) => {
      if (calendarMode.mode === whichMode) {
        return true;
      }
      return false;
    },
    [calendarMode.mode],
  );

  useEffect(() => {
    if (partOfSearchQuery.refetchNeeded) {
      refetchEvents();
      setPartOfSearchQuery({refetchNeeded: false});
    }
  }, [partOfSearchQuery.refetchNeeded, refetchEvents, setPartOfSearchQuery]);

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

  useEffect(() => {
    setSearchQuery(q => ({...q, type: partOfSearchQuery.type}));
  }, [partOfSearchQuery.type]);

  return (
    <>
      <EventFormModal
        type={partOfSearchQuery.type || undefined}
        isVisible={visibleEventFormModal}
        onCloseModal={hideEventFormModal}
        onSubmit={event => saveEvent(event)}
      />
      <Div
        flexDir="row"
        justifyContent="space-between"
        w={'100%'}
        alignItems="center">
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
            onPress={() => onPressNextOrPreviousButton('next')}
            color={darkFontColor}>
            <Icon name="right" />
          </Button>
        </Div>
        <Text fontSize={16} fontWeight="bold" color={darkFontColor}>
          {`${dateTimeFormatterFromJSDDate({
            dateTime: calendarMode.targetDate,
            format: 'L月',
          })}`}
        </Text>
        <Div flexDir="row">
          <Button
            rounded="sm"
            bg={isSelectedMode('month') ? 'gray200' : 'white'}
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
            bg={isSelectedMode('week') ? 'gray200' : 'white'}
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
            bg={isSelectedMode('day') ? 'gray200' : 'white'}
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
      <ScrollDiv>
        {!isLoading ? (
          <Calendar
            bodyContainerStyle={calendarStyles.container}
            headerContainerStyle={{
              ...calendarStyles.container,
              ...calendarStyles.header,
            }}
            onPressDateHeader={onPressDateHeader}
            scrollOffsetMinutes={1200}
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
              navigation.navigate('EventStack', {
                screen: 'EventDetail',
                params: {id: event.id},
              });
            }}
            onPressCell={date =>
              setCalendarMode({mode: 'day', targetDate: date})
            }
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
        ) : (
          <ActivityIndicator />
        )}
      </ScrollDiv>
    </>
  );
};

export default EventCalendar;
