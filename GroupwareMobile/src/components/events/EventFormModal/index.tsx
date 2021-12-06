import {DateTime} from 'luxon';
import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
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
  ScrollDiv,
  Text,
  Image,
  Tag as TagButton,
  Dropdown,
} from 'react-native-magnus';
import DateTimePicker from 'react-native-modal-datetime-picker';
import {eventFormModalStyles} from '../../../styles/component/event/eventFormModal.style';
import {
  AllTag,
  EventSchedule,
  EventType,
  EventVideo,
  User,
} from '../../../types';
import {blueColor} from '../../../utils/colors';
import {dateTimeFormatterFromJSDDate} from '../../../utils/dateTimeFormatterFromJSDate';
import DropdownOpenerButton from '../../common/DropdownOpenerButton';
import {useFormik} from 'formik';
import {savingEventSchema} from '../../../utils/validation/schema';
import DocumentPicker from 'react-native-document-picker';
import eventTypeNameFactory from '../../../utils/factory/eventTypeNameFactory';
import {uploadImageFromGallery} from '../../../utils/cropImage/uploadImageFromGallery';
import {useAPIUploadStorage} from '../../../hooks/api/storage/useAPIUploadStorage';
import TagModal from '../../common/TagModal';
import {useTagType} from '../../../hooks/tag/useTagType';
import {useSelectedTags} from '../../../hooks/tag/useSelectedTags';
import UserModal from '../../common/UserModal';
import {useSelectedUsers} from '../../../hooks/user/useSelectedUsers';
import {useUserRole} from '../../../hooks/user/useUserRole';
import {formikErrorMsgFactory} from '../../../utils/factory/formikEroorMsgFactory';
import {userNameFactory} from '../../../utils/factory/userNameFactory';
import {tagColorFactory} from '../../../utils/factory/tagColorFactory';
import WholeContainer from '../../WholeContainer';
import {magnusDropdownOptions} from '../../../utils/factory/magnusDropdownOptions';

type CustomModalProps = Omit<ModalProps, 'children'>;

type EventFormModalProps = CustomModalProps & {
  event?: EventSchedule;
  onCloseModal: () => void;
  onSubmit: (event: Partial<EventSchedule>) => void;
  users: User[];
  tags: AllTag[];
};

type DateTimeModalStateValue = {
  visible: 'startAt' | 'endAt' | undefined;
  date: Date;
};

const EventFormModal: React.FC<EventFormModalProps> = props => {
  const {onCloseModal, event, onSubmit, tags, users} = props;
  const dropdownRef = useRef<any | null>(null);
  const [visibleTagModal, setVisibleTagModal] = useState(false);
  const [visibleUserModal, setVisibleUserModal] = useState(false);
  const initialEventValue = {
    title: '',
    description: '',
    startAt: DateTime.now()
      .plus({days: 1})
      .set({hour: 19, minute: 0})
      .toJSDate(),
    endAt: DateTime.now().plus({days: 1}).set({hour: 21, minute: 0}).toJSDate(),
    type: EventType.STUDY_MEETING,
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
  } = useFormik<Partial<EventSchedule>>({
    initialValues: event || initialEventValue,
    validationSchema: savingEventSchema,
    onSubmit: async values => {
      onSubmit(values);
    },
  });

  const [dateTimeModal, setDateTimeModal] = useState<DateTimeModalStateValue>({
    visible: undefined,
    date: new Date(),
  });
  const {width: windowWidth} = useWindowDimensions();
  const {mutate: uploadFile} = useAPIUploadStorage({
    onSuccess: uploadedURL => {
      setNewEvent(e => {
        const newEventFile = {url: uploadedURL[0]};
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
  });
  const {mutate: uploadImage} = useAPIUploadStorage({
    onSuccess: uploadedURL => {
      setNewEvent(e => ({...e, imageURL: uploadedURL[0]}));
    },
  });
  const {
    selectedTags,
    toggleTag,
    isSelected: isSelectedTag,
  } = useSelectedTags(event?.tags || []);
  const {selectedTagType, selectTagType, filteredTags} = useTagType(
    'All',
    tags,
  );
  const {
    selectedUsers,
    toggleUser,
    isSelected: isSelectedUser,
  } = useSelectedUsers(event?.users || []);
  const {selectedUserRole, selectUserRole, filteredUsers} = useUserRole(
    'All',
    users,
  );

  const checkValidateErrors = async () => {
    const errors = await validateForm();
    const messages = formikErrorMsgFactory(errors);
    if (messages) {
      Alert.alert(messages);
    } else {
      onComplete();
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
        uri: res.uri,
        type: res.type,
      });
      uploadFile(formData);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
      } else {
        throw err;
      }
    }
  };

  const handlePickImage = async () => {
    const {formData} = await uploadImageFromGallery();
    if (formData) {
      uploadImage(formData);
    }
  };

  const addYoutubeURL = () => {
    const newVideo: Partial<EventVideo> = {url: youtubeURL};
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
    setYoutubeURL('');
  };

  useEffect(() => {
    setNewEvent(e => ({...e, hostUsers: selectedUsers}));
  }, [selectedUsers, setNewEvent]);

  useEffect(() => {
    setNewEvent(e => ({...e, tags: selectedTags}));
  }, [selectedTags, setNewEvent]);

  return (
    <Modal {...props}>
      <TagModal
        isVisible={visibleTagModal}
        tags={filteredTags || []}
        onCloseModal={() => setVisibleTagModal(false)}
        onPressTag={toggleTag}
        isSelected={isSelectedTag}
        selectedTagType={selectedTagType}
        selectTagType={selectTagType}
      />
      <UserModal
        isVisible={visibleUserModal}
        users={filteredUsers || []}
        onCloseModal={() => setVisibleUserModal(false)}
        onPressUser={toggleUser}
        isSelected={isSelectedUser}
        selectedUserRole={selectedUserRole}
        selectUserRole={selectUserRole}
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
        <ScrollDiv w={windowWidth * 0.9} alignSelf="center">
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
          <Text fontSize={16}>タイトル</Text>
          <Input
            value={newEvent.title}
            onChangeText={t => setNewEvent(e => ({...e, title: t}))}
            mb="lg"
            placeholder="タイトルを入力してください"
            bg="white"
            rounded="md"
            fontSize={16}
          />
          <Div
            flexDir="column"
            alignItems="flex-start"
            alignSelf="center"
            mb={'lg'}>
            <Text fontSize={16}>開始日時</Text>
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
          </Div>
          <Div
            flexDir="column"
            alignItems="flex-start"
            alignSelf="center"
            mb={'lg'}>
            <Text fontSize={16}>終了日時</Text>
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
          <TextInput
            value={newEvent.description}
            onChangeText={t => setNewEvent(e => ({...e, description: t}))}
            placeholder="概要を入力してください"
            numberOfLines={10}
            textAlignVertical={'top'}
            multiline={true}
            style={eventFormModalStyles.descriptionInput}
          />
          <Div mb="lg" />
          <Button
            mb="lg"
            onPress={() => setVisibleUserModal(true)}
            bg="pink600"
            alignSelf="flex-end"
            fontWeight="bold">
            開催者/講師を編集
          </Button>
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
          <Button
            mb="lg"
            onPress={() => setVisibleTagModal(true)}
            bg="green600"
            alignSelf="flex-end"
            fontWeight="bold">
            タグを編集
          </Button>
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
          <Div
            flexDir="column"
            alignItems="flex-start"
            alignSelf="center"
            mb={'lg'}>
            <Text fontSize={16}>タイプ</Text>
            <DropdownOpenerButton
              name={
                newEvent.type
                  ? eventTypeNameFactory(newEvent.type)
                  : 'タイプを選択してください'
              }
              onPress={() => dropdownRef.current?.open()}
            />
          </Div>
          <Dropdown ref={dropdownRef} title="タイプの選択">
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
            <Dropdown.Option
              {...magnusDropdownOptions}
              onPress={() =>
                setNewEvent(e => ({...e, type: EventType.STUDY_MEETING}))
              }
              value={EventType.STUDY_MEETING}>
              {eventTypeNameFactory(EventType.STUDY_MEETING)}
            </Dropdown.Option>
            <Dropdown.Option
              {...magnusDropdownOptions}
              onPress={() => setNewEvent(e => ({...e, type: EventType.BOLDAY}))}
              value={EventType.BOLDAY}>
              {eventTypeNameFactory(EventType.BOLDAY)}
            </Dropdown.Option>
            <Dropdown.Option
              {...magnusDropdownOptions}
              onPress={() => setNewEvent(e => ({...e, type: EventType.COACH}))}
              value={EventType.COACH}>
              {eventTypeNameFactory(EventType.COACH)}
            </Dropdown.Option>
            <Dropdown.Option
              {...magnusDropdownOptions}
              onPress={() => setNewEvent(e => ({...e, type: EventType.CLUB}))}
              value={EventType.CLUB}>
              {eventTypeNameFactory(EventType.CLUB)}
            </Dropdown.Option>
            <Dropdown.Option
              {...magnusDropdownOptions}
              onPress={() =>
                setNewEvent(e => ({...e, type: EventType.SUBMISSION_ETC}))
              }
              value={EventType.SUBMISSION_ETC}>
              {eventTypeNameFactory(EventType.SUBMISSION_ETC)}
            </Dropdown.Option>
          </Dropdown>
          {newEvent.imageURL ? (
            <Image
              mb="lg"
              alignSelf="center"
              h={200}
              w={200}
              rounded="md"
              source={{uri: newEvent.imageURL}}
            />
          ) : (
            <Div
              flexDir="column"
              alignItems="flex-start"
              alignSelf="center"
              mb={'lg'}>
              <Text fontSize={16}>画像を選択</Text>
              <DropdownOpenerButton
                name={'タップで画像を選択'}
                onPress={handlePickImage}
              />
            </Div>
          )}
          <Div
            flexDir="column"
            alignItems="flex-start"
            alignSelf="center"
            mb={'lg'}>
            <Text fontSize={16}>ファイルを選択</Text>
            <DropdownOpenerButton
              name={'タップでファイルを選択'}
              onPress={() => handlePickDocument()}
            />
          </Div>
          {newEvent.files?.map(f => (
            <Div
              mb={'lg'}
              w={'100%'}
              borderColor={blueColor}
              borderWidth={1}
              px={8}
              py={8}
              flexDir="row"
              justifyContent="space-between"
              rounded="md">
              <Text fontSize={16} color={blueColor}>
                {(f.url?.match('.+/(.+?)([?#;].*)?$') || ['', f.url])[1]}
              </Text>
              <TouchableOpacity>
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
            <Text fontSize={16}>関連動画</Text>
            <Input
              autoCapitalize="none"
              mb={'lg'}
              value={youtubeURL}
              onChangeText={t => setYoutubeURL(t)}
              placeholder="Youtubeの動画URLを設定してください"
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
                <TouchableOpacity>
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
                ? newEvent?.startAt
                : dateTimeModal.visible === 'endAt'
                ? newEvent?.endAt
                : new Date()
            }
            onConfirm={date => {
              setDateTimeModal(m => {
                if (m.visible === 'startAt') {
                  setNewEvent(e => ({...e, startAt: date}));
                } else if (m.visible === 'endAt') {
                  setNewEvent(e => ({...e, endAt: date}));
                }
                return {
                  visible: undefined,
                  date,
                };
              });
            }}
            onCancel={() => setDateTimeModal(m => ({...m, visible: undefined}))}
          />
        </ScrollDiv>
      </WholeContainer>
    </Modal>
  );
};

export default EventFormModal;
