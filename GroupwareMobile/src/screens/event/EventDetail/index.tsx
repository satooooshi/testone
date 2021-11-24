import React, {useEffect, useMemo, useState} from 'react';
import WholeContainer from '../../../components/WholeContainer';
import {FlatList, useWindowDimensions, ActivityIndicator} from 'react-native';
import HeaderWithTextButton from '../../../components/Header';
import {Div, Text, Button, Overlay, ScrollDiv} from 'react-native-magnus';
import FastImage from 'react-native-fast-image';
import {eventDetailStyles} from '../../../styles/screen/event/eventDetail.style';
import {useAPIGetEventDetail} from '../../../hooks/api/event/useAPIGetEventDetail';
import eventTypeNameFactory from '../../../utils/factory/eventTypeNameFactory';
import {eventTypeColorFactory} from '../../../utils/factory/eventTypeColorFactory';
import {dateTimeFormatterFromJSDDate} from '../../../utils/dateTimeFormatterFromJSDate';
import {darkFontColor} from '../../../utils/colors';
import {userNameFactory} from '../../../utils/factory/userNameFactory';
import {tagColorFactory} from '../../../utils/factory/tagColorFactory';
import YoutubePlayer from 'react-native-youtube-iframe';
import generateYoutubeId from '../../../utils/generateYoutubeId';
import {useRoute} from '@react-navigation/native';
import {EventDetailRouteProps} from '../../../types/navigator/drawerScreenProps';

const EventDetail: React.FC = () => {
  const route = useRoute<EventDetailRouteProps>();
  const {id} = route.params;

  const {data: eventInfo, isLoading: isLoadingGetEventDetail} =
    useAPIGetEventDetail(id);
  const [screenLoading, setScreenLoading] = useState(false);
  const windowWidth = useWindowDimensions().width;
  const startAtText = useMemo(() => {
    if (!eventInfo) {
      return '';
    }
    return dateTimeFormatterFromJSDDate({
      dateTime: new Date(eventInfo.startAt),
      format: 'yyyy/LL/dd HH:mm',
    });
  }, [eventInfo]);
  const endAtText = useMemo(() => {
    if (!eventInfo) {
      return '';
    }
    return dateTimeFormatterFromJSDDate({
      dateTime: new Date(eventInfo.endAt),
      format: 'yyyy/LL/dd HH:mm',
    });
  }, [eventInfo]);

  const AboveYoutubeVideos = () => {
    if (!eventInfo) {
      return <></>;
    }
    return (
      <>
        <FastImage
          style={{
            ...eventDetailStyles.image,
            width: windowWidth,
            minHeight: windowWidth * 0.8,
          }}
          resizeMode="cover"
          source={
            eventInfo.imageURL
              ? {uri: eventInfo.imageURL}
              : require('../../../../assets/study_meeting_1.jpg')
          }
        />
        <Div mx={16}>
          <Text mb={16} fontSize={24} color={darkFontColor} fontWeight="900">
            {eventInfo.title}
          </Text>
          <Button
            mb={16}
            bg={eventTypeColorFactory(eventInfo.type)}
            color="white">
            {eventTypeNameFactory(eventInfo.type)}
          </Button>
          <Text
            mb={8}
            fontSize={16}
            fontWeight="bold">{`開始: ${startAtText}`}</Text>
          <Text
            mb={16}
            fontSize={16}
            fontWeight="bold">{`終了: ${endAtText}`}</Text>
          <Text mb={8}>概要</Text>
          <Text mb={16} color={darkFontColor} fontWeight="bold" fontSize={18}>
            {eventInfo.description}
          </Text>
          <Text mb={8}>開催者/講師</Text>
          <FlatList
            horizontal
            data={eventInfo.hostUsers}
            renderItem={({item: u}) => (
              <Button
                fontSize={'xs'}
                h={28}
                py={0}
                bg="purple"
                color="white"
                mr={4}>
                {userNameFactory(u)}
              </Button>
            )}
          />
          <Text mb={8}>タグ</Text>
          <FlatList
            horizontal
            data={eventInfo.tags}
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
          <Text mb={8}>参考資料</Text>
          {/* TODO list files */}
          <Text mb={8}>関連動画</Text>
        </Div>
      </>
    );
  };

  useEffect(() => {
    if (isLoadingGetEventDetail) {
      setScreenLoading(true);
      return;
    }
    setScreenLoading(false);
  }, [isLoadingGetEventDetail]);

  return (
    <WholeContainer>
      <HeaderWithTextButton
        enableBackButton={true}
        title="イベント詳細"
        activeTabName="一覧に戻る"
      />
      <Overlay visible={screenLoading} p="xl">
        <ActivityIndicator />
      </Overlay>
      <ScrollDiv>
        {eventInfo ? (
          <Div flexDir="column">
            {eventInfo.videos.length ? (
              eventInfo.videos.map(v => (
                <YoutubePlayer
                  height={300}
                  videoId={generateYoutubeId(v.url || '')}
                />
              ))
            ) : (
              <>
                <AboveYoutubeVideos />
                <Text mx={16}>関連動画はありません</Text>
              </>
            )}
          </Div>
        ) : null}
      </ScrollDiv>
    </WholeContainer>
  );
};

export default EventDetail;
