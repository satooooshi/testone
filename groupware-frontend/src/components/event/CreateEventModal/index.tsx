import React, { useCallback, useMemo, useRef, useState } from 'react';
import createEventModalStyle from '@/styles/components/CreateEventModal.module.scss';
import clsx from 'clsx';
import Modal from 'react-modal';
import { MdCancel } from 'react-icons/md';
import {
  EventFile,
  EventSchedule,
  EventType,
  EventVideo,
  Tag,
  User,
  UserRole,
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
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  RadioGroup,
  Radio,
  Stack,
  useToast,
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

  const {
    values: newEvent,
    handleSubmit: onFinish,
    setValues: setNewEvent,
    resetForm,
    initialValues,
    validateForm,
  } = useFormik<CreateEventRequest | Required<EventSchedule>>({
    initialValues: event ? event : initialEventValue,
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: createEventSchema,
    onSubmit: async () => {
      if (!croppedImageURL || !selectThumbnailName || !completedCrop) {
        uploadFiles(newFiles);
        return;
      }
      const result = await dataURLToFile(croppedImageURL, selectThumbnailName);

      uploadThumbnail([result]);
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
  const [newFiles, setNewFiles] = useState<File[]>([]);

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

  const onRelatedFileDrop = useCallback((f) => {
    setNewFiles((prev) => [...prev, ...f]);
  }, []);

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
    onDrop: onRelatedFileDrop,
  });
  const { mutate: uploadFiles } = useAPIUploadStorage({
    onSuccess: (fileURLs) => {
      const linkedFiles: Partial<EventFile>[] = fileURLs.map((f) => ({
        url: f,
      }));
      createEvent({ ...newEvent, files: linkedFiles });
      resetForm({ values: initialValues });
      setNewFiles([]);
      dispatchCrop({ type: 'resetImage', value: 'resetImage' });
    },
  });

  const { mutate: uploadThumbnail } = useAPIUploadStorage({
    onSuccess: async (fileURLs) => {
      const updateEventThumbnailOnState = async () => {
        Promise.resolve();
        setNewEvent((e) => ({ ...e, imageURL: fileURLs[0] }));
      };
      await updateEventThumbnailOnState();
      uploadFiles(newFiles);
    },
  });

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

  const isCreatableImpressiveUniversity = useMemo(() => {
    return user?.role === UserRole.ADMIN;
  }, [user?.role]);

  const isCreatableStudyMeeting = useMemo(() => {
    return (
      user?.role === UserRole.ADMIN ||
      user?.role === UserRole.INTERNAL_INSTRUCTOR
    );
  }, [user?.role]);

  const isCreatableBolday = useMemo(() => {
    return user?.role === UserRole.ADMIN;
  }, [user?.role]);

  const isCreatableCoach = useMemo(() => {
    return user?.role === UserRole.ADMIN || user?.role === UserRole.COACH;
  }, [user?.role]);

  const isCreatableClub = useMemo(() => {
    return (
      user?.role === UserRole.ADMIN ||
      user?.role === UserRole.INTERNAL_INSTRUCTOR ||
      user?.role === UserRole.COMMON
    );
  }, [user?.role]);

  const isCreatableSubmissionEtc = useMemo(() => {
    return user?.role === UserRole.ADMIN;
  }, [user?.role]);

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
      <div className={createEventModalStyle.modal_top}>
        <div className={createEventModalStyle.errors_wrapper}></div>
        <div className={createEventModalStyle.top_button_wrapper}>
          <Button
            className={createEventModalStyle.save_event_button}
            onClick={() => {
              checkErrors();
            }}
            colorScheme="blue">
            イベントを保存
          </Button>
          <MdCancel
            onClick={onCancelPressed}
            className={createEventModalStyle.cancel_button}
          />
        </div>
      </div>
      <div className={createEventModalStyle.form_wrapper}>
        <div className={createEventModalStyle.left}>
          <Input
            type="text"
            name="title"
            placeholder="タイトルを入力してください"
            value={newEvent.title}
            background="white"
            onChange={(e) =>
              setNewEvent((ev) => ({ ...ev, title: e.target.value }))
            }
            className={clsx(
              createEventModalStyle.title,
              createEventModalStyle.big_text,
              createEventModalStyle.input,
            )}
          />
          <div className={createEventModalStyle.date_form_wrapper}>
            <div className={createEventModalStyle.date_picker_wrapper}>
              <div className={createEventModalStyle.date_picker}>
                {newEvent.type !== EventType.SUBMISSION_ETC ? (
                  <DateTimePicker
                    value={newEvent.startAt}
                    onChange={(d) => setNewEvent((e) => ({ ...e, startAt: d }))}
                    label="開始日時"
                    hour24
                    formatStyle={'medium'}
                  />
                ) : (
                  <span className={createEventModalStyle.caution_message}>
                    提出物イベントは終了日時の2時間前の日時に開始としてカレンダーに表示されます
                  </span>
                )}
              </div>
              <div className={createEventModalStyle.date_picker}>
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
              </div>
            </div>
          </div>
          <Textarea
            name="description"
            placeholder="概要を入力してください"
            className={createEventModalStyle.description}
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
            className={createEventModalStyle.add_tag}
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
          <div className={createEventModalStyle.tags}>
            {newEvent.hostUsers?.map((u) => (
              <Button
                key={u.id}
                className={createEventModalStyle.tag__item}
                size="xs"
                colorScheme="purple">
                {u.lastName + u.firstName}
              </Button>
            ))}
          </div>
          <Button
            className={createEventModalStyle.add_tag}
            onClick={() => openTagModal()}
            size="sm"
            colorScheme="green">
            タグを編集
          </Button>
          <div className={createEventModalStyle.tags}>
            {newEvent.tags?.map((t) => (
              <Button
                key={t.id}
                size="xs"
                className={createEventModalStyle.tag__item}
                colorScheme={tagColorFactory(t.type)}>
                {t.name}
              </Button>
            ))}
          </div>
        </div>
        <div className={createEventModalStyle.right}>
          {/* chat group is able to be created only on creation */}
          {!newEvent.id && newEvent.type !== EventType.SUBMISSION_ETC ? (
            <div className={createEventModalStyle.type_select_wrapper}>
              <FormControl>
                <FormLabel>
                  チャットルームの作成(作成後に変更することはできません)
                </FormLabel>
                <RadioGroup defaultValue={'unneeded'}>
                  <Stack spacing={5} direction="row">
                    <Radio
                      colorScheme="green"
                      background="white"
                      value="needed"
                      onChange={() =>
                        setNewEvent((v) => ({ ...v, chatNeeded: true }))
                      }>
                      On
                    </Radio>
                    <Radio
                      colorScheme="green"
                      background="white"
                      value="unneeded"
                      onChange={() =>
                        setNewEvent((v) => ({ ...v, chatNeeded: false }))
                      }>
                      Off
                    </Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>
            </div>
          ) : null}
          <div className={createEventModalStyle.type_select_wrapper}>
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
          </div>
          <p className={createEventModalStyle.related_files}>サムネイル</p>
          <div className={createEventModalStyle.image_form_wrapper}>
            {newEvent.imageURL && !selectThumbnailUrl ? (
              <img
                className={createEventModalStyle.image}
                src={newEvent.imageURL}
                alt="サムネイル"
              />
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
              <div
                {...getEventThumbnailRootProps({
                  className: createEventModalStyle.image_dropzone,
                })}>
                <input {...getEventThumbnailInputProps()} />
                <p>
                  クリックかドラッグアンドドロップで
                  {newEvent.imageURL ? '別のサムネイルに更新' : '投稿'}
                </p>
              </div>
            )}
          </div>
          <p className={createEventModalStyle.related_files}>参考資料</p>
          <div className={createEventModalStyle.input_icon_wrapper}>
            <div
              {...getRelatedFileRootProps({
                className: createEventModalStyle.related_file_dropzone,
              })}>
              <input {...getRelatedFileInputProps()} />
              <p>クリックかドラッグアンドドロップで投稿</p>
            </div>
          </div>
          {newFiles.length || newEvent.files?.length ? (
            <div className={createEventModalStyle.related_files_wrapper}>
              {newFiles.map((f) => (
                <div className={createEventModalStyle.url_wrapper} key={f.name}>
                  <p className={createEventModalStyle.url}>{f.name}</p>
                  <MdCancel
                    className={createEventModalStyle.url_delete_button}
                    onClick={() =>
                      setNewFiles(
                        newFiles.filter((file) => f.name !== file.name),
                      )
                    }
                  />
                </div>
              ))}
              {newEvent.files.map((f) => (
                <div className={createEventModalStyle.url_wrapper} key={f.url}>
                  <span className={createEventModalStyle.url}>
                    {(f.url?.match('.+/(.+?)([?#;].*)?$') || ['', f.url])[1]}
                  </span>
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
                </div>
              ))}
            </div>
          ) : null}
          <p className={createEventModalStyle.youtube_url}>関連動画</p>
          <div className={createEventModalStyle.input_icon_wrapper}>
            <Input
              background="white"
              placeholder="Youtubeの動画URLを設定してください"
              type="text"
              className={clsx(
                createEventModalStyle.input,
                createEventModalStyle.youtube_url__input,
              )}
              paddingRight={'40px'}
              value={newYoutube}
              onChange={(e) => setNewYoutube(e.currentTarget.value)}
            />
            <IoMdAddCircle
              className={createEventModalStyle.icon}
              onClick={pushYoutube}
            />
          </div>
          <div className={createEventModalStyle.related_files_wrapper}>
            {newEvent?.videos?.map((y) => (
              <div className={createEventModalStyle.url_wrapper} key={y.url}>
                <p className={createEventModalStyle.url}>{y.url}</p>
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CreateEventModal;
