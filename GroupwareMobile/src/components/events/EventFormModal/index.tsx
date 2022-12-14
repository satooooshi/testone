import {DateTime} from 'luxon';
import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
  Platform,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import {
  Button,
  Div,
  Icon,
  Input,
  Modal,
  ModalProps,
  Text,
  Image,
  Tag as TagButton,
  Dropdown,
  Radio,
} from 'react-native-magnus';
import DateTimePicker from 'react-native-modal-datetime-picker';
import {eventFormModalStyles} from '../../../styles/component/event/eventFormModal.style';
import {EventSchedule, EventType, EventVideo} from '../../../types';
import {blueColor} from '../../../utils/colors';
import {dateTimeFormatterFromJSDDate} from '../../../utils/dateTimeFormatterFromJSDate';
import DropdownOpenerButton from '../../common/DropdownOpenerButton';
import {useFormik} from 'formik';
import {savingEventSchema} from '../../../utils/validation/schema';
import eventTypeNameFactory from '../../../utils/factory/eventTypeNameFactory';
import {uploadImageFromGallery} from '../../../utils/cropImage/uploadImageFromGallery';
import {useAPIUploadStorage} from '../../../hooks/api/storage/useAPIUploadStorage';
import TagModal from '../../common/TagModal';
import {useTagType} from '../../../hooks/tag/useTagType';
import {useSelectedTags} from '../../../hooks/tag/useSelectedTags';
import UserModal from '../../common/UserModal';
import {useUserRole} from '../../../hooks/user/useUserRole';
import {formikErrorMsgFactory} from '../../../utils/factory/formikEroorMsgFactory';
import {userNameFactory} from '../../../utils/factory/userNameFactory';
import {tagColorFactory} from '../../../utils/factory/tagColorFactory';
import WholeContainer from '../../WholeContainer';
import {magnusDropdownOptions} from '../../../utils/factory/magnusDropdownOptions';
import {useAPIGetTag} from '../../../hooks/api/tag/useAPIGetTag';
import {useAPIGetUsers} from '../../../hooks/api/user/useAPIGetUsers';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {isCreatableEvent} from '../../../utils/factory/event/isCreatableEvent';
import {useAuthenticate} from '../../../contexts/useAuthenticate';
import tailwind from 'tailwind-rn';
import {handlePickDocument} from '../../../utils/handlePickDocument';
import {ActivityIndicator} from 'react-native-paper';
import DocumentPicker from 'react-native-document-picker';

type CustomModalProps = Omit<ModalProps, 'children'>;

type EventFormModalProps = CustomModalProps & {
  type?: EventType;
  event?: EventSchedule;
  onCloseModal: () => void;
  onSubmit: (event: Partial<EventSchedule>) => void;
  isSuccess?: boolean;
};

type DateTimeModalStateValue = {
  visible: 'startAt' | 'endAt' | undefined;
  date: Date;
};

const EventFormModal: React.FC<EventFormModalProps> = props => {
  const {
    onCloseModal,
    event,
    onSubmit,
    type,
    isSuccess = false,
    isVisible,
  } = props;
  const {user} = useAuthenticate();
  const dropdownRef = useRef<any | null>(null);
  const {data: tags} = useAPIGetTag();
  const {data: users, refetch: refetchGetUsers} = useAPIGetUsers('ALL', {
    enabled: false,
  });
  const [visibleTagModal, setVisibleTagModal] = useState(false);
  const [visibleUserModal, setVisibleUserModal] = useState(false);
  const [willSubmit, setWillSubmit] = useState(false);
  const initialEventValue = {
    title: '',
    description: '',
    startAt: DateTime.now()
      .plus({days: 1})
      .set({hour: 19, minute: 0})
      .toJSDate(),
    endAt: DateTime.now().plus({days: 1}).set({hour: 21, minute: 0}).toJSDate(),
    type: type || undefined,
    imageURL: '',
    chatNeeded: false,
    hostUsers: [],
    tags: [],
    files: [],
    videos: [],
  };
  const [youtubeURL, setYoutubeURL] = useState('');
  const {
    values: newEvent,
    handleSubmit: onComplete,
    setValues: setNewEvent,
    validateForm,
    resetForm,
  } = useFormik<Partial<EventSchedule>>({
    initialValues: event ? Object.assign(event) : initialEventValue,
    validationSchema: savingEventSchema,
    onSubmit: async values => {
      onSubmit(values);
    },
  });

  useEffect(() => {
    if (isSuccess) {
      resetForm();
    }
  }, [isSuccess, resetForm]);

  useEffect(() => {
    if (isVisible) {
      setWillSubmit(false);
      refetchGetUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  useEffect(() => {
    const safetySubmit = async () => {
      onComplete();
      await new Promise(r => setTimeout(r, 1000));
      setWillSubmit(false);
    };
    if (willSubmit) {
      safetySubmit();
    }
  }, [willSubmit, onComplete]);

  const [dateTimeModal, setDateTimeModal] = useState<DateTimeModalStateValue>({
    visible: undefined,
    date: new Date(),
  });
  const {width: windowWidth} = useWindowDimensions();
  const {mutate: uploadFile, isLoading: isLoadingRF} = useAPIUploadStorage();
  const {mutate: uploadImage, isLoading: isLoadingTN} = useAPIUploadStorage({
    onSuccess: uploadedURL => {
      setNewEvent(e => ({...e, imageURL: uploadedURL[0]}));
    },
    onError: () => {
      Alert.alert(
        '?????????????????????????????????????????????????????????\n????????????????????????????????????????????????',
      );
    },
  });
  const {setSelectedTags} = useSelectedTags(event?.tags);
  const {selectedTagType, filteredTags} = useTagType('All', tags);
  const {selectedUserRole, filteredUsers} = useUserRole('All', users);

  const checkValidateErrors = async () => {
    const errors = await validateForm();
    const messages = formikErrorMsgFactory(errors);
    if (messages) {
      Alert.alert(messages);
    } else {
      setWillSubmit(true);
    }
  };
  const normalizeURL = (url: string) => {
    const filePrefix = 'file://';
    if (url.startsWith(filePrefix)) {
      url = url.substring(filePrefix.length);
      url = decodeURI(url);
      return url;
    }
  };

  const handlePickDocument = async () => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.allFiles],
      });
      const formData = new FormData();
      formData.append('files', {
        name: res.name,
        uri: Platform.OS === 'android' ? res.uri : normalizeURL(res.uri),
        type: res.type,
      });
      uploadFile(formData, {
        onSuccess: uploadedURL => {
          setNewEvent(e => {
            const newEventFile = {url: uploadedURL[0], name: res.name};
            if (e.files && e.files.length) {
              return {
                ...e,
                files: [...e.files, newEventFile],
              };
            }
            return {
              ...e,
              files: [newEventFile],
            };
          });
        },
        onError: () => {
          Alert.alert(
            '?????????????????????????????????????????????????????????\n????????????????????????????????????????????????',
          );
        },
      });
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
      } else {
        throw err;
      }
    }
  };

  const handlePickImage = async () => {
    const {formData} = await uploadImageFromGallery({
      cropping: true,
      mediaType: 'photo',
      multiple: false,
      width: 300,
      height: 300,
    });
    if (formData) {
      uploadImage(formData);
    }
  };

  const addYoutubeURL = () => {
    const newVideo: Partial<EventVideo> = {url: youtubeURL};
    const regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const isYoutubeURLFormat = regExp.test(newVideo.url || '');
    if (isYoutubeURLFormat) {
      setNewEvent(e => {
        if (e.videos && e.videos.length) {
          return {
            ...e,
            videos: [...e.videos, newVideo],
          };
        }
        return {
          ...e,
          videos: [newVideo],
        };
      });
    } else {
      Alert.alert('youtube???URL????????????????????????????????????');
    }
    setYoutubeURL('');
  };

  const cancelAddingYoutubeURL = (videoUrl: string) => {
    setNewEvent(e => {
      if (e.videos?.length) {
        return {...e, videos: e.videos.filter(v => v.url !== videoUrl)};
      }
      return e;
    });
  };

  const removeFile = (fileUrl: string) => {
    setNewEvent(e => {
      if (e.files?.length) {
        return {...e, files: e.files.filter(f => f.url !== fileUrl)};
      }
      return e;
    });
  };

  useEffect(() => {
    if (event) {
      setNewEvent(event);
    }
  }, [event, setNewEvent]);

  useEffect(() => {
    event?.tags && setSelectedTags(event.tags);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  return (
    <Modal {...props}>
      <TagModal
        onCompleteModal={selectedTagsInModal =>
          setNewEvent(e => ({...e, tags: selectedTagsInModal}))
        }
        isVisible={visibleTagModal}
        tags={filteredTags || []}
        onCloseModal={() => setVisibleTagModal(false)}
        selectedTagType={selectedTagType}
        defaultSelectedTags={newEvent.tags}
      />
      <UserModal
        onCompleteModal={selectedUsers =>
          setNewEvent(e => ({...e, hostUsers: selectedUsers}))
        }
        isVisible={visibleUserModal}
        users={filteredUsers || []}
        onCloseModal={() => setVisibleUserModal(false)}
        selectedUserRole={selectedUserRole}
        defaultSelectedUsers={newEvent.hostUsers}
      />
      <WholeContainer>
        <Button
          bg="blue700"
          h={60}
          w={60}
          position="absolute"
          zIndex={20}
          right={10}
          bottom={10}
          alignSelf="flex-end"
          rounded="circle"
          onPress={() => checkValidateErrors()}>
          <Icon color="white" name="check" fontSize={32} />
        </Button>
        <KeyboardAwareScrollView
          contentContainerStyle={{
            width: windowWidth,
            ...tailwind('self-center'),
          }}>
          <Div bg="white" p="5%">
            <Button
              bg="gray400"
              h={35}
              w={35}
              mb="lg"
              alignSelf="flex-end"
              rounded="circle"
              onPress={onCloseModal}>
              <Icon color="black" name="close" />
            </Button>
            <Text fontSize={16}>????????????</Text>
            <Input
              value={newEvent.title}
              onChangeText={t => setNewEvent(e => ({...e, title: t}))}
              mb="lg"
              placeholder="???????????????????????????????????????"
              bg="white"
              autoCapitalize="none"
              rounded="md"
              fontSize={16}
            />
            <Div
              flexDir="column"
              alignItems="flex-start"
              alignSelf="center"
              mb={'lg'}>
              <Text fontSize={16}>????????????</Text>
              {newEvent.type !== EventType.SUBMISSION_ETC ? (
                <DropdownOpenerButton
                  name={dateTimeFormatterFromJSDDate({
                    dateTime: newEvent.startAt
                      ? new Date(newEvent.startAt)
                      : new Date(),
                    format: 'yyyy/LL/dd HH:mm',
                  })}
                  onPress={() =>
                    setDateTimeModal({
                      visible: 'startAt',
                      date: newEvent.startAt || new Date(),
                    })
                  }
                />
              ) : (
                <Text color="blue" fontSize={16}>
                  ???????????????????????????????????????2????????????????????????????????????????????????????????????????????????
                </Text>
              )}
            </Div>
            <Div
              flexDir="column"
              alignItems="flex-start"
              alignSelf="center"
              mb={'lg'}>
              <Text fontSize={16}>
                {newEvent.type !== EventType.SUBMISSION_ETC
                  ? '????????????'
                  : '????????????'}
              </Text>
              <DropdownOpenerButton
                name={dateTimeFormatterFromJSDDate({
                  dateTime: newEvent.endAt
                    ? new Date(newEvent.endAt)
                    : new Date(),
                  format: 'yyyy/LL/dd HH:mm',
                })}
                onPress={() =>
                  setDateTimeModal({
                    visible: 'endAt',
                    date: newEvent.endAt || new Date(),
                  })
                }
              />
            </Div>
            <Text fontSize={16}>??????</Text>
            <TextInput
              value={newEvent.description}
              onChangeText={t => setNewEvent(e => ({...e, description: t}))}
              placeholder="?????????????????????????????????"
              numberOfLines={10}
              textAlignVertical={'top'}
              multiline={true}
              autoCapitalize="none"
              style={eventFormModalStyles.descriptionInput}
            />
            <Div mb="lg" />
            <Div row justifyContent="space-between" alignItems="center">
              <Text fontSize={16}>?????????/??????</Text>
              <Button
                onPress={() => setVisibleUserModal(true)}
                py="sm"
                px="xl"
                bg="white"
                color="blue700"
                borderWidth={1}
                borderColor="blue700"
                rounded="circle"
                fontWeight="bold">
                ??????
              </Button>
            </Div>
            <Div flexDir="row" flexWrap="wrap" mb={8}>
              {newEvent.hostUsers?.map(u => (
                <TagButton
                  key={u.id}
                  mr={4}
                  mb={8}
                  color="white"
                  bg={'purple800'}>
                  {userNameFactory(u)}
                </TagButton>
              ))}
            </Div>
            <Div row justifyContent="space-between" alignItems="center">
              <Text fontSize={16}>??????</Text>
              <Button
                onPress={() => setVisibleTagModal(true)}
                py="sm"
                px="xl"
                bg="white"
                color="blue700"
                borderWidth={1}
                borderColor="blue700"
                rounded="circle"
                fontWeight="bold">
                ??????
              </Button>
            </Div>
            <Div flexDir="row" flexWrap="wrap" mb={8}>
              {newEvent.tags?.map(t => (
                <TagButton
                  key={t.id}
                  mr={4}
                  mb={8}
                  color="white"
                  bg={tagColorFactory(t.type)}>
                  {t.name}
                </TagButton>
              ))}
            </Div>
            {!newEvent?.id ? (
              <Div row justifyContent="space-between" w="100%" mb="lg">
                <Text fontSize={16}>
                  {'??????????????????????????????\n'}
                  <Text color="tomato">?????????????????????????????????????????????</Text>
                </Text>
                <Div row>
                  <Div row alignItems="center" mr="sm">
                    <Text>??????</Text>
                    {/* @ts-ignore */}
                    <Radio
                      value={1}
                      activeColor="green500"
                      onChange={() =>
                        setNewEvent(e => ({...e, chatNeeded: true}))
                      }
                      checked={newEvent.chatNeeded}
                    />
                  </Div>
                  <Div row alignItems="center">
                    <Text>??????</Text>
                    {/* @ts-ignore */}
                    <Radio
                      value={2}
                      activeColor="green500"
                      onChange={() =>
                        setNewEvent(e => ({...e, chatNeeded: false}))
                      }
                      checked={!newEvent.chatNeeded}
                    />
                  </Div>
                </Div>
              </Div>
            ) : null}

            <Div
              flexDir="column"
              alignItems="flex-start"
              alignSelf="center"
              mb={'lg'}>
              <Text fontSize={16}>?????????</Text>
              <DropdownOpenerButton
                name={
                  newEvent.type
                    ? eventTypeNameFactory(newEvent.type)
                    : '????????????????????????????????????'
                }
                onPress={() => dropdownRef.current?.open()}
              />
            </Div>
            <Dropdown ref={dropdownRef} title="??????????????????">
              {isCreatableEvent(EventType.IMPRESSIVE_UNIVERSITY, user?.role) ? (
                <Dropdown.Option
                  {...magnusDropdownOptions}
                  onPress={() =>
                    setNewEvent(e => ({
                      ...e,
                      type: EventType.IMPRESSIVE_UNIVERSITY,
                    }))
                  }
                  value={EventType.IMPRESSIVE_UNIVERSITY}>
                  {eventTypeNameFactory(EventType.IMPRESSIVE_UNIVERSITY)}
                </Dropdown.Option>
              ) : (
                <></>
              )}
              {isCreatableEvent(EventType.STUDY_MEETING, user?.role) ? (
                <Dropdown.Option
                  {...magnusDropdownOptions}
                  onPress={() =>
                    setNewEvent(e => ({...e, type: EventType.STUDY_MEETING}))
                  }
                  value={EventType.STUDY_MEETING}>
                  {eventTypeNameFactory(EventType.STUDY_MEETING)}
                </Dropdown.Option>
              ) : (
                <></>
              )}
              {isCreatableEvent(EventType.BOLDAY, user?.role) ? (
                <Dropdown.Option
                  {...magnusDropdownOptions}
                  onPress={() =>
                    setNewEvent(e => ({...e, type: EventType.BOLDAY}))
                  }
                  value={EventType.BOLDAY}>
                  {eventTypeNameFactory(EventType.BOLDAY)}
                </Dropdown.Option>
              ) : (
                <></>
              )}
              {isCreatableEvent(EventType.COACH, user?.role) ? (
                <Dropdown.Option
                  {...magnusDropdownOptions}
                  onPress={() =>
                    setNewEvent(e => ({...e, type: EventType.COACH}))
                  }
                  value={EventType.COACH}>
                  {eventTypeNameFactory(EventType.COACH)}
                </Dropdown.Option>
              ) : (
                <></>
              )}
              {isCreatableEvent(EventType.CLUB, user?.role) ? (
                <Dropdown.Option
                  {...magnusDropdownOptions}
                  onPress={() =>
                    setNewEvent(e => ({...e, type: EventType.CLUB}))
                  }
                  value={EventType.CLUB}>
                  {eventTypeNameFactory(EventType.CLUB)}
                </Dropdown.Option>
              ) : (
                <></>
              )}
              {isCreatableEvent(EventType.SUBMISSION_ETC, user?.role) ? (
                <Dropdown.Option
                  {...magnusDropdownOptions}
                  onPress={() =>
                    setNewEvent(e => ({...e, type: EventType.SUBMISSION_ETC}))
                  }
                  value={EventType.SUBMISSION_ETC}>
                  {eventTypeNameFactory(EventType.SUBMISSION_ETC)}
                </Dropdown.Option>
              ) : (
                <></>
              )}
              {isCreatableEvent(EventType.OTHER, user?.role) ? (
                <Dropdown.Option
                  {...magnusDropdownOptions}
                  onPress={() =>
                    setNewEvent(e => ({...e, type: EventType.OTHER}))
                  }
                  value={EventType.OTHER}>
                  {eventTypeNameFactory(EventType.OTHER)}
                </Dropdown.Option>
              ) : (
                <></>
              )}
            </Dropdown>
            {newEvent.imageURL ? (
              <>
                <Button
                  w="100%"
                  bg="blue700"
                  mb="lg"
                  onPress={() => setNewEvent(e => ({...e, imageURL: ''}))}>
                  ?????????????????????
                </Button>
                <Image
                  mb="lg"
                  alignSelf="center"
                  h={200}
                  w={200}
                  rounded="md"
                  source={{uri: newEvent.imageURL}}
                />
              </>
            ) : (
              <Div
                flexDir="column"
                alignItems="flex-start"
                alignSelf="center"
                mb={'lg'}>
                {isLoadingTN ? (
                  <ActivityIndicator />
                ) : (
                  <>
                    <Text fontSize={16}>????????????????????????</Text>
                    <DropdownOpenerButton
                      name={'???????????????????????????'}
                      onPress={handlePickImage}
                    />
                  </>
                )}
              </Div>
            )}
            <Div
              flexDir="column"
              alignItems="flex-start"
              alignSelf="center"
              mb={'lg'}>
              {isLoadingRF ? (
                <ActivityIndicator />
              ) : (
                <>
                  <Text fontSize={16}>?????????????????????</Text>
                  <DropdownOpenerButton
                    name={'?????????????????????????????????'}
                    onPress={() => handlePickDocument()}
                  />
                </>
              )}
            </Div>
            {newEvent.files?.map(f => (
              <Div
                key={f.id}
                mb={'lg'}
                w={'100%'}
                h={'5%'}
                borderColor={blueColor}
                borderWidth={1}
                px={8}
                py={8}
                flexDir="row"
                justifyContent="space-between"
                rounded="md">
                <Text fontSize={16} color={blueColor} w="80%">
                  {f.name}
                </Text>
                <TouchableOpacity onPress={() => removeFile(f.url || '')}>
                  <Icon name="closecircle" color="gray900" fontSize={24} />
                </TouchableOpacity>
              </Div>
            ))}
            <Div
              flexDir="column"
              alignItems="flex-start"
              alignSelf="center"
              w={'100%'}
              mb={'3xl'}>
              <Text fontSize={16}>????????????</Text>
              <Input
                autoCapitalize="none"
                mb={'lg'}
                value={youtubeURL}
                onChangeText={t => setYoutubeURL(t)}
                placeholder="Youtube?????????URL???????????????????????????"
                p={10}
                focusBorderColor="blue700"
                fontSize={16}
                suffix={
                  <TouchableOpacity onPress={addYoutubeURL}>
                    <Icon
                      name="plus-circle"
                      color="gray900"
                      fontFamily="Feather"
                      fontSize={24}
                    />
                  </TouchableOpacity>
                }
              />
              {newEvent.videos?.map(v => (
                <Div
                  key={v.id}
                  mb={'lg'}
                  w={'100%'}
                  borderColor={blueColor}
                  borderWidth={1}
                  px={8}
                  py={8}
                  flexDir="row"
                  justifyContent="space-between"
                  rounded="md">
                  <Text w={'90%'} fontSize={16} color={blueColor}>
                    {v.url}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      v?.url && cancelAddingYoutubeURL(v?.url);
                    }}>
                    <Icon name="closecircle" color="gray900" fontSize={24} />
                  </TouchableOpacity>
                </Div>
              ))}
            </Div>
            <DateTimePicker
              isVisible={!!dateTimeModal.visible}
              is24Hour={true}
              mode="datetime"
              date={
                dateTimeModal.visible === 'startAt'
                  ? new Date(newEvent?.startAt || new Date())
                  : dateTimeModal.visible === 'endAt'
                  ? new Date(newEvent?.endAt || new Date())
                  : new Date()
              }
              onConfirm={date => {
                setDateTimeModal(m => {
                  if (m.visible === 'startAt') {
                    setNewEvent(e => ({...e, startAt: date}));
                  } else if (m.visible === 'endAt') {
                    setNewEvent(e => ({
                      ...e,
                      endAt: date,
                      startAt:
                        newEvent.type === EventType.SUBMISSION_ETC
                          ? DateTime.fromJSDate(date)
                              .minus({hours: 2})
                              .toJSDate()
                          : e.startAt,
                    }));
                  }
                  return {
                    visible: undefined,
                    date,
                  };
                });
              }}
              onCancel={() =>
                setDateTimeModal(m => ({...m, visible: undefined}))
              }
            />
          </Div>
        </KeyboardAwareScrollView>
      </WholeContainer>
    </Modal>
  );
};

export default EventFormModal;
