import React, { useCallback, useRef, useReducer } from 'react';
import { SidebarScreenName } from '@/components/layout/Sidebar';
import { Tab } from 'src/types/header/tab/types';
import LayoutWithTab from '@/components/layout/LayoutWithTab';
import profileStyles from '@/styles/layouts/Profile.module.scss';
import { useAPIUpdateUser } from '@/hooks/api/user/useAPIUpdateUser';
import { TagType, User, UserTag, BranchType } from 'src/types';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Spinner,
  Textarea,
  Select,
  useToast,
  Text,
  Radio,
  Stack,
} from '@chakra-ui/react';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import { imageExtensions } from 'src/utils/imageExtensions';
import { useDropzone } from 'react-dropzone';
import { useFormik } from 'formik';
import Image from 'next/image';
import noImage from '@/public/no-image.jpg';
import { useAPIUploadStorage } from '@/hooks/api/storage/useAPIUploadStorage';
import Head from 'next/head';
import ReactCrop from 'react-image-crop';
import { dataURLToFile } from 'src/utils/dataURLToFile';
import { useAPIGetProfile } from '@/hooks/api/user/useAPIGetProfile';
import { useImageCrop } from '@/hooks/crop/useImageCrop';
import TagModal from '@/components/common/TagModal';
import { toggleTag } from 'src/utils/toggleTag';
import { profileSchema } from 'src/utils/validation/schema';
import { formikErrorMsgFactory } from 'src/utils/factory/formikErrorMsgFactory';
import { useAPIGetUserTag } from '@/hooks/api/tag/useAPIGetUserTag';
import FormToLinkTag from '@/components/FormToLinkTag';
import router from 'next/router';
import { AiOutlineArrowLeft } from 'react-icons/ai';

type ModalState = {
  isOpen: boolean;
  filteredTagType?: TagType;
};

type ModalAction = {
  type: 'openTech' | 'openQualification' | 'openClub' | 'openHobby' | 'close';
};

const Profile = () => {
  const { data: profile } = useAPIGetProfile();
  const { user } = useAuthenticate();
  const { data: tags } = useAPIGetUserTag();
  const initialUserValues = {
    email: '',
    isEmailPublic: false,
    phone: '',
    isPhonePublic: false,
    lastName: '',
    firstName: '',
    lastNameKana: '',
    firstNameKana: '',
    branch: BranchType.NON_SET,
    avatarUrl: '',
    introduceOther: '',
    introduceTech: '',
    introduceQualification: '',
    introduceClub: '',
    introduceHobby: '',
  };

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

  const { mutate: uploadImage, isLoading: loadingUplaod } = useAPIUploadStorage(
    {
      onSuccess: async (fileURLs) => {
        const updateEventImageOnState = async () => {
          Promise.resolve();
          setUserInfo((e) => ({ ...e, avatarUrl: fileURLs[0] }));
        };
        await updateEventImageOnState();
        updateUser({ ...userInfo, avatarUrl: fileURLs[0] });
      },
    },
  );
  const [
    {
      crop,
      completedCrop,
      croppedImageURL,
      imageName: selectImageName,
      imageURL: selectImageUrl,
    },
    dispatchCrop,
  ] = useImageCrop();
  const imgRef = useRef<HTMLImageElement | null>(null);

  const onEventImageDrop = useCallback(
    (f: File[]) => {
      dispatchCrop({ type: 'setImageFile', value: f[0] });
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
  const toast = useToast();

  const checkErrors = async () => {
    const errors = await validateForm();
    const messages = formikErrorMsgFactory(errors);
    if (messages) {
      toast({
        title: messages,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } else {
      onFinish();
    }
  };

  const {
    values: userInfo,
    setValues: setUserInfo,
    handleSubmit: onFinish,
    handleChange,
    validateForm,
  } = useFormik<Partial<User>>({
    initialValues: profile ? profile : initialUserValues,
    enableReinitialize: true,
    validationSchema: profileSchema,
    onSubmit: () => {
      handleUpdateUser();
    },
  });

  const { mutate: updateUser, isLoading: loadigUpdateUser } = useAPIUpdateUser({
    onSuccess: (responseData) => {
      if (responseData) {
        toast({
          title: 'プロフィールを更新しました。',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        dispatchCrop({ type: 'setImageFile', value: undefined });
        router.push(`/account/${responseData.id.toString()}`);
      }
    },
  });

  const handleUpdateUser = async () => {
    if (!croppedImageURL || !completedCrop || !selectImageName) {
      updateUser(userInfo);
      return;
    }
    const result = await dataURLToFile(croppedImageURL, selectImageName);
    uploadImage([result]);
    return;
  };

  const onLoad = useCallback((img) => {
    imgRef.current = img;
  }, []);

  const toggleSelectedTag = (t: UserTag) => {
    const toggledTag = toggleTag(userInfo?.tags, t);
    setUserInfo((i) => ({
      ...i,
      tags: toggledTag,
    }));
  };

  const isLoading = loadigUpdateUser || loadingUplaod;

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: SidebarScreenName.ACCOUNT }}
      header={{
        title: 'Account',
        activeTabName: 'プロフィール編集',
      }}>
      <Head>
        <title>ボールド | プロフィール編集</title>
      </Head>
      <Box w="100%" mt="20px" mb="40px">
        <Button bg="white" w="120px" onClick={() => router.back()}>
          <Box mr="10px">
            <AiOutlineArrowLeft size="20px" />
          </Box>
          <Text fontSize="14px">戻る</Text>
        </Button>
      </Box>
      {tags && (
        <TagModal
          isOpen={isOpen}
          isSearch={false}
          tags={tags}
          selectedTags={userInfo?.tags || []}
          filteredTagType={filteredTagType}
          toggleTag={toggleSelectedTag}
          onClear={() => {
            dispatchModal({ type: 'close' });
          }}
          onComplete={() => dispatchModal({ type: 'close' })}
        />
      )}
      <Box className={profileStyles.image_wrapper}>
        {!selectImageUrl ? (
          <div
            {...getEventImageRootProps({
              className: profileStyles.image_dropzone,
            })}>
            <input {...getEventImageInputProps()} />
            {userInfo.avatarUrl && (
              <img
                className={profileStyles.avatar}
                src={croppedImageURL ? croppedImageURL : userInfo.avatarUrl}
                alt="アバター画像"
              />
            )}
            {!userInfo.avatarUrl && (
              <div className={profileStyles.next_image_wrapper}>
                <Image
                  className={profileStyles.avatar}
                  src={noImage}
                  alt="アバター画像"
                />
              </div>
            )}
          </div>
        ) : null}
        {selectImageUrl ? (
          <ReactCrop
            keepSelection={true}
            src={selectImageUrl}
            crop={crop}
            onChange={(newCrop) => {
              dispatchCrop({ type: 'setCrop', value: newCrop });
            }}
            onComplete={(c) => {
              dispatchCrop({
                type: 'setCompletedCrop',
                value: c,
                ref: imgRef.current,
              });
            }}
            onImageLoaded={onLoad}
            circularCrop={true}
          />
        ) : null}
      </Box>
      <Box className={profileStyles.form_wrapper}>
        <Stack direction="row" w="100%">
          <FormControl className={profileStyles.input_wrapper}>
            <FormLabel fontWeight={'bold'} fontSize="14px">
              姓
            </FormLabel>
            <Input
              type="text"
              name="lastName"
              placeholder="山田"
              value={userInfo.lastName}
              background="white"
              border="none"
              onChange={handleChange}
            />
          </FormControl>
          <FormControl className={profileStyles.input_wrapper}>
            <FormLabel fontWeight={'bold'} fontSize="14px">
              名
            </FormLabel>
            <Input
              type="text"
              name="firstName"
              placeholder="太郎"
              value={userInfo.firstName}
              background="white"
              border="none"
              onChange={handleChange}
            />
          </FormControl>
        </Stack>
        <Stack direction="row" w="100%">
          <FormControl className={profileStyles.input_wrapper}>
            <FormLabel fontWeight={'bold'} fontSize="14px">
              セイ
            </FormLabel>
            <Input
              type="text"
              name="lastNameKana"
              placeholder="ヤマダ"
              value={userInfo.lastNameKana}
              background="white"
              border="none"
              onChange={handleChange}
            />
          </FormControl>

          <FormControl className={profileStyles.input_wrapper}>
            <FormLabel fontWeight={'bold'} fontSize="14px">
              メイ
            </FormLabel>
            <Input
              type="text"
              name="firstNameKana"
              placeholder="タロウ"
              value={userInfo.firstNameKana}
              background="white"
              border="none"
              onChange={handleChange}
            />
          </FormControl>
        </Stack>
        <FormControl className={profileStyles.input_wrapper}>
          <FormLabel fontWeight={'bold'} fontSize="14px">
            メールアドレス
          </FormLabel>
          <Input
            type="email"
            name="email"
            placeholder="email@example.com"
            value={userInfo.email}
            background="white"
            border="none"
            onChange={handleChange}
          />
          <Stack spacing={5} direction="row" mt="8px">
            <Radio
              bg="white"
              colorScheme="blue"
              isChecked={userInfo.isEmailPublic}
              value={'public'}
              onChange={() =>
                setUserInfo((v) => ({ ...v, isEmailPublic: true }))
              }>
              <Text fontSize="14px">公開</Text>
            </Radio>
            <Radio
              bg="white"
              colorScheme="blue"
              isChecked={!userInfo.isEmailPublic}
              value={'inPublic'}
              onChange={() =>
                setUserInfo((v) => ({ ...v, isEmailPublic: true }))
              }>
              <Text fontSize="14px">非公開</Text>
            </Radio>
          </Stack>
        </FormControl>
        <FormControl className={profileStyles.input_wrapper}>
          <FormLabel fontWeight={'bold'} fontSize="14px">
            電話番号
          </FormLabel>
          <Input
            type="phone"
            name="phone"
            placeholder="000-0000-0000"
            background="white"
            border="none"
            value={userInfo.phone}
            onChange={handleChange}
          />
          <Stack spacing={5} direction="row" mt="8px">
            <Radio
              bg="white"
              colorScheme="blue"
              isChecked={userInfo.isPhonePublic}
              value={'public'}
              onChange={() =>
                setUserInfo((v) => ({ ...v, isPhonePublic: true }))
              }>
              <Text fontSize="14px">公開</Text>
            </Radio>
            <Radio
              bg="white"
              colorScheme="blue"
              isChecked={!userInfo.isPhonePublic}
              value={'unPublic'}
              onChange={() =>
                setUserInfo((v) => ({ ...v, isPhonePublic: false }))
              }>
              <Text fontSize="14px">非公開</Text>
            </Radio>
          </Stack>
        </FormControl>
        <FormControl mb={4}>
          <FormLabel fontWeight={'bold'} fontSize="14px">
            所属支社
          </FormLabel>
          <Select
            name="branch"
            value={userInfo.branch}
            bg="white"
            border="none"
            height="10"
            onChange={handleChange}>
            <option value={BranchType.NON_SET}>未設定</option>
            <option value={BranchType.TOKYO}>東京</option>
            <option value={BranchType.OSAKA}>大阪</option>
          </Select>
        </FormControl>
        <FormControl mb={4}>
          <FormLabel fontWeight={'bold'} fontSize="14px">
            自己紹介
          </FormLabel>
          <Textarea
            type="text"
            name="introduceOther"
            height="10"
            placeholder="自己紹介を入力してください"
            value={userInfo.introduceOther}
            background="white"
            border="none"
            onChange={handleChange}
          />
        </FormControl>
        <Box mb={2} w={'100%'}>
          <FormToLinkTag
            tags={userInfo?.tags || []}
            tagType={TagType.TECH}
            toggleTag={toggleSelectedTag}
            onEditButtonClick={() => dispatchModal({ type: 'openTech' })}
          />
        </Box>
        <FormControl mb={6}>
          <FormLabel fontWeight={'bold'} fontSize="14px">
            技術の紹介
          </FormLabel>
          <Textarea
            placeholder="技術についての紹介を入力してください"
            type="text"
            name="introduceTech"
            height="10"
            value={userInfo.introduceTech}
            background="white"
            border="none"
            onChange={handleChange}
          />
        </FormControl>
        <Box mb={2} w={'100%'}>
          <FormToLinkTag
            tags={userInfo?.tags || []}
            tagType={TagType.QUALIFICATION}
            toggleTag={toggleSelectedTag}
            onEditButtonClick={() =>
              dispatchModal({ type: 'openQualification' })
            }
          />
        </Box>
        <FormControl mb={6}>
          <FormLabel fontWeight={'bold'} fontSize="14px">
            資格の紹介
          </FormLabel>
          <Textarea
            placeholder="資格についての紹介を入力してください"
            type="text"
            name="introduceQualification"
            height="10"
            value={userInfo.introduceQualification}
            background="white"
            border="none"
            onChange={handleChange}
          />
        </FormControl>
        <Box mb={2} w={'100%'}>
          <FormToLinkTag
            tags={userInfo?.tags || []}
            tagType={TagType.CLUB}
            toggleTag={toggleSelectedTag}
            onEditButtonClick={() => dispatchModal({ type: 'openClub' })}
          />
        </Box>
        <FormControl mb={6}>
          <FormLabel fontWeight={'bold'} fontSize="14px">
            部活動の紹介
          </FormLabel>
          <Textarea
            placeholder="部活動についての紹介を入力してください"
            type="text"
            name="introduceClub"
            height="10"
            value={userInfo.introduceClub}
            background="white"
            border="none"
            onChange={handleChange}
          />
        </FormControl>
        <Box mb={2} w={'100%'}>
          <FormToLinkTag
            tags={userInfo?.tags || []}
            tagType={TagType.HOBBY}
            toggleTag={toggleSelectedTag}
            onEditButtonClick={() => dispatchModal({ type: 'openHobby' })}
          />
        </Box>
        <FormControl mb={8}>
          <FormLabel fontWeight={'bold'} fontSize="14px">
            趣味の紹介
          </FormLabel>
          <Textarea
            placeholder="趣味についての紹介を入力してください"
            type="text"
            name="introduceHobby"
            height="10"
            value={userInfo.introduceHobby}
            background="white"
            border="none"
            onChange={handleChange}
          />
        </FormControl>
      </Box>
      <Button
        className={profileStyles.update_button_wrapper}
        width="25%"
        rounded="full"
        colorScheme="blue"
        onClick={() => {
          checkErrors();
        }}>
        {isLoading ? <Spinner /> : <Text>保存</Text>}
      </Button>
    </LayoutWithTab>
  );
};
export default Profile;
