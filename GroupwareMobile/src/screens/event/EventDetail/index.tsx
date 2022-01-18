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
import {Div, Text, Button, Overlay, ScrollDiv, Icon} from 'react-native-magnus';
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
import {useFormik} from 'formik';
import {EventComment, EventType, SubmissionFile} from '../../../types';
import {useAPICreateComment} from '../../../hooks/api/event/useAPICreateComment';
import {createCommentSchema} from '../../../utils/validation/schema';
import {formikErrorMsgFactory} from '../../../utils/factory/formikEroorMsgFactory';
import {useAPIDeleteEvent} from '../../../hooks/api/event/useAPIDeleteEvent';
import {useAuthenticate} from '../../../contexts/useAuthenticate';
import {useNavigation} from '@react-navigation/native';
import tailwind from 'tailwind-rn';
import DocumentPicker from 'react-native-document-picker';
import {useAPIUploadStorage} from '../../../hooks/api/storage/useAPIUploadStorage';
import {useAPISaveSubmission} from '../../../hooks/api/event/useAPISaveSubmission';
import FileIcon from '../../../components/common/FileIcon';
import ShareButton from '../../../components/common/ShareButton';
import {generateClientURL} from '../../../utils/url';
import {Tab} from '../../../components/Header/HeaderTemplate';
import AutoLinkedText from '../../../components/common/AutoLinkedText';
import {isFinishedEvent} from '../../../utils/factory/event/isFinishedEvent';
import {isEditableEvent} from '../../../utils/factory/event/isCreatableEvent';
import EventParticipants from '../../../components/events/EventParticipants';
import EventCommentCard from '../EventCommentCard';

const EventDetail: React.FC = () => {
  const route = useRoute<EventDetailRouteProps>();
  const {user} = useAuthenticate();
  const navigation = useNavigation();
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
    onError: () => {
      Alert.alert(
        'イベント更新中にエラーが発生しました。\n時間をおいて再実行してください。',
      );
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
    onError: () => {
      Alert.alert(
        '提出中にエラーが発生しました。\n時間をおいて再実行してください。',
      );
    },
  });
  const {mutate: joinEvent} = useAPIJoinEvent({
    onSuccess: () => refetchEvents(),
    onError: () => {
      Alert.alert(
        'イベント参加中にエラーが発生しました。\n時間をおいて再実行してください。',
      );
    },
  });
  const {mutate: cancelEvent} = useAPICancelEvent({
    onSuccess: () => refetchEvents(),
    onError: () => {
      Alert.alert(
        'イベントキャンセル中にエラーが発生しました。\n時間をおいて再実行してください。',
      );
    },
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
    onError: () => {
      Alert.alert(
        'コメント作成中にエラーが発生しました。\n時間をおいて再実行してください。',
      );
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
    onError: () => {
      Alert.alert(
        'イベント削除中にエラーが発生しました。\n時間をおいて再実行してください。',
      );
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

  const tabs: Tab[] | undefined =
    eventInfo && isEditableEvent(eventInfo, user)
      ? [
          {
            name: 'イベントを削除',
            onPress: onDeleteButtonlicked,
            color: 'red',
          },
        ]
      : undefined;

  const isFinished = isFinishedEvent(eventInfo);
  const normalizeURL = (url: string) => {
    const filePrefix = 'file://';
    if (url.startsWith(filePrefix)) {
      url = url.substring(filePrefix.length);
      url = decodeURI(url);
      return url;
    }
  };
  const defaultImage = () => {
    switch (eventInfo?.type) {
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

  const handleUploadSubmission = async () => {
    const res = await DocumentPicker.pickSingle({
      type: [DocumentPicker.types.allFiles],
    });
    const formData = new FormData();
    formData.append('files', {
      name: res.name,
      uri: normalizeURL(res.uri),
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
        onError: () => {
          Alert.alert(
            'アップロード中にエラーが発生しました。\n時間をおいて再実行してください。',
          );
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
        rightButtonName={
          eventInfo && isEditableEvent(eventInfo, user)
            ? 'イベント編集'
            : undefined
        }
        screenForBack="EventList"
        onPressRightButton={
          eventInfo && isEditableEvent(eventInfo, user)
            ? () => setEventFormModal(true)
            : undefined
        }
      />
      <Overlay visible={screenLoading} p="xl">
        <ActivityIndicator />
      </Overlay>
      <EventFormModal
        event={eventInfo ? Object.assign(eventInfo) : undefined}
        isVisible={visibleEventFormModal}
        onCloseModal={() => setEventFormModal(false)}
        onSubmit={event => saveEvent({...event, id: eventInfo?.id})}
      />

      {eventInfo && (
        <>
          <ScrollDiv>
            <Div flexDir="column">
              <Div>
                {eventInfo.type !== EventType.SUBMISSION_ETC ? (
                  <Div w="48%" mr={4}>
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
                          : defaultImage()
                      }
                    />
                  </Div>
                ) : (
                  <Div justifyContent="center" alignItems="center">
                    <Icon
                      name="filetext1"
                      fontSize={80}
                      style={{
                        ...eventDetailStyles.image,
                        width: windowWidth,
                        minHeight: windowWidth * 0.8,
                      }}
                    />
                  </Div>
                )}
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
                  <AutoLinkedText
                    text={eventInfo.description}
                    style={{
                      ...tailwind(
                        'text-base font-bold text-gray-700 leading-5',
                      ),
                    }}
                    linkStyle={tailwind('text-blue-500')}
                  />
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
                  {eventInfo?.files?.length
                    ? '参考資料'
                    : '参考資料はありません'}
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
                  {eventInfo?.videos?.length
                    ? '関連動画'
                    : '関連動画はありません'}
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
                {eventInfo.type !== EventType.SUBMISSION_ETC ? (
                  <Div>
                    {userJoiningEvents && (
                      <EventParticipants
                        userJoiningEvents={eventInfo.userJoiningEvent}
                        isEditable={isEditableEvent(eventInfo, user)}
                        onSuccessSaveUserJoiningEvent={() => refetchEvents()}
                      />
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
                        py={4}
                        color="white"
                        onPress={() => {
                          commentVisible
                            ? checkValidateErrors()
                            : setCommentVisible(true);
                        }}>
                        {commentVisible
                          ? 'コメントを投稿する'
                          : 'コメントを追加'}
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
                ) : eventInfo.type === EventType.SUBMISSION_ETC ? (
                  <>
                    <Div
                      m={16}
                      borderBottomWidth={1}
                      borderColor="green400"
                      mb="lg"
                      pb="md">
                      {!isFinishedEvent(eventInfo) && (
                        <Div
                          flexDir="row"
                          justifyContent="space-between"
                          alignItems="flex-end">
                          <Div>
                            <Button
                              py={0}
                              bg="blue600"
                              color="white"
                              h={40}
                              rounded="lg"
                              onPress={() => handleUploadSubmission()}>
                              提出物を追加
                            </Button>
                          </Div>
                          <Button
                            py={0}
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
                      )}
                      <Text fontWeight="bold">{`${eventInfo?.submissionFiles?.length}件のファイルを提出済み`}</Text>
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
                              <FileIcon url={f.url} color="blue" />
                            </Div>
                          ),
                      )}
                    </Div>
                  </>
                ) : null}
              </Div>
            </Div>
          </ScrollDiv>
        </>
      )}
    </WholeContainer>
  );
};

export default EventDetail;
