import React, {useEffect, useMemo, useState} from 'react';
import WholeContainer from '../../../components/WholeContainer';
import {
  FlatList,
  useWindowDimensions,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import HeaderWithTextButton from '../../../components/Header';
import {
  Div,
  Text,
  Button,
  Overlay,
  ScrollDiv,
  Icon,
  Tag,
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
import {useIsFocused, useRoute} from '@react-navigation/native';
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
import {responseErrorMsgFactory} from '../../../utils/factory/responseEroorMsgFactory';
import {useIsTabBarVisible} from '../../../contexts/bottomTab/useIsTabBarVisible';
import {useAPIDeleteSubmission} from '../../../hooks/api/event/useAPIDeleteSubmission';

const EventDetail: React.FC = () => {
  const route = useRoute<EventDetailRouteProps>();
  const {user} = useAuthenticate();
  const navigation = useNavigation();
  const id = route.params?.id;
  const isFocused = useIsFocused();
  const {setIsTabBarVisible} = useIsTabBarVisible();
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
  const {
    mutate: saveEvent,
    isSuccess,
    isLoading: isLoadingSaveEvent,
  } = useAPIUpdateEvent({
    onSuccess: () => {
      setEventFormModal(false);
      refetchEvents();
    },
    onError: e => {
      Alert.alert(responseErrorMsgFactory(e));
    },
  });
  const [unsavedSubmissions, setUnsavedSubmissions] = useState<
    Partial<SubmissionFile>[]
  >([]);
  const {mutate: saveSubmission} = useAPISaveSubmission({
    onSuccess: () => {
      setUnsavedSubmissions([]);
      Alert.alert('?????????????????????????????????');
      refetchEvents();
    },
    onError: () => {
      Alert.alert(
        '?????????????????????????????????????????????\n????????????????????????????????????????????????',
      );
    },
  });
  const {mutate: deleteSubmission} = useAPIDeleteSubmission({
    onSuccess: () => {
      setUnsavedSubmissions([]);
      Alert.alert('?????????????????????????????????');
      refetchEvents();
    },
    onError: () => {
      Alert.alert(
        '?????????????????????????????????????????????\n????????????????????????????????????????????????',
      );
    },
  });
  const {mutate: joinEvent} = useAPIJoinEvent({
    onSuccess: () => refetchEvents(),
    onError: err => {
      console.log('err', err);
      Alert.alert(
        '?????????????????????????????????????????????????????????\n????????????????????????????????????????????????',
      );
    },
  });
  const {mutate: cancelEvent} = useAPICancelEvent({
    onSuccess: () => refetchEvents(),
    onError: () => {
      Alert.alert(
        '??????????????????????????????????????????????????????????????????\n????????????????????????????????????????????????',
      );
    },
  });

  useEffect(() => {
    if (isFocused) {
      setIsTabBarVisible(false);
    } else {
      setIsTabBarVisible(true);
    }
  }, [isFocused, setIsTabBarVisible]);

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
        Alert.alert('????????????????????????????????????');
        setValues(t => ({...t, body: ''}));
        setCommentVisible(false);
        refetchEvents();
      }
    },
    onError: e => {
      Alert.alert(responseErrorMsgFactory(e));
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
      Alert.alert('??????????????????????????????');
      navigation.goBack();
    },
    onError: () => {
      Alert.alert(
        '?????????????????????????????????????????????????????????\n????????????????????????????????????????????????',
      );
    },
  });

  const onDeleteButtonlicked = () => {
    if (!eventInfo) {
      return;
    }
    Alert.alert(
      '???????????????????????????????????????????????????',
      '',
      [
        {text: '???????????????', style: 'cancel'},
        {
          text: '????????????',
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
            name: '?????????????????????',
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
      case EventType.OTHER:
        return require('../../../../assets/no-image.jpg');
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
      uri: Platform.OS === 'android' ? res.uri : normalizeURL(res.uri),
      type: res.type,
    });

    if (formData) {
      uploadFile(formData, {
        onSuccess: fileURL => {
          const unSavedFiles: Partial<SubmissionFile>[] = fileURL.map(f => ({
            url: f,
            name: res.name,
            eventSchedule: eventInfo,
            userSubmitted: user,
          }));
          setUnsavedSubmissions(f => [...f, ...unSavedFiles]);
        },
        onError: () => {
          Alert.alert(
            '?????????????????????????????????????????????????????????\n????????????????????????????????????????????????',
          );
        },
      });
    }
  };

  const handleDelete = (file: Partial<SubmissionFile>) => {
    if (file.name) {
      Alert.alert(`${file.name}???????????????????????????????????????`, undefined, [
        {
          text: '??????',
          onPress: () => {
            if (file.id) {
              deleteSubmission({submissionId: file.id});
            }
          },
        },
        {
          text: '?????????',
          onPress: () => {},
        },
      ]);
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
        title="??????????????????"
        activeTabName="???????????????"
        rightButtonName={
          eventInfo && isEditableEvent(eventInfo, user)
            ? '??????????????????'
            : undefined
        }
        screenForBack={
          route.params?.previousScreenName
            ? route.params.previousScreenName
            : 'EventList'
        }
        // screenForBack="EventList"
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
        isSuccess={isSuccess}
      />

      {eventInfo && (
        <>
          <ScrollDiv bg="white">
            <Div flexDir="column" px="lg" w="100%" ml="auto" mr="auto">
              <Tag
                my={10}
                ml={5}
                fontSize="xs"
                bg={eventTypeColorFactory(eventInfo.type)}
                color="white">
                {eventTypeNameFactory(eventInfo.type)}
              </Tag>
              <Text
                fontSize={eventInfo.title.length > 20 ? 20 : 26}
                w="100%"
                fontWeight="900">
                {eventInfo.title}
              </Text>
              <Div my="sm" borderWidth={1} borderColor="gray300" />
              <Div mt={5}>
                {eventInfo.type !== EventType.SUBMISSION_ETC ? (
                  <Div mr={4}>
                    <FastImage
                      style={{
                        ...eventDetailStyles.image,
                        minHeight: windowWidth * 0.7,
                        maxHeight: windowWidth * 0.8,
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
              </Div>
              <Div flexDir="row" alignSelf="flex-end" mb={16}>
                {eventInfo.type !== 'submission_etc' &&
                !isFinished &&
                !eventInfo.isCanceled ? (
                  <Button
                    fontSize={13}
                    rounded={50}
                    bg={'blue600'}
                    color="white"
                    onPress={() => {
                      if (eventInfo.isJoining) {
                        cancelEvent({eventID: Number(id)});
                      } else {
                        joinEvent({eventID: Number(id)});
                      }
                    }}>
                    {eventInfo.isJoining ? '?????????????????????' : '?????????????????????'}
                  </Button>
                ) : eventInfo.type !== 'submission_etc' &&
                  !isFinished &&
                  eventInfo.isCanceled &&
                  eventInfo.isJoining ? (
                  <Text
                    px={10}
                    fontSize={13}
                    color="tomato"
                    textAlign="center"
                    rounded={50}
                    borderColor="red"
                    borderWidth={1}>
                    ?????????????????????
                  </Text>
                ) : isFinished ? (
                  <Text color="tomato" fontSize={13}>
                    ????????????
                  </Text>
                ) : null}
                <ShareButton
                  text={eventInfo.title}
                  urlPath={generateClientURL(`/event/${eventInfo.id}`)}
                />
              </Div>

              <Div mb={8}>
                <AutoLinkedText
                  text={eventInfo.description}
                  style={{
                    ...tailwind('text-base  text-gray-700 leading-5'),
                  }}
                  linkStyle={tailwind('text-blue-500')}
                />
              </Div>

              <Div mb={15}>
                <Text fontWeight="bold" fontSize={16} mb={5}>
                  ??????
                </Text>
                <FlatList
                  horizontal
                  data={eventInfo.tags}
                  keyExtractor={item => item.id.toString()}
                  renderItem={({item: t}) => (
                    <Button
                      fontSize={'xs'}
                      h={20}
                      py={0}
                      bg={tagColorFactory(t.type)}
                      color="white"
                      mr={4}>
                      {t.name}
                    </Button>
                  )}
                />
              </Div>
              <Div mb={15}>
                <Text fontWeight="bold" fontSize={16} mb={5}>
                  ??????
                </Text>
                <Text mb={3} fontSize={13}>{`??????: ${startAtText}`}</Text>
                <Text fontSize={13}>{`??????: ${endAtText}`}</Text>
              </Div>
              <Div mb={8}>
                <Text fontWeight="bold" fontSize={16} mb={5}>
                  ?????????/??????
                </Text>
                <FlatList
                  horizontal
                  data={eventInfo.hostUsers}
                  renderItem={({item: u}) => (
                    <Button
                      fontSize={'xs'}
                      h={20}
                      py={0}
                      bg="purple"
                      color="white"
                      mr={4}>
                      {userNameFactory(u)}
                    </Button>
                  )}
                />
              </Div>

              <Text>
                {eventInfo?.files?.length ? '????????????' : '??????????????????????????????'}
              </Text>
              <Div flexDir="row" flexWrap="wrap">
                {eventInfo?.files?.map(
                  f =>
                    f.url &&
                    f.name && (
                      <Div mr={4} mb={4}>
                        <FileIcon name={f.name} url={f.url} />
                      </Div>
                    ),
                )}
              </Div>
              <Text>
                {eventInfo?.videos?.length
                  ? '????????????'
                  : '??????????????????????????????'}
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
                      ????????????:
                      {eventInfo?.comments.length || 0}???
                    </Text>
                    <Button
                      py={4}
                      color="white"
                      onPress={() => {
                        commentVisible
                          ? checkValidateErrors()
                          : setCommentVisible(true);
                      }}>
                      {commentVisible ? '???????????????????????????' : '?????????????????????'}
                    </Button>
                  </Div>
                  {commentVisible && (
                    <TextInput
                      value={values.body}
                      onChangeText={t => setValues({...values, body: t})}
                      placeholder="??????????????????????????????????????????"
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
                            ??????????????????
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
                          ?????????????????????
                        </Button>
                      </Div>
                    )}
                    <Text fontWeight="bold">{`${eventInfo?.submissionFiles?.length}?????????????????????????????????`}</Text>
                    <Text color="tomato" fontSize={12}>
                      {
                        '??????????????????????????????????????????????????????????????????????????????????????????'
                      }
                    </Text>
                  </Div>
                  <Div flexDir="row" flexWrap="wrap" mx={16}>
                    {eventInfo?.submissionFiles?.map(f =>
                      f.url && f.name ? (
                        <Div flexDir="row" mr={4}>
                          <Div mb={4}>
                            <FileIcon name={f.name} url={f.url} />
                          </Div>
                          <Div ml={-12} mt={-5}>
                            <TouchableOpacity onPress={() => handleDelete(f)}>
                              <Icon
                                name="closecircle"
                                color="gray900"
                                fontSize={24}
                              />
                            </TouchableOpacity>
                          </Div>
                        </Div>
                      ) : null,
                    )}
                    {unsavedSubmissions?.map(f =>
                      f.url && f.name ? (
                        <Div flexDir="row" mr={4}>
                          <Div mb={4}>
                            <Div mr={4} mb={4}>
                              <FileIcon
                                name={f.name}
                                url={f.url}
                                color="blue"
                              />
                            </Div>
                          </Div>
                          <Div ml={-12} mt={-5}>
                            <TouchableOpacity
                              onPress={() =>
                                setUnsavedSubmissions(
                                  unsavedSubmissions.filter(
                                    file => file.url !== f.url,
                                  ),
                                )
                              }>
                              <Icon
                                name="closecircle"
                                color="gray900"
                                fontSize={24}
                              />
                            </TouchableOpacity>
                          </Div>
                        </Div>
                      ) : null,
                    )}
                  </Div>
                </>
              ) : null}
            </Div>
          </ScrollDiv>
        </>
      )}
    </WholeContainer>
  );
};

export default EventDetail;
