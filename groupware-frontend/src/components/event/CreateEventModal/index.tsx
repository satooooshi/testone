import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import createEventModalStyle from '@/styles/components/CreateEventModal.module.scss';
import Modal from 'react-modal';
import { MdCancel } from 'react-icons/md';
import { AiOutlinePlus } from 'react-icons/ai';
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
import DateTimePicker from 'node_modules/react-rainbow-components/components/DateTimePicker';
import { useDropzone } from 'react-dropzone';
import { useAPIUploadStorage } from '@/hooks/api/storage/useAPIUploadStorage';
import ReactCrop from 'react-image-crop';
import { dataURLToFile } from 'src/utils/dataURLToFile';
import {
  Button,
  ButtonGroup,
  FormControl,
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
  InputGroup,
  InputRightElement,
  Flex,
} from '@chakra-ui/react';
import SelectUserModal from '../SelectUserModal';
import { useAPIGetUsers } from '@/hooks/api/user/useAPIGetUsers';
import { imageExtensions } from 'src/utils/imageExtensions';
import { useFormik } from 'formik';
import { createEventSchema } from 'src/utils/validation/schema';
import { useImageCrop } from '@/hooks/crop/useImageCrop';
import { Crop } from 'react-image-crop';
import { DateTime } from 'luxon';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import { formikErrorMsgFactory } from 'src/utils/factory/formikErrorMsgFactory';
import { fileNameTransformer } from 'src/utils/factory/fileNameTransformer';
import { hideScrollbarCss } from 'src/utils/chakra/hideScrollBar.css';
import { darkFontColor } from 'src/utils/colors';
import { isCreatableEvent } from 'src/utils/factory/isCreatableEvent';
import { tagFontColorFactory } from 'src/utils/factory/tagFontColorFactory';
import { tagBgColorFactory } from 'src/utils/factory/tagBgColorFactory';

type ExcludeFilesAndVideosAndType = Pick<
  EventSchedule,
  | 'title'
  | 'description'
  | 'startAt'
  | 'endAt'
  | 'tags'
  | 'imageURL'
  | 'hostUsers'
  | 'chatNeeded'
>;

export type CreateEventRequest = ExcludeFilesAndVideosAndType & {
  id?: number;
  type?: EventType;
  videos: Partial<EventVideo>[];
  files: Partial<EventFile>[];
};

type CreateEventModalProps = {
  enabled: boolean;
  onCancelPressed: () => void;
  event?: Required<EventSchedule> | CreateEventRequest;
  createEvent: (newEvent: CreateEventRequest) => void;
};

const CreateEventModal: React.FC<CreateEventModalProps> = ({
  enabled,
  onCancelPressed,
  event,
  createEvent,
}) => {
  const { data: tags } = useAPIGetTag();
  const { data: users, refetch: refetchGetUsers } = useAPIGetUsers('ALL', {
    enabled: false,
  });
  const { user } = useAuthenticate();
  const toast = useToast();
  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');
  const setDateTime = (addDays: number, hours: number, minutes: number) => {
    const today = new Date();
    today.setDate(today.getDate() + addDays);
    today.setHours(hours, minutes);
    return today;
  };
  const initialEventValue = useMemo(() => {
    return {
      title: '',
      description: '',
      startAt: setDateTime(1, 19, 0),
      endAt: setDateTime(1, 21, 0),
      type: undefined,
      imageURL: '',
      chatNeeded: false,
      hostUsers: [],
      tags: [],
      files: [],
      videos: [],
    };
  }, []);

  const {
    values: newEvent,
    handleSubmit: onFinish,
    setValues: setNewEvent,
    validateForm,
    resetForm,
  } = useFormik<CreateEventRequest | Required<EventSchedule>>({
    initialValues: event ? event : initialEventValue,
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: createEventSchema,
    onSubmit: async (submittedValues) => {
      if (!croppedImageURL || !selectThumbnailName) {
        createEvent(submittedValues);
        return;
      }
      const result = await dataURLToFile(croppedImageURL, selectThumbnailName);

      uploadFiles([result], {
        onSuccess: (fileURLs) => {
          createEvent({ ...submittedValues, imageURL: fileURLs[0] });
          resetForm();
          dispatchCrop({ type: 'resetImage', value: 'resetImage' });
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
      setWillSubmit(true);
    }
  };

  const [newYoutube, setNewYoutube] = useState('');
  const [tagModal, setTagModal] = useState(false);
  const [userModal, setUserModal] = useState(false);
  const [willSubmit, setWillSubmit] = useState(false);
  const [isLoadingTN, setIsloadingTN] = useState(false);
  const [isLoadingRF, setIsloadingRF] = useState(false);

  useEffect(() => {
    if (enabled) {
      setWillSubmit(false);
      refetchGetUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  useEffect(() => {
    if (willSubmit) {
      onFinish();
    }
  }, [willSubmit, onFinish]);

  const [
    {
      crop,
      croppedImageURL,
      imageName: selectThumbnailName,
      imageURL: selectThumbnailUrl,
    },
    dispatchCrop,
  ] = useImageCrop();
  const imgRef = useRef<HTMLImageElement | null>(null);
  const onEventThumbnailDrop = useCallback(
    (f: File[]) => {
      setIsloadingTN(true);
      dispatchCrop({ type: 'setImageFile', value: f[0] });
    },
    [dispatchCrop],
  );

  const onLoad = useCallback((img) => {
    imgRef.current = img;
    const diameter = img.height < img.width ? img.height : img.width;
    dispatchCrop({
      type: 'setCropAndImage',
      value: {
        unit: 'px',
        x: (img.width - diameter) / 2,
        y: (img.height - diameter) / 2,
        width: diameter,
        height: diameter,
        aspect: 1,
      },
      ref: img,
    });
    setIsloadingTN(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChange = (newCrop: Crop) => {
    if (
      newCrop.height !== crop.height ||
      newCrop.width !== crop.width ||
      newCrop.y !== crop.y ||
      newCrop.x !== crop.x
    )
      dispatchCrop({
        type: 'setCropAndImage',
        value: newCrop,
        ref: imgRef.current,
      });
  };

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
      setIsloadingRF(true);
      uploadFiles(files, {
        onSuccess: (urls: string[]) => {
          const newFiles: Partial<EventFile>[] = urls.map((u, i) => ({
            url: u,
            name: files[i].name,
          }));
          setNewEvent((e) => ({
            ...e,
            files: [...(e.files || []), ...newFiles],
          }));
        },
        onSettled: () => {
          setIsloadingRF(false);
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
    newEvent.imageURL && setNewEvent({ ...newEvent, imageURL: '' });
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

  const isCreatableOther = isCreatableEvent(EventType.OTHER, user?.role);

  const pushYoutube = () => {
    const youtubeRegex =
      /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
    if (!youtubeRegex.test(newYoutube)) {
      alert('Youtube???URL???????????????????????????');
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
        borderBottomColor="brand.500"
        borderBottomWidth={1}
        pb="8px"
        alignItems="center"
        mb="16px"
        w="100%"
        position={isSmallerThan768 ? 'sticky' : undefined}
        zIndex={50}
        top={isSmallerThan768 ? '-15px' : undefined}
        pt={isSmallerThan768 ? '15px' : undefined}>
        <Box
          display="flex"
          flexDir="row"
          justifyContent={isSmallerThan768 ? 'space-between' : 'flex-end'}
          w="100%">
          <Button
            disabled={isLoadingTN || isLoadingRF}
            mr="40px"
            onClick={() => {
              checkErrors();
            }}
            colorScheme="brand">
            {isLoading ? <Spinner /> : <Text>?????????????????????</Text>}
          </Button>
          <MdCancel
            onClick={onCancelPressed}
            className={createEventModalStyle.cancel_button}
          />
        </Box>
      </Box>
      <Box display="flex" flexDir={isSmallerThan768 ? 'column' : 'row'}>
        <Box
          w={isSmallerThan768 ? '100%' : '48%'}
          overflowY="auto"
          mr={isSmallerThan768 ? 0 : '16px'}
          css={hideScrollbarCss}>
          <Text fontWeight="bold" mb="8px">
            ????????????????????????
          </Text>
          <Input
            type="text"
            name="title"
            placeholder="???????????????????????????????????????"
            value={newEvent.title}
            onChange={(e) =>
              setNewEvent((ev) => ({ ...ev, title: e.target.value }))
            }
            mb="16px"
            rounded="xl"
          />
          <Text fontWeight="bold" mb="8px">
            ??????????????????
          </Text>
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
                    label="????????????"
                    hour24
                    labelAlignment="left"
                    formatStyle={'medium'}
                  />
                ) : (
                  <Text color={'brand.600'}>
                    ???????????????????????????????????????2????????????????????????????????????????????????????????????????????????
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
                      ? '????????????'
                      : '????????????'
                  }
                  hour24
                  labelAlignment="left"
                  formatStyle={'medium'}
                />
              </Box>
            </Box>
          </Box>
          <Text fontWeight="bold" mb="8px">
            ??????????????????
          </Text>
          <Textarea
            name="description"
            placeholder="?????????????????????????????????"
            h={isSmallerThan768 ? '1vh' : '280px'}
            w="100%"
            wordBreak="break-all"
            mb="16px"
            value={newEvent.description}
            height="max( 240px, 30vh )"
            onChange={(e) =>
              setNewEvent((ev) => ({ ...ev, description: e.target.value }))
            }
            cols={3}
            wrap="hard"
          />
          <Flex alignItems="center" mb="8px">
            <Text fontWeight="bold" mr="8px">
              ?????????/??????
            </Text>
            <Button
              onClick={() => setUserModal(true)}
              size="sm"
              rounded="full"
              variant="outline"
              // leftIcon={<AiOutlinePlus />}
              colorScheme="brand">
              ??????
            </Button>
          </Flex>
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
            flexWrap="wrap"
            mb="16px"
            maxH="200px">
            {newEvent.hostUsers?.map((u) => (
              <Box mb="5px" mr="4px" key={u.id}>
                <ButtonGroup isAttached size="xs" color="blue.600">
                  <Button mr="-px">{u.lastName + u.firstName}</Button>
                  <IconButton
                    onClick={() => toggleHostUser(u)}
                    aria-label="??????"
                    icon={<MdCancel size={18} />}
                  />
                </ButtonGroup>
              </Box>
            ))}
          </Box>
          <Flex alignItems="center" mb="8px">
            <Text fontWeight="bold" mr="8px">
              ??????
            </Text>
            <Button
              onClick={() => openTagModal()}
              size="sm"
              rounded="full"
              variant="outline"
              // leftIcon={<AiOutlinePlus />}
              colorScheme="brand">
              ??????
            </Button>
          </Flex>
          <Box
            display="flex"
            flexDir="row"
            flexWrap="wrap"
            mb="16px"
            maxH="200px">
            {newEvent.tags?.map((t) => (
              <Box mb="5px" mr="4px" key={t.id}>
                <ButtonGroup
                  isAttached
                  size="xs"
                  color={tagFontColorFactory(t.type)}>
                  <Button mr="-px" bg={tagBgColorFactory(t.type)}>
                    {t.name}
                  </Button>
                  <IconButton
                    onClick={() => toggleTag(t)}
                    aria-label="??????"
                    bg={tagBgColorFactory(t.type)}
                    icon={<MdCancel size={18} />}
                  />
                </ButtonGroup>
              </Box>
            ))}
          </Box>
        </Box>
        <Box
          w={isSmallerThan768 ? '100%' : '48%'}
          overflowY="auto"
          css={hideScrollbarCss}>
          {/* chat group is able to be created only on creation */}
          {!newEvent.id && newEvent.type !== EventType.SUBMISSION_ETC ? (
            <Box mb="16px">
              <FormControl>
                <Text fontWeight="bold" mb="8px">
                  ??????????????????????????????(????????????????????????????????????????????????)
                </Text>
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
              <Text fontWeight="bold" mb="8px">
                ?????????
              </Text>
              <Select
                onChange={(e) => {
                  if (!e.target.value) {
                    setNewEvent((e) => ({ ...e, type: undefined }));
                    return;
                  }
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
                <option label={'????????????'}></option>
                {isCreatableImpressiveUniversity && (
                  <option value={EventType.IMPRESSIVE_UNIVERSITY}>
                    ????????????
                  </option>
                )}
                {isCreatableStudyMeeting && (
                  <option value={EventType.STUDY_MEETING}>?????????</option>
                )}
                {isCreatableBolday && (
                  <option value={EventType.BOLDAY}>BOLDay</option>
                )}
                {isCreatableCoach && (
                  <option value={EventType.COACH}>???????????????</option>
                )}
                {isCreatableClub && (
                  <option value={EventType.CLUB}>?????????</option>
                )}
                {isCreatableSubmissionEtc && (
                  <option value={EventType.SUBMISSION_ETC}>????????????</option>
                )}
                {isCreatableOther && (
                  <option value={EventType.OTHER}>?????????</option>
                )}
              </Select>
            </FormControl>
          </Box>
          <Text fontWeight="bold" mb="8px">
            ???????????????
          </Text>

          {((newEvent.imageURL && !selectThumbnailUrl) ||
            selectThumbnailUrl) && (
            <Button
              mb="15px"
              onClick={() => {
                onClickDeleteImage();
              }}
              colorScheme="brand">
              ?????????????????????
            </Button>
          )}
          <Box
            display="flex"
            flexDir="column"
            justifyContent="center"
            alignItems="center"
            mb="16px">
            {newEvent.imageURL && !selectThumbnailUrl ? (
              <Image mb="16px" src={newEvent.imageURL} alt="???????????????" />
            ) : null}
            {selectThumbnailUrl ? (
              <ReactCrop
                src={selectThumbnailUrl}
                crop={crop}
                onChange={(newCrop) => onChange(newCrop)}
                keepSelection={true}
                onImageLoaded={onLoad}
                onImageError={() => setIsloadingTN(false)}
                imageStyle={{
                  minHeight: '100px',
                  maxHeight: '300px',
                  minWidth: '100px',
                }}
              />
            ) : (
              <Box
                {...getEventThumbnailRootProps({
                  className: createEventModalStyle.image_dropzone,
                })}>
                {isLoadingTN ? (
                  <Spinner />
                ) : (
                  <>
                    <input {...getEventThumbnailInputProps()} />
                    <Text>
                      ???????????????????????????????????????????????????
                      {newEvent.imageURL ? '??????????????????????????????' : '??????'}
                    </Text>
                  </>
                )}
              </Box>
            )}
          </Box>
          <Text fontWeight="bold" mb="8px">
            ????????????
          </Text>
          <Box display="flex" flexDir="row" alignItems="center" mb="16px">
            <div
              {...getRelatedFileRootProps({
                className: createEventModalStyle.image_dropzone,
              })}>
              {isLoadingRF ? (
                <Spinner />
              ) : (
                <>
                  <input {...getRelatedFileInputProps()} />
                  <Text>?????????????????????????????????????????????????????????</Text>
                </>
              )}
            </div>
          </Box>
          {newEvent.files?.length ? (
            <Box mb="16px">
              {newEvent.files.map((f) => (
                <Box
                  key={f.url}
                  borderColor={'brand.500'}
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
                    color="brand.600"
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
                    {f.name}
                  </Text>
                  <MdCancel
                    className={createEventModalStyle.url_delete_button}
                    onClick={() =>
                      setNewEvent({
                        ...newEvent,
                        files: newEvent.files.filter(
                          (file) => file.url !== f.url,
                        ),
                      })
                    }
                  />
                </Box>
              ))}
            </Box>
          ) : null}
          <Text fontWeight="bold" mb="8px">
            ????????????
          </Text>
          <Box display="flex" flexDir="row" alignItems="center" mb="16px">
            <InputGroup>
              <Input
                background="white"
                placeholder="Youtube?????????URL???????????????????????????"
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

              <InputRightElement right={-10}>
                <IoMdAddCircle
                  className={createEventModalStyle.icon}
                  onClick={pushYoutube}
                />
              </InputRightElement>
            </InputGroup>
          </Box>
          <Box display="flex" flexDir="column" mb="16px">
            {newEvent?.videos?.map((y) => (
              <Box
                key={y.url}
                borderColor={'brand.500'}
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
                  color="brand.600"
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
