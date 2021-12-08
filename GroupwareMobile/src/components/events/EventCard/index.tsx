import React, {useMemo} from 'react';
import {EventSchedule, EventType} from '../../../types';
import {Div, Text, Tag, Icon} from 'react-native-magnus';
import FastImage from 'react-native-fast-image';
import {tagColorFactory} from '../../../utils/factory/tagColorFactory';
import {FlatList, useWindowDimensions, TouchableHighlight} from 'react-native';
import {dateTimeFormatterFromJSDDate} from '../../../utils/dateTimeFormatterFromJSDate';
import {grayColor, darkFontColor} from '../../../utils/colors';
import {eventCardStyles} from '../../../styles/component/eventCard.style';

type EventCardProps = {
  event: EventSchedule;
  onPress: (event: EventSchedule) => void;
};

const EventCard: React.FC<EventCardProps> = ({event, onPress}) => {
  const windowWidth = useWindowDimensions().width;
  const cardWidth = useMemo(() => {
    return windowWidth * 0.9;
  }, [windowWidth]);
  const startAtText = useMemo(() => {
    return dateTimeFormatterFromJSDDate({
      dateTime: new Date(event.startAt),
      format: 'yyyy/LL/dd HH:mm',
    });
  }, [event.startAt]);
  const endAtText = useMemo(() => {
    return dateTimeFormatterFromJSDDate({
      dateTime: new Date(event.endAt),
      format: 'yyyy/LL/dd HH:mm',
    });
  }, [event.endAt]);
  const defaultImage = () => {
    switch (event.type) {
      case EventType.STUDY_MEETING:
        return require('../../../../assets/study_meeting_1.jpg');
      case EventType.IMPRESSIVE_UNIVERSITY:
        return require('../../../../assets/impressive_university_1.png');
      case EventType.BOLDAY:
        return require('../../../../assets/bolday_1.jpg');
      case EventType.COACH:
        return require('../../../../assets/coach_1.jpeg');
      case EventType.CLUB:
        return require('../../../../assets/club_3.png');
      default:
        return undefined;
    }
  };

  return (
    <TouchableHighlight onPress={() => onPress(event)}>
      <Div
        w={cardWidth}
        h={cardWidth * 0.45}
        bg={grayColor}
        shadow="md"
        py={4}
        justifyContent="space-between"
        flexDir="column">
        <Div px={8} flexDir="row" h={'75%'}>
          {event.type !== EventType.SUBMISSION_ETC ? (
            <Div w="48%" mr={4}>
              <FastImage
                style={eventCardStyles.image}
                resizeMode="contain"
                source={event.imageURL ? {uri: event.imageURL} : defaultImage()}
              />
            </Div>
          ) : (
            <Div w="48%" mr={4} justifyContent="center" alignItems="center">
              <Icon name="filetext1" fontSize={80} />
            </Div>
          )}
          <Div w="50%">
            <Text
              numberOfLines={2}
              fontWeight="bold"
              fontSize={18}
              color={darkFontColor}>
              {event.title}
            </Text>
            <Text numberOfLines={1} color={darkFontColor}>
              {event.description}
            </Text>
            <Text
              numberOfLines={1}
              color={darkFontColor}
              fontWeight="bold">{`開始: ${startAtText}`}</Text>
            <Text
              numberOfLines={1}
              color={darkFontColor}
              fontWeight="bold">{`終了: ${endAtText}`}</Text>
          </Div>
        </Div>
        <Div h={'20%'}>
          <FlatList
            horizontal
            ListEmptyComponent={
              <Tag
                fontSize={'lg'}
                h={28}
                py={0}
                bg={'orange'}
                color="white"
                mr={4}>
                タグなし
              </Tag>
            }
            style={eventCardStyles.tagList}
            data={event.tags || []}
            renderItem={({item: t}) => (
              <Tag
                fontSize={'lg'}
                h={28}
                py={0}
                bg={tagColorFactory(t.type)}
                color="white"
                mr={4}>
                {t.name}
              </Tag>
            )}
          />
        </Div>
      </Div>
    </TouchableHighlight>
  );
};

export default EventCard;
