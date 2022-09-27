import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import React, {useEffect, useMemo} from 'react';
import FastImage, {Source} from 'react-native-fast-image';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Div, Text} from 'react-native-magnus';
import {ActivityIndicator} from 'react-native-paper';
import EventCard from '../../../components/events/EventCard';
import HeaderWithTextButton from '../../../components/Header';
import WholeContainer from '../../../components/WholeContainer';
import {useAPIGetEventIntroduction} from '../../../hooks/api/event/useAPIGetEventIntroduction';
import {useAPIGetLatestEvent} from '../../../hooks/api/event/useAPIGetLatestEvent';
import {EventType} from '../../../types';
import {
  EventIntroductionNavigationProps,
  EventIntroductionRouteProps,
} from '../../../types/navigator/drawerScreenProps';
import eventTypeNameFactory from '../../../utils/factory/eventTypeNameFactory';
import {RootStackParamList} from '../../../types/navigator/RootStackParamList';

const EventIntroduction: React.FC = () => {
  const {type} = useRoute<EventIntroductionRouteProps>().params;
  const isFocused = useIsFocused();
  const {
    data: recommendedEvents,
    isLoading,
    refetch: refetchLatestEvent,
  } = useAPIGetLatestEvent({
    type,
  });
  const {data: eventIntroduction, refetch} = useAPIGetEventIntroduction(type);
  const route = useRoute();
  const navigation = useNavigation<EventIntroductionNavigationProps>();
  const headlineImage: Source = useMemo(() => {
    switch (type) {
      case EventType.IMPRESSIVE_UNIVERSITY:
        return {
          uri: 'https://www.bold.ne.jp/assets/assets_recruit/images/enviroment/img_balday_main.png',
        };
      case EventType.STUDY_MEETING:
        return {
          uri: 'https://www.bold.ne.jp/assets/assets_recruit/images/enviroment/img_studygroup_main.png',
        };
      case EventType.COACH:
        return require('../../../../assets/coach_1.jpeg');
      case EventType.CLUB:
        return require('../../../../assets/club_5.jpg');
      case EventType.BOLDAY:
        return {
          uri: 'https://www.bold.ne.jp/assets/assets_recruit/images/enviroment/img_balday_main.png',
        };
      default:
        return {};
    }
  }, [type]);

  useEffect(() => {
    if (isFocused) {
      refetchLatestEvent();
    }
  }, [isFocused, refetchLatestEvent]);

  const bottomSources: Source[] = useMemo(() => {
    switch (type) {
      case EventType.IMPRESSIVE_UNIVERSITY:
        return [
          require('../../../../assets/impressive_university_1.png'),
          require('../../../../assets/impressive_university_2.jpg'),
        ];
      case EventType.STUDY_MEETING:
        return [
          require('../../../../assets/study_meeting_1.jpg'),
          require('../../../../assets/study_meeting_2.jpg'),
        ];
      case EventType.CLUB:
        return [
          require('../../../../assets/club_3.png'),
          require('../../../../assets/club_4.jpg'),
          require('../../../../assets/club_6.jpg'),
          require('../../../../assets/club_2.jpg'),
        ];
      case EventType.BOLDAY:
        return [
          require('../../../../assets/bolday_1.jpg'),
          require('../../../../assets/bolday_2.jpg'),
          require('../../../../assets/bolday_4.jpg'),
          require('../../../../assets/bolday_3.jpg'),
        ];
      default:
        return [];
    }
  }, [type]);

  return (
    <WholeContainer>
      <HeaderWithTextButton
        title={eventTypeNameFactory(type)}
        enableBackButton={true}
        rightButtonName="予定を見る"
        screenForBack={'Menu'}
        onPressRightButton={() =>
          navigation.navigate('EventStack', {
            screen: 'EventList',
            params: {type},
          })
        }
      />
      <KeyboardAwareScrollView>
        <Div justifyContent="center" alignItems="center">
          <Text color="blue500">culture</Text>
          <Text fontWeight="bold" fontSize={22}>
            {eventTypeNameFactory(type)}
          </Text>
          <FastImage
            source={headlineImage}
            style={{height: 300, width: 400, marginBottom: 24}}
          />

          <Div mb={16}>
            {isLoading ? (
              <ActivityIndicator />
            ) : !isLoading && recommendedEvents?.length ? (
              <>
                <Text textAlign="center" fontSize={16} mb={8}>
                  直近一週間のおすすめイベント
                </Text>
                {recommendedEvents.map(e => (
                  <Div mb={8} key={e.id}>
                    <EventCard event={e} />
                  </Div>
                ))}
              </>
            ) : (
              <Text>直近一週間にイベントはありません</Text>
            )}
          </Div>

          {eventIntroduction?.title && (
            <Text
              fontSize={22}
              fontWeight="bold"
              textAlign="center"
              w="80%"
              mb={8}>
              {eventIntroduction?.title}
            </Text>
          )}
          {eventIntroduction?.description && (
            <Text fontSize={16} w="80%" textAlign="center" mb={16}>
              {eventIntroduction?.title}
            </Text>
          )}
          {bottomSources.map((s, index) => (
            <FastImage
              key={index}
              source={s}
              style={{width: 400, height: 300, marginBottom: 8}}
            />
          ))}
        </Div>
      </KeyboardAwareScrollView>
    </WholeContainer>
  );
};

export default EventIntroduction;
