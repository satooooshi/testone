import React, { useCallback, useRef, useState } from 'react';
import createEventModalStyle from '@/styles/components/CreateEventModal.module.scss';
import Modal from 'react-modal';
import { MdCancel } from 'react-icons/md';
import {
  EventFile,
  EventSchedule,
  EventType,
  EventVideo,
  Tag,
  User,
} from 'src/types';
import { IoMdAddCircle } from 'react-icons/io';
import { useAPIGetTag } from '@/hooks/api/tag/useAPIGetTag';
import TagModal from '../../common/TagModal';
import { DateTimePicker } from 'react-rainbow-components';
import { useDropzone } from 'react-dropzone';
import { useAPIUploadStorage } from '@/hooks/api/storage/useAPIUploadStorage';
import ReactCrop from 'react-image-crop';
import { dataURLToFile } from 'src/utils/dataURLToFile';
import {
  Button,
  ButtonGroup,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  RadioGroup,
  Radio,
  Stack,
  useToast,
  IconButton,
  Spinner,
  Text,
  Box,
  Image,
  useMediaQuery,
} from '@chakra-ui/react';
import SelectUserModal from '../SelectUserModal';
import { useAPIGetUsers } from '@/hooks/api/user/useAPIGetUsers';
import { imageExtensions } from 'src/utils/imageExtensions';
import { useFormik } from 'formik';
import { createEventSchema } from 'src/utils/validation/schema';
import { useImageCrop } from '@/hooks/crop/useImageCrop';
import { DateTime } from 'luxon';
import { tagColorFactory } from 'src/utils/factory/tagColorFactory';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import { formikErrorMsgFactory } from 'src/utils/factory/formikErrorMsgFactory';
import { fileNameTransformer } from 'src/utils/factory/fileNameTransformer';
import { hideScrollbarCss } from 'src/utils/chakra/hideScrollBar.css';
import { darkFontColor } from 'src/utils/colors';
import { isCreatableEvent } from 'src/utils/factory/isCreatableEvent';

type ExcludeFilesAndVideos = Pick<
  EventSchedule,
  | 'title'
  | 'description'
  | 'startAt'
  | 'endAt'
  | 'tags'
  | 'imageURL'
  | 'type'
  | 'hostUsers'
  | 'chatNeeded'
>;

export type CreateEventRequest = ExcludeFilesAndVideos & {
  id?: number;
  videos: Partial<EventVideo>[];
  files: Partial<EventFile>[];
};

type CreateEventModalProps = {
  enabled: boolean;
  onCancelPressed: () => void;
  event?: Required<EventSchedule> | CreateEventRequest;
  createEvent: (newEvent: CreateEventRequest) => void;
};

const setDateTime = (addDays: number, hours: number, minutes: number) => {
  const today = new Date();
  today.setDate(today.getDate() + addDays);
  today.setHours(hours, minutes);
  return today;
};

const initialEventValue = {
  title: '',
  description: '',
  startAt: setDateTime(1, 19, 0),
  endAt: setDateTime(1, 21, 0),
  type: EventType.STUDY_MEETING,
  imageURL: '',
  chatNeeded: false,
  hostUsers: [],
  tags: [],
  files: [],
  videos: [],
};

const CreateEventModal: React.FC<CreateEventModalProps> = ({
  enabled,
  onCancelPressed,
  event,
  createEvent,
}) => {
  const { data: tags } = useAPIGetTag();
  const { data: users } = useAPIGetUsers();
  const { user } = useAuthenticate();
  const toast = useToast();
  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');

  const {
    values: newEvent,
    handleSubmit: onFinish,
    setValues: setNewEvent,
    validateForm,
  } = useFormik<CreateEventRequest | Required<EventSchedule>>({
    initialValues: event ? event : initialEventValue,
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: createEventSchema,
    onSubmit: async (submittedValues) => {
      if (!croppedImageURL || !selectThumbnailName || !completedCrop) {
        createEvent(submittedValues);
        return;
      }
      const result = await dataURLToFile(croppedImageURL, selectThumbnailName);

      uploadFiles([result], {
        onSuccess: (fileURLs) => {
          createEvent({ ...submittedValues, imageURL: fileURLs[0] });
        },
      });
    },
  });

  const checkErrors = async () => {
    const errors = await validateForm();
    const messages = formikErrorMsgFactory(errors);
    if (messages) {
      toast({
        description: messages,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } else {
      onFinish();
    }
  };

  const [newYoutube, setNewYoutube] = useState('');
  const [tagModal, setTagModal] = useState(false);
  const [userModal, setUserModal] = useState(false);

  const [
    {
      crop,
      completedCrop,
      croppedImageURL,
      imageName: selectThumbnailName,
      imageURL: selectThumbnailUrl,
    },
    dispatchCrop,
  ] = useImageCrop();
  const imgRef = useRef<HTMLImageElement | null>(null);

  const onEventThumbnailDrop = useCallback(
    (f: File[]) => {
      dispatchCrop({ type: 'setImageFile', value: f[0] });
    },
    [dispatchCrop],
  );

  const onLoad = useCallback((img) => {
    imgRef.current = img;
  }, []);

  const {
    getRootProps: getEventThumbnailRootProps,
    getInputProps: getEventThumbnailInputProps,
  } = useDropzone({
    onDrop: onEventThumbnailDrop,
    accept: imageExtensions,
  });

  const {
    getRootProps: getRelatedFileRootProps,
    getInputProps: getRelatedFileInputProps,
  } = useDropzone({
    onDrop: (files: File[]) => {
      uploadFiles(files, {
        onSuccess: (urls: string[]) => {
          const newFiles: Partial<EventFile>[] = urls.map((u) => ({ url: u }));
          setNewEvent((e) => ({
            ...e,
            files: [...(e.files || []), ...newFiles],
          }));
        },
      });
    },
  });
  const { mutate: uploadFiles, isLoading } = useAPIUploadStorage();

  const toggleHostUser = (u: User) => {
    setNewEvent((e) => {
      if (e.hostUsers?.filter((h) => u.id === h.id).length) {
        return {
          ...e,
          hostUsers: e.hostUsers.filter((h) => u.id !== h.id),
        };
      }
      return {
        ...e,
        hostUsers: e.hostUsers ? [...e.hostUsers, u] : [u],
      };
    });
  };

  const closeTagModal = () => {
    setTagModal(false);
  };

  const openTagModal = () => {
    setTagModal(true);
  };

  const onClickDeleteImage = () => {
    newEvent.imageURL && createEvent({ ...newEvent, imageURL: '' });
    dispatchCrop({ type: 'resetImage', value: 'resetImage' });
  };

  const toggleTag = (clickedTag: Tag) => {
    const isExist = newEvent.tags?.filter((t) => t.id === clickedTag.id).length;
    if (isExist) {
      setNewEvent((e) => ({
        ...e,
        tags: e.tags ? e.tags.filter((t) => t.id !== clickedTag.id) : [],
      }));
      return;
    }
    setNewEvent((e) => ({
      ...e,
      tags: e.tags ? [...e.tags, clickedTag] : [clickedTag],
    }));
  };

  const isCreatableImpressiveUniversity = isCreatableEvent(
    EventType.IMPRESSIVE_UNIVERSITY,
    user?.role,
  );

  const isCreatableStudyMeeting = isCreatableEvent(
    EventType.STUDY_MEETING,
    user?.role,
  );

  const isCreatableBolday = isCreatableEvent(EventType.BOLDAY, user?.role);

  const isCreatableCoach = isCreatableEvent(EventType.COACH, user?.role);

  const isCreatableClub = isCreatableEvent(EventType.CLUB, user?.role);

  const isCreatableSubmissionEtc = isCreatableEvent(
    EventType.SUBMISSION_ETC,
    user?.role,
  );

  const pushYoutube = () => {
    const youtubeRegex =
      /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    if (!youtubeRegex.test(newYoutube)) {
      alert('YoutubeのURLを設定してください');
      return;
    }
    if (!newYoutube) {
      return;
    }
    setNewEvent((e) => ({ ...e, videos: [...e.videos, { url: newYoutube }] }));
    setNewYoutube('');
  };

  return (
    <Modal
      shouldFocusAfterRender={false}
      ariaHideApp={false}
      isOpen={enabled}
      style={{ overlay: { zIndex: 100 } }}
      className={createEventModalStyle.modal}>
      <TagModal
        onComplete={closeTagModal}
        onClear={() => {
          setNewEvent((e) => ({ ...e, tags: [] }));
          closeTagModal();
        }}
        toggleTag={toggleTag}
        isOpen={tagModal}
        tags={tags ? tags : []}
        selectedTags={newEvent.tags ? newEvent.tags : []}
      />
      <Box
        display="flex"
        flexDirection={isSmallerThan768 ? 'row' : 'column'}
        justifyContent="space-between"
        borderBottomColor="blue.500"
        borderBottomWidth={1}
        pb="8px"
        alignItems="center"
        mb="16px"
        w="100%"
        position={isSmallerThan768 ? 'sticky' : undefined}
        zIndex={50}
        bg={'#ececec'}
        top={isSmallerThan768 ? '-15px' : undefined}
        pt={isSmallerThan768 ? '15px' : undefined}>
        <Box
          display="flex"
          flexDir="row"
          justifyContent={isSmallerThan768 ? 'space-between' : 'flex-end'}
          w="100%">
          <Button
            mr="40px"
            onClick={() => {
              checkErrors();
            }}
            colorScheme="blue">
            {isLoading ? <Spinner /> : <Text>イベントを保存</Text>}
          </Button>
          <MdCancel
            onClick={onCancelPressed}
            className={createEventModalStyle.cancel_button}
          />
        </Box>
      </Box>
      <Box display="flex" flexDir={isSmallerThan768 ? 'column' : 'row'}>
        <Box
          display="flex"
          flexDir="column"
          w={isSmallerThan768 ? '100%' : '48%'}
          overflowY="auto"
          mr={isSmallerThan768 ? 0 : '16px'}
          css={hideScrollbarCss}>
          <Input
            type="text"
            name="title"
            placeholder="タイトルを入力してください"
            value={newEvent.title}
            background="white"
            onChange={(e) =>
              setNewEvent((ev) => ({ ...ev, title: e.target.value }))
            }
            bg="white"
            textAlign="left"
            p="8px"
            fontSize="22px"
            fontWeight="bold"
            color={darkFontColor}
          />
          <Box textAlign="center" mb="16px">
            <Box
              display="flex"
              flexDir={isSmallerThan768 ? 'column' : 'row'}
              justifyContent={isSmallerThan768 ? 'flex-start' : 'space-evenly'}
              alignItems="center"
              mb={isSmallerThan768 ? 0 : '16px'}>
              <Box
                w={isSmallerThan768 ? '100%' : '40%'}
                mb={isSmallerThan768 ? '16px' : 0}>
                {newEvent.type !== EventType.SUBMISSION_ETC ? (
                  <DateTimePicker
                    value={newEvent.startAt}
                    onChange={(d) => setNewEvent((e) => ({ ...e, startAt: d }))}
                    label="開始日時"
                    hour24
                    formatStyle={'medium'}
                  />
                ) : (
                  <Text color={'blue.600'}>
                    提出物イベントは終了日時の2時間前の日時に開始としてカレンダーに表示されます
                  </Text>
                )}
              </Box>
              <Box
                w={isSmallerThan768 ? '100%' : '40%'}
                mb={isSmallerThan768 ? '16px' : 0}>
                <DateTimePicker
                  value={newEvent.endAt}
                  onChange={(d) =>
                    setNewEvent((e) => ({
                      ...e,
                      startAt:
                        newEvent.type === EventType.SUBMISSION_ETC
                          ? DateTime.fromJSDate(d).minus({ hour: 2 }).toJSDate()
                          : e.startAt,
                      endAt: d,
                    }))
                  }
                  label={
                    newEvent.type !== EventType.SUBMISSION_ETC
                      ? '終了日時'
                      : '締切日時'
                  }
                  hour24
                  formatStyle={'medium'}
                />
              </Box>
            </Box>
          </Box>
          <Textarea
            name="description"
            placeholder="概要を入力してください"
            p="10px"
            h={isSmallerThan768 ? '1vh' : '280px'}
            w="100%"
            wordBreak="break-all"
            mb="16px"
            value={newEvent.description}
            height="max( 240px, 30vh )"
            onChange={(e) =>
              setNewEvent((ev) => ({ ...ev, description: e.target.value }))
            }
            background="white"
            cols={50}
            wrap="hard"
          />
          <Button
            alignSelf="flex-end"
            mb="8px"
            onClick={() => setUserModal(true)}
            size="sm"
            colorScheme="pink">
            開催者/講師を編集
          </Button>
          <SelectUserModal
            isOpen={userModal}
            selectedUsers={newEvent.hostUsers || []}
            users={users || []}
            onComplete={() => setUserModal(false)}
            toggleUser={toggleHostUser}
          />
          <Box
            display="flex"
            flexDir="row"
            justifyContent="flex-start"
            flexWrap="wrap"
            maxH="200px">
            {newEvent.hostUsers?.map((u) => (
              <Box mb="5px" mr="4px" key={u.id}>
                <ButtonGroup isAttached size="xs" colorScheme="purple">
                  <Button mr="-px">{u.lastName + u.firstName}</Button>
                  <IconButton
                    onClick={() => toggleHostUser(u)}
                    aria-label="削除"
                    icon={<MdCancel size={18} />}
                  />
                </ButtonGroup>
              </Box>
            ))}
          </Box>
          <Button
            alignSelf="flex-end"
            mb="8px"
            onClick={() => openTagModal()}
            size="sm"
            colorScheme="green">
            タグを編集
          </Button>
          <Box
            display="flex"
            flexDir="row"
            justifyContent="flex-start"
            flexWrap="wrap"
            maxH="200px">
            {newEvent.tags?.map((t) => (
              <Box mb="5px" mr="4px" key={t.id}>
                <ButtonGroup
                  isAttached
                  size="xs"
                  colorScheme={tagColorFactory(t.type)}>
                  <Button mr="-px">{t.name}</Button>
                  <IconButton
                    onClick={() => toggleTag(t)}
                    aria-label="削除"
                    icon={<MdCancel size={18} />}
                  />
                </ButtonGroup>
              </Box>
            ))}
          </Box>
        </Box>
        <Box
          display="flex"
          flexDir="column"
          w={isSmallerThan768 ? '100%' : '48%'}
          overflowY="auto"
          css={hideScrollbarCss}>
          {/* chat group is able to be created only on creation */}
          {!newEvent.id && newEvent.type !== EventType.SUBMISSION_ETC ? (
            <Box mb="16px">
              <FormControl>
                <FormLabel>
                  チャットルームの作成(作成後に変更することはできません)
                </FormLabel>
                <RadioGroup ml={1} defaultValue={'unneeded'}>
                  <Stack spacing={5} direction="row">
                    <Radio
                      bg="white"
                      colorScheme="green"
                      value="needed"
                      onChange={() =>
                        setNewEvent((v) => ({ ...v, chatNeeded: true }))
                      }>
                      On
                    </Radio>
                    <Radio
                      bg="white"
                      colorScheme="green"
                      value="unneeded"
                      onChange={() =>
                        setNewEvent((v) => ({ ...v, chatNeeded: false }))
                      }>
                      Off
                    </Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>
            </Box>
          ) : null}
          <Box mb="16px">
            <FormControl>
              <FormLabel>タイプ</FormLabel>
              <Select
                colorScheme="teal"
                bg="white"
                onChange={(e) => {
                  const type = e.target.value as EventType;
                  setNewEvent((prev) => ({
                    ...prev,
                    type,
                    chatNeeded:
                      type === EventType.SUBMISSION_ETC
                        ? false
                        : prev.chatNeeded,
                  }));
                }}
                defaultValue={newEvent.type}>
                {isCreatableImpressiveUniversity && (
                  <option value={EventType.IMPRESSIVE_UNIVERSITY}>
                    感動大学
                  </option>
                )}
                {isCreatableStudyMeeting && (
                  <option value={EventType.STUDY_MEETING}>勉強会</option>
                )}
                {isCreatableBolday && (
                  <option value={EventType.BOLDAY}>BOLDay</option>
                )}
                {isCreatableCoach && (
                  <option value={EventType.COACH}>コーチ制度</option>
                )}
                {isCreatableClub && (
                  <option value={EventType.CLUB}>部活動</option>
                )}
                {isCreatableSubmissionEtc && (
                  <option value={EventType.SUBMISSION_ETC}>提出物等</option>
                )}
              </Select>
            </FormControl>
          </Box>
          <Text mb="15px">サムネイル</Text>
          {((newEvent.imageURL && !selectThumbnailUrl) || completedCrop) && (
            <Button
              mb="15px"
              onClick={() => {
                onClickDeleteImage();
              }}
              colorScheme="blue">
              既存画像を削除
            </Button>
          )}
          <Box
            display="flex"
            flexDir="column"
            justifyContent="center"
            alignItems="center"
            mb="16px">
            {newEvent.imageURL && !selectThumbnailUrl ? (
              <Image mb="16px" src={newEvent.imageURL} alt="サムネイル" />
            ) : null}
            {selectThumbnailUrl ? (
              <ReactCrop
                src={selectThumbnailUrl}
                crop={crop}
                onChange={(newCrop) =>
                  dispatchCrop({ type: 'setCrop', value: newCrop })
                }
                onComplete={(c) =>
                  dispatchCrop({
                    type: 'setCompletedCrop',
                    value: c,
                    ref: imgRef.current,
                  })
                }
                onImageLoaded={onLoad}
              />
            ) : (
              <Box
                {...getEventThumbnailRootProps({
                  className: createEventModalStyle.image_dropzone,
                })}>
                <input {...getEventThumbnailInputProps()} />
                <Text>
                  クリックかドラッグアンドドロップで
                  {newEvent.imageURL ? '別のサムネイルに更新' : '投稿'}
                </Text>
              </Box>
            )}
          </Box>
          <Text mb="16px">参考資料</Text>
          <Box display="flex" flexDir="row" alignItems="center" mb="16px">
            <div
              {...getRelatedFileRootProps({
                className: createEventModalStyle.image_dropzone,
              })}>
              <input {...getRelatedFileInputProps()} />
              <Text>クリックかドラッグアンドドロップで投稿</Text>
            </div>
          </Box>
          {newEvent.files?.length ? (
            <Box mb="16px">
              {newEvent.files.map((f) => (
                <Box
                  key={f.url}
                  borderColor={'blue.500'}
                  rounded="md"
                  borderWidth={1}
                  display="flex"
                  flexDir="row"
                  justifyContent="space-between"
                  alignItems="center"
                  h="40px"
                  mb="8px"
                  px="8px">
                  <Text
                    color="blue.600"
                    alignSelf="center"
                    h="40px"
                    verticalAlign="middle"
                    textAlign="left"
                    display="flex"
                    alignItems="center"
                    whiteSpace="nowrap"
                    overflowX="auto"
                    w="95%"
                    css={hideScrollbarCss}>
                    {fileNameTransformer(f.url || '')}
                  </Text>
                  <MdCancel
                    className={createEventModalStyle.url_delete_button}
                    onClick={() =>
                      setNewEvent({
                        ...newEvent,
                        files: newEvent.files.filter(
                          (file) => file.id !== f.id,
                        ),
                      })
                    }
                  />
                </Box>
              ))}
            </Box>
          ) : null}
          <Text mb="16px">関連動画</Text>
          <Box display="flex" flexDir="row" alignItems="center" mb="16px">
            <Input
              background="white"
              placeholder="Youtubeの動画URLを設定してください"
              type="text"
              w="100%"
              h="40px"
              color={darkFontColor}
              bg="white"
              rounded="md"
              textAlign="left"
              pr={'40px'}
              value={newYoutube}
              onChange={(e) => setNewYoutube(e.currentTarget.value)}
            />
            <IoMdAddCircle
              className={createEventModalStyle.icon}
              onClick={pushYoutube}
            />
          </Box>
          <Box display="flex" flexDir="column" mb="16px">
            {newEvent?.videos?.map((y) => (
              <Box
                key={y.url}
                borderColor={'blue.500'}
                borderWidth={1}
                rounded="md"
                display="flex"
                flexDir="row"
                justifyContent="space-between"
                alignItems="center"
                h="40px"
                mb="8px"
                px="8px">
                <Text
                  color="blue.600"
                  alignSelf="center"
                  h="40px"
                  verticalAlign="middle"
                  textAlign="left"
                  display="flex"
                  alignItems="center"
                  whiteSpace="nowrap"
                  overflowX="auto"
                  w="95%"
                  css={hideScrollbarCss}>
                  {y.url}
                </Text>
                <MdCancel
                  className={createEventModalStyle.url_delete_button}
                  onClick={() =>
                    setNewEvent({
                      ...newEvent,
                      videos: newEvent.videos.filter(
                        (video) => video.id !== y.id,
                      ),
                    })
                  }
                />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default CreateEventModal;
