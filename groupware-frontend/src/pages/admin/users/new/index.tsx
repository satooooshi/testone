import LayoutWithTab from '@/components/LayoutWithTab';
import { ScreenName } from '@/components/Sidebar';
import React, { useCallback, useMemo, useReducer, useRef } from 'react';
import { Tab } from 'src/types/header/tab/types';
import Head from 'next/head';
import Image from 'next/image';
import { TagType, User, UserRole, UserTag } from 'src/types';
import { useAPIUploadStorage } from '@/hooks/api/storage/useAPIUploadStorage';
import { useDropzone } from 'react-dropzone';
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { imageExtensions } from 'src/utils/imageExtensions';
import noImage from '@/public/no-image.jpg';
import { useAPIRegister } from '@/hooks/api/auth/useAPIRegister';
import createNewUserStyles from '@/styles/layouts/admin/CreateNewUser.module.scss';
import clsx from 'clsx';
import { toggleTag } from 'src/utils/toggleTag';
import TagModal from '@/components/TagModal';
import { useAPIGetUserTag } from '@/hooks/api/tag/useAPIGetUserTag';
import { useFormik } from 'formik';
import { registerSchema } from 'src/utils/validation/schema';
import validationErrorStyles from '@/styles/components/ValidationError.module.scss';
import ReactCrop from 'react-image-crop';
import { dataURLToFile } from 'src/utils/dataURLToFile';
import 'react-image-crop/dist/ReactCrop.css';
import { useImageCrop } from '@/hooks/crop/useImageCrop';

type ModalState = {
  isOpen: boolean;
  filteredTagType?: TagType;
};

type ModalAction = {
  type: 'openTech' | 'openQualification' | 'openClub' | 'openHobby' | 'close';
};

const CreateNewUser = () => {
  const toast = useToast();
  const { data: tags } = useAPIGetUserTag();
  const initialUserValues: Partial<User> = useMemo(
    () => ({
      email: '',
      lastName: '',
      firstName: '',
      password: '',
      role: UserRole.COMMON,
      avatarUrl: '',
      introduce: '',
      verifiedAt: new Date(),
      tags: [],
    }),
    [],
  );
  const {
    errors,
    touched,
    handleSubmit,
    handleChange,
    handleBlur,
    setValues: setUserInfo,
    values,
  } = useFormik({
    initialValues: initialUserValues,
    onSubmit: async (submitted, { resetForm }) => {
      if (croppedImageURL && imageName && completedCrop) {
        const result = await dataURLToFile(croppedImageURL, imageName);
        uploadImage([result]);
        resetForm();
        return;
      }
      registerUser(submitted);
      resetForm();
    },
    validationSchema: registerSchema,
  });
  const imgRef = useRef<HTMLImageElement | null>(null);

  const onLoad = useCallback((img) => {
    imgRef.current = img;
  }, []);

  const modalReducer = (
    _state: ModalState,
    action: ModalAction,
  ): ModalState => {
    switch (action.type) {
      case 'openTech': {
        return {
          isOpen: true,
          filteredTagType: TagType.TECH,
        };
      }
      case 'openQualification': {
        return {
          isOpen: true,
          filteredTagType: TagType.QUALIFICATION,
        };
      }
      case 'openClub': {
        return {
          isOpen: true,
          filteredTagType: TagType.CLUB,
        };
      }
      case 'openHobby': {
        return {
          isOpen: true,
          filteredTagType: TagType.HOBBY,
        };
      }
      case 'close': {
        return {
          isOpen: false,
        };
      }
    }
  };

  const [{ isOpen, filteredTagType }, dispatchModal] = useReducer(
    modalReducer,
    {
      isOpen: false,
    },
  );

  const [
    { crop, completedCrop, croppedImageURL, imageName, imageURL },
    dispatchCrop,
  ] = useImageCrop();

  // const [userInfo, setUserInfo] = useState<Partial<User>>(initialUserValues);
  const { mutate: uploadImage } = useAPIUploadStorage({
    onSuccess: async (fileURLs) => {
      const updateEventImageOnState = async () => {
        Promise.resolve();
        setUserInfo((e) => ({ ...e, avatarUrl: fileURLs[0] }));
      };
      await updateEventImageOnState();
      registerUser({ ...values, avatarUrl: fileURLs[0] });
      dispatchCrop({
        type: 'setImageFile',
        value: undefined,
      });
    },
  });

  const onEventImageDrop = useCallback(
    (f: File[]) => {
      dispatchCrop({
        type: 'setImageFile',
        value: f[0],
      });
    },
    [dispatchCrop],
  );

  const {
    getRootProps: getEventImageRootProps,
    getInputProps: getEventImageInputProps,
  } = useDropzone({
    onDrop: onEventImageDrop,
    accept: imageExtensions,
  });

  const { mutate: registerUser } = useAPIRegister({
    onSuccess: (responseData) => {
      if (responseData) {
        const tempPassword: string = values.password || '';
        toast({
          title: `${responseData.lastName} ${responseData.firstName}さんのアカウントを作成しました`,
          description: `パスワード: ${tempPassword}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        setUserInfo(initialUserValues);
      }
    },
  });
  const tabs: Tab[] = useMemo(
    () => [
      {
        type: 'link',
        name: '管理画面へ',
        href: '/admin/users',
      },
    ],
    [],
  );

  const toggleSelectedTag = (t: UserTag) => {
    const toggledTag = toggleTag(values.tags, t);
    setUserInfo((i) => ({
      ...i,
      tags: toggledTag,
    }));
  };

  return (
    <LayoutWithTab
      sidebar={{
        activeScreenName: ScreenName.ADMIN,
      }}
      header={{
        title: '新規ユーザー作成',
        tabs: tabs,
      }}>
      <Head>
        <title>ボールド | ユーザー作成</title>
      </Head>
      {tags && (
        <TagModal
          isOpen={isOpen}
          isSearch={false}
          tags={tags}
          selectedTags={values.tags || []}
          filteredTagType={filteredTagType}
          toggleTag={toggleSelectedTag}
          onCancel={() => {
            dispatchModal({ type: 'close' });
          }}
          onComplete={() => dispatchModal({ type: 'close' })}
        />
      )}
      <div className={createNewUserStyles.main}>
        <div className={createNewUserStyles.image_wrapper}>
          {imageURL ? (
            <ReactCrop
              imageStyle={{ maxHeight: '100vh', maxWidth: '90vw' }}
              src={imageURL}
              crop={crop}
              onChange={(newCrop) =>
                dispatchCrop({ type: 'setCrop', value: newCrop })
              }
              onComplete={(newCrop) =>
                dispatchCrop({
                  type: 'setCompletedCrop',
                  value: newCrop,
                  ref: imgRef.current,
                })
              }
              onImageLoaded={onLoad}
            />
          ) : (
            <div
              {...getEventImageRootProps({
                className: createNewUserStyles.image_dropzone,
              })}>
              <input {...getEventImageInputProps()} />
              <Image
                className={createNewUserStyles.avatar}
                src={noImage}
                alt="アバター画像"
              />
            </div>
          )}
        </div>
        <div className={createNewUserStyles.form_wrapper}>
          <FormControl className={createNewUserStyles.input_wrapper}>
            <FormLabel fontWeight={'bold'}>
              <p>姓</p>
              {errors.lastName && touched.lastName ? (
                <p className={validationErrorStyles.error_text}>
                  {errors.lastName}
                </p>
              ) : null}
            </FormLabel>
            <Input
              type="text"
              placeholder="山田"
              value={values.lastName}
              background="white"
              name="lastName"
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </FormControl>
          <FormControl className={createNewUserStyles.input_wrapper}>
            <FormLabel fontWeight={'bold'}>
              <p>名</p>
              {errors.firstName && touched.firstName ? (
                <p className={validationErrorStyles.error_text}>
                  {errors.firstName}
                </p>
              ) : null}
            </FormLabel>
            <Input
              type="text"
              placeholder="太郎"
              value={values.firstName}
              background="white"
              onChange={(e) =>
                setUserInfo((i) => ({ ...i, firstName: e.target.value }))
              }
              name="firstName"
              onBlur={handleBlur}
            />
          </FormControl>
          <FormControl className={createNewUserStyles.input_wrapper}>
            <FormLabel fontWeight={'bold'}>
              <p>メールアドレス</p>
              {errors.email && touched.email ? (
                <p className={validationErrorStyles.error_text}>
                  {errors.email}
                </p>
              ) : null}
            </FormLabel>
            <Input
              type="email"
              placeholder="email@example.com"
              value={values.email}
              background="white"
              onChange={(e) =>
                setUserInfo((i) => ({ ...i, email: e.target.value }))
              }
              name="email"
              onBlur={handleBlur}
            />
          </FormControl>
          <FormControl className={createNewUserStyles.input_wrapper}>
            <FormLabel fontWeight={'bold'}>
              <p>パスワード</p>
              {errors.password && touched.password ? (
                <p className={validationErrorStyles.error_text}>
                  {errors.password}
                </p>
              ) : null}
            </FormLabel>
            <Input
              type="password"
              placeholder="password"
              value={values.password}
              background="white"
              name="password"
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </FormControl>
          <FormControl className={createNewUserStyles.input_wrapper}>
            <FormLabel fontWeight={'bold'}>
              <p>自己紹介</p>
              {errors.introduce && touched.introduce ? (
                <p className={validationErrorStyles.error_text}>
                  {errors.introduce}
                </p>
              ) : null}
            </FormLabel>
            <Textarea
              type="text"
              height="40"
              value={values.introduce}
              background="white"
              name="introduce"
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </FormControl>
          <FormControl
            className={clsx(
              createNewUserStyles.input_wrapper,
              createNewUserStyles.edit_tags_button_wrapper,
            )}>
            <Button
              size="md"
              colorScheme="teal"
              onClick={() => {
                dispatchModal({ type: 'openTech' });
              }}>
              技術を編集
            </Button>
          </FormControl>
          <div className={createNewUserStyles.selected_tags_wrapper}>
            {values.tags
              ?.filter((t) => t.type === TagType.TECH)
              .map((t) => (
                <Button
                  key={t.id}
                  colorScheme="teal"
                  className={createNewUserStyles.selected_tag_item}
                  height="28px">
                  {t.name}
                </Button>
              ))}
          </div>
          <FormControl
            className={clsx(
              createNewUserStyles.input_wrapper,
              createNewUserStyles.edit_tags_button_wrapper,
            )}>
            <Button
              size="md"
              colorScheme="blue"
              onClick={() => dispatchModal({ type: 'openQualification' })}>
              資格を編集
            </Button>
          </FormControl>
          <div className={createNewUserStyles.selected_tags_wrapper}>
            {values.tags
              ?.filter((t) => t.type === TagType.QUALIFICATION)
              .map((t) => (
                <Button
                  key={t.id}
                  colorScheme="blue"
                  className={createNewUserStyles.selected_tag_item}
                  height="28px">
                  {t.name}
                </Button>
              ))}
          </div>
          <FormControl
            className={clsx(
              createNewUserStyles.input_wrapper,
              createNewUserStyles.edit_tags_button_wrapper,
            )}>
            <Button
              size="md"
              colorScheme="green"
              onClick={() => dispatchModal({ type: 'openClub' })}>
              部活動を編集
            </Button>
          </FormControl>
          <div className={createNewUserStyles.selected_tags_wrapper}>
            {values.tags
              ?.filter((t) => t.type === TagType.CLUB)
              .map((t) => (
                <Button
                  key={t.id}
                  colorScheme="green"
                  className={createNewUserStyles.selected_tag_item}
                  height="28px">
                  {t.name}
                </Button>
              ))}
          </div>
          <FormControl
            className={clsx(
              createNewUserStyles.input_wrapper,
              createNewUserStyles.edit_tags_button_wrapper,
            )}>
            <Button
              size="md"
              colorScheme="pink"
              onClick={() => dispatchModal({ type: 'openHobby' })}>
              趣味を編集
            </Button>
          </FormControl>
          <div className={createNewUserStyles.selected_tags_wrapper}>
            {values.tags
              ?.filter((t) => t.type === TagType.HOBBY)
              .map((t) => (
                <Button
                  key={t.id}
                  colorScheme="pink"
                  className={createNewUserStyles.selected_tag_item}
                  height="28px">
                  {t.name}
                </Button>
              ))}
          </div>
        </div>
      </div>
      <div className={createNewUserStyles.finish_button_wrapper}>
        <Button
          className={createNewUserStyles.update_button_wrapper}
          width="40"
          colorScheme="blue"
          onClick={() => handleSubmit()}>
          作成
        </Button>
      </div>
    </LayoutWithTab>
  );
};

export default CreateNewUser;
