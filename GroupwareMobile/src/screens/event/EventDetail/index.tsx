import React, {useEffect, useMemo, useState} from 'react';
import WholeContainer from '../../../components/WholeContainer';
import {
  FlatList,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
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
import EventFormModal from '../../../components/events/EventFormModal';
import {useAPIGetTag} from '../../../hooks/api/tag/useAPIGetTag';
import {useAPIGetUsers} from '../../../hooks/api/user/useAPIGetUsers';
import {useAPIUpdateEvent} from '../../../hooks/api/event/useAPIUpdateEvent';
import {useAPIJoinEvent} from '../../../hooks/api/event/useAPIJoinEvent';
import {useAPICancelEvent} from '../../../hooks/api/event/useAPICancelEvent';
import {AxiosError} from 'axios';
import {useAPIDeleteEvent} from '../../../hooks/api/event/useAPIDeleteEvent';
import {useAuthenticate} from '../../../contexts/useAuthenticate';
import {UserRole} from '../../../types';
import {useNavigation} from '@react-navigation/native';

const EventDetail: React.FC = () => {
  const route = useRoute<EventDetailRouteProps>();
  const {user} = useAuthenticate();
  const navigation = useNavigation();

  const {id} = route.params;
  const {data: tags} = useAPIGetTag();
  const {data: users} = useAPIGetUsers();
  const {
    data: eventInfo,
    refetch: refetchEvents,
    isLoading: isLoadingGetEventDetail,
  } = useAPIGetEventDetail(id);
  const [screenLoading, setScreenLoading] = useState(false);
  const [visibleEventFormModal, setEventFormModal] = useState(false);
  const {mutate: saveEvent, isLoading: isLoadingSaveEvent} = useAPIUpdateEvent({
    onSuccess: () => {
      setEventFormModal(false);
      refetchEvents();
    },
  });
  const {mutate: joinEvent} = useAPIJoinEvent({
    onSuccess: () => refetchEvents(),
    onError: err => {
      if (err.response?.data) {
        Alert.alert((err.response?.data as AxiosError)?.message);
      }
    },
  });
  const {mutate: cancelEvent} = useAPICancelEvent({
    onSuccess: () => refetchEvents(),
  });
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

  const {mutate: deleteEvent} = useAPIDeleteEvent({
    onSuccess: () => {
      Alert.alert('削除が完了しました。');
      navigation.goBack();
    },
    onError: err => {
      if (err.response?.data) {
        Alert.alert((err.response?.data as AxiosError)?.message);
      }
    },
  });

  const onDeleteButtonlicked = () => {
    if (!eventInfo) {
      return;
    }
    Alert.alert(
      '確認',
      'イベントの削除をしますか？',
      [
        {
          text: '削除する',
          onPress: () => deleteEvent({eventId: eventInfo.id}),
        },
        {text: 'キャンセル'},
      ],
      {cancelable: false},
    );
  };

  const isFinished = eventInfo?.endAt
    ? new Date(eventInfo.endAt) <= new Date()
    : false;

  const AboveYoutubeVideos = () => {
    if (!eventInfo) {
      return <></>;
    }
    return (
      <>
        <Div>
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
          <Button
            mb={16}
            bg={eventTypeColorFactory(eventInfo.type)}
            position="absolute"
            bottom={0}
            right={10}
            color="white">
            {eventTypeNameFactory(eventInfo.type)}
          </Button>
          {user?.role === UserRole.ADMIN && (
            <Button
              mt={16}
              bg="red"
              position="absolute"
              top={0}
              right={10}
              onPress={() => onDeleteButtonlicked()}
              color="white">
              イベントを削除する
            </Button>
          )}
        </Div>
        <Div mx={16}>
          <Text mb={16} fontSize={24} color={darkFontColor} fontWeight="900">
            {eventInfo.title}
          </Text>
          <Div alignSelf="flex-end">
            {eventInfo.type !== 'submission_etc' &&
            !isFinished &&
            !eventInfo.isCanceled &&
            !eventInfo.isJoining ? (
              <Button
                mb={16}
                bg={'pink600'}
                color="white"
                onPress={() => joinEvent({eventID: Number(id)})}>
                イベントに参加
              </Button>
            ) : eventInfo.type !== 'submission_etc' &&
              !isFinished &&
              !eventInfo.isCanceled &&
              eventInfo.isJoining ? (
              <Div flexDir="row">
                <Button
                  mb={16}
                  bg={'pink600'}
                  color="white"
                  alignSelf="flex-end">
                  参加済み
                </Button>
                <Button
                  mb={16}
                  bg={'pink600'}
                  color="white"
                  onPress={() => cancelEvent({eventID: Number(id)})}
                  alignSelf="flex-end">
                  キャンセルする
                </Button>
              </Div>
            ) : eventInfo.type !== 'submission_etc' &&
              !isFinished &&
              eventInfo.isCanceled &&
              eventInfo.isJoining ? (
              <Text color="tomato" fontSize={16}>
                キャンセル済み
              </Text>
            ) : isFinished ? (
              <Text color="tomato" fontSize={16}>
                締切済み
              </Text>
            ) : null}
          </Div>
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
    if (isLoadingGetEventDetail || isLoadingSaveEvent) {
      setScreenLoading(true);
      return;
    }
    setScreenLoading(false);
  }, [isLoadingGetEventDetail, isLoadingSaveEvent]);

  return (
    <WholeContainer>
      <HeaderWithTextButton
        enableBackButton={true}
        title="イベント詳細"
        activeTabName="一覧に戻る"
        rightButtonName="イベント編集"
        onPressRightButton={() => setEventFormModal(true)}
      />
      <Overlay visible={screenLoading} p="xl">
        <ActivityIndicator />
      </Overlay>
      <EventFormModal
        event={eventInfo}
        isVisible={visibleEventFormModal}
        onCloseModal={() => setEventFormModal(false)}
        onSubmit={event => saveEvent({...event, id: eventInfo?.id})}
        users={users || []}
        tags={tags || []}
      />
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
