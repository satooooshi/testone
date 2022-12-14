import React, {useMemo} from 'react';
import {EventSchedule, EventType, Tag} from '../../../types';
import {Div, Text, Tag as TagButton, Icon, Image} from 'react-native-magnus';
import {FlatList, useWindowDimensions, TouchableHighlight} from 'react-native';
import {dateTimeFormatterFromJSDDate} from '../../../utils/dateTimeFormatterFromJSDate';
import {darkFontColor} from '../../../utils/colors';
import {eventCardStyles} from '../../../styles/component/eventCard.style';
import {useNavigation} from '@react-navigation/native';
import {tagBgColorFactory} from '../../../utils/factory/tagBgColorFactory';
import {tagFontColorFactory} from '../../../utils/factory/tagFontColorFactory';

type EventCardProps = {
  event: EventSchedule;
};

const EventCard: React.FC<EventCardProps> = ({event}) => {
  const windowWidth = useWindowDimensions().width;
  const navigation = useNavigation<any>();
  const routes = navigation.getState()?.routes;
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
      case EventType.OTHER:
        return require('../../../../assets/no-image.jpg');
      default:
        return undefined;
    }
  };

  const onPressTagButton = (tag: Tag) => {
    navigation.navigate('EventStack', {
      screen: 'EventList',
      params: {tag: tag.id.toString()},
    });
  };

  return (
    <TouchableHighlight
      onPress={() =>
        navigation.navigate('EventStack', {
          screen: 'EventDetail',
          params: {
            id: event.id,
            previousScreenName: routes[routes?.length - 1],
          },
          initial: false,
        })
      }>
      <Div
        w={cardWidth}
        h={cardWidth * 0.5}
        minH={cardWidth * 0.5}
        maxH={cardWidth * 0.6}
        bg="white"
        rounded={10}
        flexDir="row">
        <Div
          borderRightWidth={1}
          w="40%"
          justifyContent="center"
          alignItems="center">
          {event.type !== EventType.SUBMISSION_ETC ? (
            <Image
              roundedLeft={10}
              // style={eventCardStyles.image}
              // resizeMode="contain"
              w="100%"
              h="100%"
              // minH={cardWidth * 0.5}
              // maxH={cardWidth * 0.6}
              source={event.imageURL ? {uri: event.imageURL} : defaultImage()}
            />
          ) : (
            <Icon name="filetext1" fontSize={80} />
          )}
        </Div>
        <Div px={8} flexDir="column" w="60%" py="md">
          {event.tags?.length ? (
            <Div mt={3}>
              <FlatList
                horizontal
                style={eventCardStyles.tagList}
                data={event.tags || []}
                renderItem={({item: t}) => (
                  <TagButton
                    fontSize={'md'}
                    h={20}
                    py={0}
                    onPress={() => onPressTagButton(t)}
                    bg={tagBgColorFactory(t.type)}
                    color={tagFontColorFactory(t.type)}
                    mr={4}>
                    {t.name}
                  </TagButton>
                )}
              />
            </Div>
          ) : null}
          <Text
            mt={5}
            numberOfLines={2}
            fontWeight="bold"
            fontSize={event.title.length > 12 ? 14 : 16}>
            {event.title}
          </Text>
          <Div minH={50} mt={5}>
            <Text numberOfLines={3}>{event.description}</Text>
          </Div>
          <Div mt="auto" mb={5} borderTopWidth={1} borderColor="gray300">
            <Text
              mt={5}
              numberOfLines={1}
              fontSize={11}
              color={darkFontColor}
              fontWeight="bold">{`??????: ${startAtText}`}</Text>
            <Text
              numberOfLines={1}
              fontSize={11}
              color={darkFontColor}
              fontWeight="bold">{`??????: ${endAtText}`}</Text>
          </Div>
        </Div>
      </Div>
    </TouchableHighlight>
  );
};

export default EventCard;
