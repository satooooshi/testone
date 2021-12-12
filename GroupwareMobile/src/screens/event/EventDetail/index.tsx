import React, {useEffect, useMemo, useState} from 'react';
import WholeContainer from '../../../components/WholeContainer';
import {
  FlatList,
  useWindowDimensions,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import HeaderWithTextButton from '../../../components/Header';
import {
  Div,
  Text,
  Button,
  Overlay,
  ScrollDiv,
  Image,
  Modal,
  Icon,
} from 'react-native-magnus';
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
import {useAPIUpdateEvent} from '../../../hooks/api/event/useAPIUpdateEvent';
import {useAPIJoinEvent} from '../../../hooks/api/event/useAPIJoinEvent';
import {useAPICancelEvent} from '../../../hooks/api/event/useAPICancelEvent';
import {AxiosError} from 'axios';
import {useFormik} from 'formik';
import {EventComment, EventType} from '../../../types';
import {useAPICreateComment} from '../../../hooks/api/event/useAPICreateComment';
import EventCommentCard from '../EventCommentCard';
import {createCommentSchema} from '../../../utils/validation/schema';
import {formikErrorMsgFactory} from '../../../utils/factory/formikEroorMsgFactory';
import {useAPIDeleteEvent} from '../../../hooks/api/event/useAPIDeleteEvent';
import {useAuthenticate} from '../../../contexts/useAuthenticate';
import {UserRole} from '../../../types';
import {useNavigation} from '@react-navigation/native';
import tailwind from 'tailwind-rn';
import {getJoiningUsers} from '../../../utils/factory/event/getJoiningUsersFactory';

const EventDetail: React.FC = () => {
  const route = useRoute<EventDetailRouteProps>();
  const {user} = useAuthenticate();
  const navigation = useNavigation();

  const [joiningUserVisiable, setJoiningUserVisiable] = useState(false);

  const {id} = route.params;
  const {
    data: eventInfo,
    refetch: refetchEvents,
    isLoading: isLoadingGetEventDetail,
  } = useAPIGetEventDetail(id);
  const initialValues: Partial<EventComment> = {
    body: '',
  };
  const [screenLoading, setScreenLoading] = useState(false);
  const [visibleEventFormModal, setEventFormModal] = useState(false);
  const [commentVisible, setCommentVisible] = useState(false);
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

  const joiningUsers = useMemo(() => {
    if (!eventInfo?.userJoiningEvent) {
      return;
    }

    return getJoiningUsers(eventInfo?.userJoiningEvent);
  }, [eventInfo?.userJoiningEvent]);

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
  const {mutate: createComment} = useAPICreateComment({
    onSuccess: responseData => {
      if (responseData) {
        Alert.alert('コメントを投稿しました。');
        setValues(t => ({...t, body: ''}));
        setCommentVisible(false);
        refetchEvents();
      }
    },
    onError: err => {
      if (err.response?.data) {
        Alert.alert((err.response?.data as AxiosError)?.message.toString());
      }
    },
  });

  const checkValidateErrors = async () => {
    const errors = await validateForm();
    const messages = formikErrorMsgFactory(errors);
    if (messages) {
      Alert.alert(messages);
    } else {
      onComplete();
    }
  };

  const {
    values,
    setValues,
    handleSubmit: onComplete,
    validateForm,
  } = useFormik<Partial<EventComment>>({
    initialValues: initialValues,
    enableReinitialize: true,
    validationSchema: createCommentSchema,
    onSubmit: v => {
      createComment({
        body: v.body,
        eventSchedule: eventInfo,
      });
    },
  });

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
      'イベントを削除してよろしいですか？',
      '',
      [
        {text: 'キャンセル', style: 'cancel'},
        {
          text: '削除する',
          style: 'destructive',
          onPress: () => deleteEvent({eventId: eventInfo.id}),
        },
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
              <Div flexDir="row" alignItems="flex-end" mb={16}>
                <Text color="tomato" fontSize={16} mr="sm">
                  参加済み
                </Text>
                <Button
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
      />
      <Modal isVisible={joiningUserVisiable}>
        <Text fontSize={16} ml={24} mt={16}>
          参加者一覧 : {joiningUsers?.length}名
        </Text>
        <Button
          bg="gray400"
          h={35}
          w={35}
          position="absolute"
          top={50}
          right={15}
          rounded="circle"
          onPress={() => {
            setJoiningUserVisiable(false);
          }}>
          <Icon color="black900" name="close" />
        </Button>
        <Div my={16} mx={12}>
          <ScrollDiv>
            <Div
              flexDir="row"
              justifyContent="space-between"
              alignItems="center"
              flexWrap="wrap">
              {joiningUsers?.map(u => {
                return (
                  <Div
                    bg="white"
                    flexDir="row"
                    flexWrap="wrap"
                    rounded="sm"
                    alignItems="center"
                    w="45%"
                    borderWidth={1}
                    borderColor="gray400"
                    mx={8}
                    my={4}>
                    <Div pl={16} alignItems="center" flex={2}>
                      <Image
                        my={'lg'}
                        h={windowWidth * 0.09}
                        w={windowWidth * 0.09}
                        source={
                          u.avatarUrl
                            ? {uri: u.avatarUrl}
                            : require('../../../../assets/no-image-avatar.png')
                        }
                        rounded="circle"
                      />
                    </Div>
                    <Div alignItems="center" flex={5}>
                      <Text>{u.lastName + ' ' + u.firstName}</Text>
                    </Div>
                  </Div>
                );
              })}
            </Div>
          </ScrollDiv>
        </Div>
      </Modal>
      <ScrollDiv>
        {eventInfo && (
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
            <Div m={16}>
              {joiningUsers && (
                <>
                  <Div
                    borderBottomWidth={1}
                    borderColor="green400"
                    flexDir="row"
                    justifyContent="space-between"
                    alignItems="flex-end"
                    mb="lg"
                    pb="md">
                    <Text>
                      参加者:
                      {joiningUsers.length || 0}名
                    </Text>
                  </Div>
                  <Div
                    flexDir="row"
                    justifyContent="space-between"
                    alignItems="center"
                    flexWrap="wrap">
                    {joiningUsers.map((u, index) => {
                      if (index > 6) {
                        return;
                      } else if (index === 6) {
                        return (
                          <Div
                            flexDir="row"
                            alignItems="center"
                            rounded="sm"
                            w="45%"
                            mx={8}
                            my={4}>
                            <Button
                              block
                              m={10}
                              fontSize={12}
                              onPress={() => setJoiningUserVisiable(true)}>
                              参加者を一覧表示
                            </Button>
                          </Div>
                        );
                      } else {
                        return (
                          <Div
                            bg="white"
                            flexDir="row"
                            alignItems="center"
                            rounded="sm"
                            w="45%"
                            borderWidth={1}
                            borderColor="gray400"
                            mx={8}
                            my={4}>
                            <Image
                              my={'lg'}
                              mx={16}
                              h={windowWidth * 0.09}
                              w={windowWidth * 0.09}
                              source={
                                u.avatarUrl
                                  ? {uri: u.avatarUrl}
                                  : require('../../../../assets/no-image-avatar.png')
                              }
                              rounded="circle"
                            />
                            <Text>{u.lastName + ' ' + u.firstName}</Text>
                          </Div>
                        );
                      }
                    })}
                  </Div>
                </>
              )}
            </Div>
            {eventInfo.type !== EventType.SUBMISSION_ETC && (
              <Div mx={16}>
                <Div
                  borderBottomWidth={1}
                  borderColor="green400"
                  flexDir="row"
                  justifyContent="space-between"
                  alignItems="flex-end"
                  mb="lg"
                  pb="md">
                  <Text>
                    コメント:
                    {eventInfo?.comments.length || 0}件
                  </Text>
                  <Button
                    fontSize={12}
                    py={4}
                    color="white"
                    onPress={() => {
                      commentVisible
                        ? checkValidateErrors()
                        : setCommentVisible(true);
                    }}>
                    {commentVisible ? 'コメントを投稿する' : 'コメントを追加'}
                  </Button>
                </Div>
                {commentVisible && (
                  <TextInput
                    value={values.body}
                    onChangeText={t => setValues({...values, body: t})}
                    placeholder="コメントを記入してください。"
                    textAlignVertical={'top'}
                    multiline={true}
                    autoCapitalize="none"
                    style={tailwind(
                      'border border-green-400 mb-4 bg-white rounded border-blue-500 p-2 h-24',
                    )}
                  />
                )}
                {eventInfo?.comments && eventInfo?.comments.length
                  ? eventInfo?.comments.map(
                      comment =>
                        comment.writer && (
                          <EventCommentCard
                            key={comment.id}
                            body={comment.body}
                            date={comment.createdAt}
                            writer={comment.writer}
                          />
                        ),
                    )
                  : null}
              </Div>
            )}
          </Div>
        )}
      </ScrollDiv>
    </WholeContainer>
  );
};

export default EventDetail;
