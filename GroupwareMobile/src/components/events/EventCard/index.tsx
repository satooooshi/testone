import React, {useMemo} from 'react';
import {EventSchedule} from '../../../types';
import {Div, Button, Text} from 'react-native-magnus';
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

  return (
    <TouchableHighlight onPress={() => onPress(event)}>
      <Div
        w={cardWidth}
        h={cardWidth * 0.5}
        bg={grayColor}
        shadow="md"
        py={8}
        justifyContent="space-between"
        flexDir="column">
        <Div px={8} flexDir="row" h={'70%'}>
          <Div w="50%">
            <FastImage
              style={eventCardStyles.image}
              resizeMode="contain"
              source={
                event.imageURL
                  ? {uri: event.imageURL}
                  : require('../../../../assets/study_meeting_1.jpg')
              }
            />
          </Div>
          <Div w="40%">
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
        <FlatList
          horizontal
          style={eventCardStyles.tagList}
          data={event.tags || []}
          renderItem={({item: t}) => (
            <Button
              fontSize={'xs'}
              h={28}
              py={0}
              bg={tagColorFactory(t.type)}
              color="white"
              mr={4}>
              {t.name}
            </Button>
          )}
        />
      </Div>
    </TouchableHighlight>
  );
};

export default EventCard;
