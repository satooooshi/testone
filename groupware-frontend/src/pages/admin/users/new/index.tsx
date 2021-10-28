import LayoutWithTab from '@/components/layout/LayoutWithTab';
import { SidebarScreenName } from '@/components/layout/Sidebar';
import React, { useCallback, useMemo, useReducer, useRef } from 'react';
import { Tab } from 'src/types/header/tab/types';
import Head from 'next/head';
import Image from 'next/image';
import { TagType, User, UserRole, UserTag } from 'src/types';
import { useAPIUploadStorage } from '@/hooks/api/storage/useAPIUploadStorage';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { imageExtensions } from 'src/utils/imageExtensions';
import noImage from '@/public/no-image.jpg';
import { useAPIRegister } from '@/hooks/api/auth/useAPIRegister';
import createNewUserStyles from '@/styles/layouts/admin/CreateNewUser.module.scss';
import { toggleTag } from 'src/utils/toggleTag';
import TagModal from '@/components/common/TagModal';
import { useAPIGetUserTag } from '@/hooks/api/tag/useAPIGetUserTag';
import { useFormik } from 'formik';
import { registerSchema } from 'src/utils/validation/schema';
import validationErrorStyles from '@/styles/components/ValidationError.module.scss';
import ReactCrop from 'react-image-crop';
import { dataURLToFile } from 'src/utils/dataURLToFile';
import { useImageCrop } from '@/hooks/crop/useImageCrop';
import { useHeaderTab } from '@/hooks/headerTab/useHeaderTab';
import { userRoleNameFactory } from 'src/utils/factory/userRoleNameFactory';
import FormToLinkTag from '@/components/FormToLinkTag';

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
  const initialUserValues: Partial<User> = {
    email: '',
    lastName: '',
    firstName: '',
    password: '',
    role: UserRole.COMMON,
    avatarUrl: '',
    employeeId: '',
    introduceOther: '',
    introduceTech: '',
    introduceClub: '',
    introduceHobby: '',
    introduceQualification: '',
    verifiedAt: new Date(),
    tags: [],
  };
  const {
    errors,
    touched,
    handleSubmit,
    handleChange,
    handleBlur,
    setValues: setUserInfo,
    values,
    resetForm,
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
        resetForm();
        setUserInfo(initialUserValues);
      }
    },
  });

  const tabs: Tab[] = useHeaderTab({ headerTabType: 'admin' });

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
        activeScreenName: SidebarScreenName.ADMIN,
      }}
      header={{
        title: '新規ユーザー作成',
        tabs: tabs,
        activeTabName: 'ユーザー作成',
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
              <p>社員区分</p>
              {errors.role && touched.role ? (
                <p className={validationErrorStyles.error_text}>
                  {errors.role}
                </p>
              ) : null}
            </FormLabel>
            <Select
              name="role"
              value={values.role}
              colorScheme="teal"
              bg="white"
              onChange={handleChange}
              defaultValue={UserRole.COMMON}>
              <option value={UserRole.ADMIN}>管理者</option>
              <option value={UserRole.EXTERNAL_INSTRUCTOR}>
                {userRoleNameFactory(UserRole.EXTERNAL_INSTRUCTOR)}
              </option>
              <option value={UserRole.INTERNAL_INSTRUCTOR}>
                {userRoleNameFactory(UserRole.INTERNAL_INSTRUCTOR)}
              </option>
              <option value={UserRole.COACH}>コーチ</option>
              <option value={UserRole.COMMON}>一般社員</option>
            </Select>
          </FormControl>
          <FormControl className={createNewUserStyles.input_wrapper}>
            <FormLabel fontWeight={'bold'}>
              <p>社員コード</p>
              {errors.employeeId && touched.employeeId ? (
                <p className={validationErrorStyles.error_text}>
                  {errors.employeeId}
                </p>
              ) : null}
            </FormLabel>
            <Input
              type="text"
              placeholder="社員コード"
              value={values.employeeId || ''}
              background="white"
              name="employeeId"
              onChange={handleChange}
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
          <FormControl mb={4}>
            <FormLabel fontWeight={'bold'}>自己紹介</FormLabel>
            <Textarea
              placeholder="自己紹介を入力してください"
              type="text"
              height="10"
              value={values.introduceOther}
              background="white"
              name="introduceOther"
              onChange={handleChange}
            />
          </FormControl>

          <Box mb={2} w={'100%'}>
            <FormToLinkTag
              tags={values?.tags || []}
              tagType={TagType.TECH}
              onEditButtonClick={() => dispatchModal({ type: 'openTech' })}
            />
          </Box>
          <FormControl mb={6}>
            <FormLabel fontWeight={'bold'}>技術の紹介</FormLabel>
            <Textarea
              placeholder="技術についての紹介を入力してください"
              type="text"
              height="10"
              background="white"
              value={values.introduceTech}
              name="introduceTech"
              onChange={handleChange}
            />
          </FormControl>
          <Box mb={2} w={'100%'}>
            <FormToLinkTag
              tags={values?.tags || []}
              tagType={TagType.QUALIFICATION}
              onEditButtonClick={() =>
                dispatchModal({ type: 'openQualification' })
              }
            />
          </Box>
          <FormControl mb={6}>
            <FormLabel fontWeight={'bold'}>資格の紹介</FormLabel>
            <Textarea
              type="text"
              placeholder="資格についての紹介を入力してください"
              height="10"
              value={values.introduceQualification}
              background="white"
              name="introduceQualification"
              onChange={handleChange}
            />
          </FormControl>
          <Box mb={2} w={'100%'}>
            <FormToLinkTag
              tags={values?.tags || []}
              tagType={TagType.CLUB}
              onEditButtonClick={() => dispatchModal({ type: 'openClub' })}
            />
          </Box>
          <FormControl mb={6}>
            <FormLabel fontWeight={'bold'}>部活動の紹介</FormLabel>
            <Textarea
              type="text"
              placeholder="部活動についての紹介を入力してください"
              height="10"
              value={values.introduceClub}
              background="white"
              name="introduceClub"
              onChange={handleChange}
            />
          </FormControl>
          <Box mb={2} w={'100%'}>
            <FormToLinkTag
              tags={values?.tags || []}
              tagType={TagType.HOBBY}
              onEditButtonClick={() => dispatchModal({ type: 'openHobby' })}
            />
          </Box>
          <FormControl mb={8}>
            <FormLabel fontWeight={'bold'}>趣味の紹介</FormLabel>
            <Textarea
              placeholder="趣味についての紹介を入力してください"
              type="text"
              height="10"
              value={values.introduceHobby}
              background="white"
              name="introduceHobby"
              onChange={handleChange}
            />
          </FormControl>
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
