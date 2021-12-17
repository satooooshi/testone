import React, {useEffect, useMemo, useRef, useState} from 'react';
import WholeContainer from '../../../components/WholeContainer';
import {
  FlatList,
  useWindowDimensions,
  ActivityIndicator,
  TextInput,
  Alert,
  TouchableOpacity,
} from 'react-native';
import HeaderWithTextButton from '../../../components/Header';
import {
  Div,
  Text,
  Button,
  Overlay,
  ScrollDiv,
  Image,
  Icon,
  Select,
  SelectRef,
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
import {
  EventComment,
  EventType,
  SubmissionFile,
  UserJoiningEvent,
} from '../../../types';
import {useAPICreateComment} from '../../../hooks/api/event/useAPICreateComment';
import EventCommentCard from '../EventCommentCard';
import {createCommentSchema} from '../../../utils/validation/schema';
import {formikErrorMsgFactory} from '../../../utils/factory/formikEroorMsgFactory';
import {useAPIDeleteEvent} from '../../../hooks/api/event/useAPIDeleteEvent';
import {useAuthenticate} from '../../../contexts/useAuthenticate';
import {UserRole} from '../../../types';
import {useNavigation} from '@react-navigation/native';
import tailwind from 'tailwind-rn';
import {useAPISaveUserJoiningEvent} from '../../../hooks/api/event/useAPISaveUserJoiningEvent';
import DocumentPicker from 'react-native-document-picker';
import {useAPIUploadStorage} from '../../../hooks/api/storage/useAPIUploadStorage';
import {useAPISaveSubmission} from '../../../hooks/api/event/useAPISaveSubmission';
import FileIcon from '../../../components/common/FileIcon';
import ShareButton from '../../../components/common/ShareButton';
import {generateClientURL} from '../../../utils/url';
import {Tab} from '../../../components/Header/HeaderTemplate';

const EventDetail: React.FC = () => {
  const route = useRoute<EventDetailRouteProps>();
  const {user} = useAuthenticate();
  const navigation = useNavigation();

  const [joiningUserVisiable, setJoiningUserVisiable] =
    useState<boolean>(false);
  const [
    lateRecordTargetUserJoiningEvent,
    setLateRecordTargetUserJoiningEvent,
  ] = useState<UserJoiningEvent>();
  const lateRecorderRef = useRef<SelectRef>(null);
  const lateRecorderInOverLayRef = useRef<SelectRef>(null);
  const {id} = route.params;
  const {
    data: eventInfo,
    refetch: refetchEvents,
    isLoading: isLoadingGetEventDetail,
  } = useAPIGetEventDetail(id);
  const initialValues: Partial<EventComment> = {
    body: '',
  };
  const {mutate: handleChangeJoiningData} = useAPISaveUserJoiningEvent({
    onSuccess: () => {
      refetchEvents();
      Alert.alert('遅刻を記録しました。');
    },
  });
  const [screenLoading, setScreenLoading] = useState(false);
  const [visibleEventFormModal, setEventFormModal] = useState(false);
  const [commentVisible, setCommentVisible] = useState(false);
  const {mutate: saveEvent, isLoading: isLoadingSaveEvent} = useAPIUpdateEvent({
    onSuccess: () => {
      setEventFormModal(false);
      refetchEvents();
    },
  });
  const [unsavedSubmissions, setUnsavedSubmissions] = useState<
    Partial<SubmissionFile>[]
  >([]);
  const {mutate: saveSubmission} = useAPISaveSubmission({
    onSuccess: () => {
      setUnsavedSubmissions([]);
      Alert.alert('提出状況を保存しました');
      refetchEvents();
    },
    onError: err => {
      if (err.response?.data) {
        Alert.alert((err.response?.data as AxiosError)?.message);
      }
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

  const userJoiningEvents = useMemo(() => {
    if (!eventInfo?.userJoiningEvent) {
      return;
    }
    return eventInfo?.userJoiningEvent.filter(uje => !uje.canceledAt);
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
  const {mutate: uploadFile} = useAPIUploadStorage();

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

  const tabs: Tab[] = [
    {
      name: 'イベントを削除',
      onPress: onDeleteButtonlicked,
      color: 'red',
    },
  ];

  const isFinished = eventInfo?.endAt
    ? new Date(eventInfo.endAt) <= new Date()
    : false;

  const handleUploadSubmission = async () => {
    const res = await DocumentPicker.pickSingle({
      type: [DocumentPicker.types.allFiles],
    });
    const formData = new FormData();
    formData.append('files', {
      name: res.name,
      uri: res.uri,
      type: res.type,
    });
    uploadFile(formData);
    if (formData) {
      uploadFile(formData, {
        onSuccess: fileURL => {
          const unSavedFiles: Partial<SubmissionFile>[] = fileURL.map(f => ({
            url: f,
            eventSchedule: eventInfo,
            userSubmitted: user,
          }));
          setUnsavedSubmissions(f => [...f, ...unSavedFiles]);
        },
      });
    }
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
        tabs={tabs}
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
      <Overlay
        w="90%"
        visible={joiningUserVisiable}
        onBackdropPress={() => setJoiningUserVisiable(false)}>
        <Text fontSize={14} ml={24} mt={16}>
          参加者一覧 : {userJoiningEvents?.length}名
          {user?.role === UserRole.ADMIN && '(タップで遅刻を記録)'}
        </Text>
        <Button
          bg="gray400"
          h={35}
          w={35}
          position="absolute"
          top={15}
          right={15}
          rounded="circle"
          onPress={() => {
            setJoiningUserVisiable(false);
          }}>
          <Icon color="black900" name="close" />
        </Button>
        <Div my={16} mx={24}>
          <ScrollDiv>
            <Div
              flexDir="row"
              justifyContent="space-between"
              alignItems="center"
              flexWrap="wrap">
              {userJoiningEvents?.map(uje => {
                return (
                  <TouchableOpacity
                    key={uje.id}
                    style={tailwind(
                      'bg-white flex-row flex-wrap rounded items-center border border-gray-400 mx-2 my-1',
                    )}
                    onPress={() => {
                      if (
                        user?.role === UserRole.ADMIN &&
                        lateRecorderInOverLayRef.current
                      ) {
                        setLateRecordTargetUserJoiningEvent(uje);
                        lateRecorderInOverLayRef.current.open();
                      }
                    }}>
                    <Div pl={16} alignItems="center" flex={1}>
                      <Image
                        my={'lg'}
                        h={windowWidth * 0.09}
                        w={windowWidth * 0.09}
                        source={
                          uje.user.avatarUrl
                            ? {uri: uje.user.avatarUrl}
                            : require('../../../../assets/no-image-avatar.png')
                        }
                        rounded="circle"
                      />
                    </Div>
                    <Div alignItems="center" flex={4}>
                      <Text numberOfLines={1}>{userNameFactory(uje.user)}</Text>
                      {user?.role === UserRole.ADMIN &&
                        uje.lateMinutes !== 0 && (
                          <Text color="red">{uje.lateMinutes}分遅刻</Text>
                        )}
                    </Div>
                  </TouchableOpacity>
                );
              })}
            </Div>
          </ScrollDiv>
        </Div>
        <Select
          onSelect={v => {
            if (lateRecordTargetUserJoiningEvent) {
              handleChangeJoiningData({
                ...lateRecordTargetUserJoiningEvent,
                lateMinutes: v,
              });
            }
          }}
          ref={lateRecorderInOverLayRef}
          value={lateRecordTargetUserJoiningEvent?.lateMinutes}
          title={
            userNameFactory(lateRecordTargetUserJoiningEvent?.user) +
            'さんの遅刻を記録'
          }
          message="遅刻時間を選択してください。"
          roundedTop="xl"
          style={tailwind('z-50')}
          data={[15, 30, 45, 60, 90, 120]}
          renderItem={item => (
            <Select.Option value={item} py="md" px="xl">
              <Text>{item}分遅刻</Text>
            </Select.Option>
          )}
        />
      </Overlay>
      <Select
        onSelect={v => {
          if (lateRecordTargetUserJoiningEvent) {
            handleChangeJoiningData({
              ...lateRecordTargetUserJoiningEvent,
              lateMinutes: v,
            });
          }
        }}
        ref={lateRecorderRef}
        value={lateRecordTargetUserJoiningEvent?.lateMinutes}
        title={
          userNameFactory(lateRecordTargetUserJoiningEvent?.user) +
          'さんの遅刻を記録'
        }
        message="遅刻時間を選択してください。"
        roundedTop="xl"
        style={tailwind('z-50')}
        data={[15, 30, 45, 60, 90, 120]}
        renderItem={item => (
          <Select.Option value={item} py="md" px="xl">
            <Text>{item}分遅刻</Text>
          </Select.Option>
        )}
      />
      <ScrollDiv>
        {eventInfo && (
          <Div flexDir="column">
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
            </Div>
            <Div mx={16}>
              <Div flexDir="row" justifyContent="space-between" mb={8}>
                <Text
                  fontSize={22}
                  color={darkFontColor}
                  w={windowWidth * 0.65}
                  fontWeight="900">
                  {eventInfo.title}
                </Text>
                <ShareButton
                  text={eventInfo.title}
                  urlPath={generateClientURL(`/event/${eventInfo.id}`)}
                />
              </Div>
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
              <Div mb={8}>
                <Text>概要</Text>
                <Text
                  mb={16}
                  color={darkFontColor}
                  fontWeight="bold"
                  fontSize={18}>
                  {eventInfo.description}
                </Text>
              </Div>
              <Div mb={8}>
                <Text>開催者/講師</Text>
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
              </Div>
              <Div mb={8}>
                <Text>タグ</Text>
                <FlatList
                  horizontal
                  data={eventInfo.tags}
                  keyExtractor={item => item.id.toString()}
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

              <Text>
                {eventInfo?.files?.length ? '参考資料' : '参考資料はありません'}
              </Text>
              <Div flexDir="row" flexWrap="wrap">
                {eventInfo?.files?.map(
                  f =>
                    f.url && (
                      <Div mr={4} mb={4}>
                        <FileIcon url={f.url} />
                      </Div>
                    ),
                )}
              </Div>
              <Text>
                {eventInfo?.files?.length ? '関連動画' : '関連動画はありません'}
              </Text>
              {eventInfo.videos.length
                ? eventInfo.videos.map(v => (
                    <YoutubePlayer
                      key={v.id}
                      height={240}
                      videoId={generateYoutubeId(v.url || '')}
                    />
                  ))
                : null}
            </Div>
            {eventInfo.type !== EventType.SUBMISSION_ETC ? (
              <Div m={16}>
                {userJoiningEvents && (
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
                        {userJoiningEvents.length || 0}名
                        {user?.role === UserRole.ADMIN &&
                          '(タップで遅刻を記録)'}
                      </Text>
                    </Div>
                    <Div
                      flexDir="row"
                      justifyContent="space-between"
                      alignItems="center"
                      flexWrap="wrap">
                      {userJoiningEvents.map((uje, index) => {
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
                            <TouchableOpacity
                              style={tailwind(
                                'bg-white flex-row flex-wrap rounded items-center w-40 border border-gray-400 mx-2 my-1',
                              )}
                              onPress={() => {
                                if (
                                  user?.role === UserRole.ADMIN &&
                                  lateRecorderRef.current
                                ) {
                                  setLateRecordTargetUserJoiningEvent(uje);
                                  lateRecorderRef.current.open();
                                }
                              }}>
                              <Div pl={16} alignItems="center" flex={1}>
                                <Image
                                  my={'lg'}
                                  h={windowWidth * 0.09}
                                  w={windowWidth * 0.09}
                                  source={
                                    uje.user.avatarUrl
                                      ? {uri: uje.user.avatarUrl}
                                      : require('../../../../assets/no-image-avatar.png')
                                  }
                                  rounded="circle"
                                />
                              </Div>
                              <Div alignItems="center" flex={4}>
                                <Text numberOfLines={1}>
                                  {userNameFactory(uje.user)}
                                </Text>
                                {user?.role === UserRole.ADMIN &&
                                  uje.lateMinutes !== 0 && (
                                    <Text color="red">
                                      {uje.lateMinutes}分遅刻
                                    </Text>
                                  )}
                              </Div>
                            </TouchableOpacity>
                          );
                        }
                      })}
                    </Div>
                  </>
                )}

                <Div
                  borderBottomWidth={1}
                  borderColor="green400"
                  flexDir="row"
                  justifyContent="space-between"
                  alignItems="flex-end"
                  mb="lg"
                  pb="md"
                  mt={16}>
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
            ) : (
              <>
                <Div
                  m={16}
                  borderBottomWidth={1}
                  borderColor="green400"
                  mb="lg"
                  pb="md">
                  <Div
                    flexDir="row"
                    justifyContent="space-between"
                    alignItems="flex-end">
                    <Div>
                      <Button
                        bg="blue600"
                        color="white"
                        h={40}
                        rounded="lg"
                        onPress={() => handleUploadSubmission()}>
                        提出物を追加
                      </Button>
                      <Text fontWeight="bold">{`${eventInfo?.submissionFiles?.length}件のファイルを提出済み`}</Text>
                    </Div>
                    <Button
                      bg="pink600"
                      color="white"
                      h={40}
                      rounded="lg"
                      onPress={() => {
                        saveSubmission(unsavedSubmissions);
                      }}>
                      提出状況を保存
                    </Button>
                  </Div>
                  <Text color="tomato" fontSize={12}>
                    {
                      '※水色のアイコンのファイルはまだ提出状況が保存されていません'
                    }
                  </Text>
                </Div>
                <Div flexDir="row" flexWrap="wrap" mx={16}>
                  {eventInfo?.submissionFiles?.map(
                    f =>
                      f.url && (
                        <Div mr={4} mb={4}>
                          <FileIcon url={f.url} />
                        </Div>
                      ),
                  )}
                  {unsavedSubmissions?.map(
                    f =>
                      f.url && (
                        <Div mr={4} mb={4}>
                          <FileIcon url={f.url} />
                        </Div>
                      ),
                  )}
                </Div>
              </>
            )}
          </Div>
        )}
      </ScrollDiv>
    </WholeContainer>
  );
};

export default EventDetail;
