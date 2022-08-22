import React, {
  useCallback,
  useRef,
  useReducer,
  useState,
  useEffect,
} from 'react';
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
  RadioGroup,
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
import { Crop } from 'react-image-crop';
import { useHeaderTab } from '@/hooks/headerTab/useHeaderTab';
import TagModal from '@/components/common/TagModal';
import { toggleTag } from 'src/utils/toggleTag';
import { profileSchema } from 'src/utils/validation/schema';
import { formikErrorMsgFactory } from 'src/utils/factory/formikErrorMsgFactory';
import { useAPIGetUserTag } from '@/hooks/api/tag/useAPIGetUserTag';
import FormToLinkTag from '@/components/FormToLinkTag';
import router from 'next/router';

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
      console.log('selectedImageにファイルを追加しました');
    },
    [dispatchCrop],
  );

  const onChange = (newCrop: Crop) => {
    if (
      newCrop.height !== crop.height ||
      newCrop.width !== crop.width ||
      newCrop.y !== crop.y ||
      newCrop.x !== crop.x
    )
      dispatchCrop({ type: 'setCrop', value: newCrop });
  };

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
      console.log('responeedata: ', responseData);
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

  const tabs: Tab[] = useHeaderTab({ headerTabType: 'account', user });

  const handleUpdateUser = async () => {
    if (!croppedImageURL || !completedCrop || !selectImageName) {
      console.log(
        'croppedImageURL: completedCrop: selectImageName',
        croppedImageURL,
        completedCrop,
        selectImageName,
      );
      await setUserInfo((e) => ({ ...e, avatarUrl: '' }));
      updateUser(userInfo);
      return;
    }
    const result = await dataURLToFile(croppedImageURL, selectImageName);
    uploadImage([result]);
    return;
  };

  const onLoad = useCallback((img) => {
    console.log('ここはいってないんですかー！');
    imgRef.current = img;
    const diameter = img.height < img.width ? img.height : img.width;
    dispatchCrop({
      type: 'setCrop',
      value: {
        unit: 'px',
        x: (img.width - diameter) / 2,
        y: (img.height - diameter) / 2,
        height: diameter,
        width: diameter,
        aspect: 1,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSelectedTag = (t: UserTag) => {
    const toggledTag = toggleTag(userInfo?.tags, t);
    setUserInfo((i) => ({
      ...i,
      tags: toggledTag,
    }));
  };

  const resetImageUrl = async () => {
    await dispatchCrop({
      type: 'resetImage',
      value: 'resetImage',
    });
    setUserInfo((e) => ({ ...e, avatarUrl: '' }));
    console.log(selectImageUrl);

    return;
  };

  const isLoading = loadigUpdateUser || loadingUplaod;

  const renderNoImage = () => {
    return (
      <div
        {...getEventImageRootProps({
          className: profileStyles.image_dropzone,
        })}>
        <input {...getEventImageInputProps()} />
        <div className={profileStyles.next_image_wrapper}>
          <Image
            className={profileStyles.avatar}
            src={noImage}
            alt="アバター画像"
          />
        </div>
      </div>
    );
  };

  const renderUserImage = () => {
    return (
      <div
        {...getEventImageRootProps({
          className: profileStyles.image_dropzone,
        })}>
        <input {...getEventImageInputProps()} />
        <img
          className={profileStyles.avatar}
          src={croppedImageURL ? croppedImageURL : userInfo.avatarUrl}
          alt="アバター画像"
        />
      </div>
    );
  };

  const renderSelectImage = () => {
    console.log('reactcrop使ってるとこ');
    return (
      <>
        <ReactCrop
          keepSelection={true}
          src={selectImageUrl}
          crop={crop}
          onChange={(newCrop) => {
            onChange(newCrop);
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
          imageStyle={{
            minHeight: '300px',
            maxHeight: '1000px',
            minWidth: '300px',
          }}
        />
      </>
    );
  };

  const renderImageArea = () => {
    if (!userInfo.avatarUrl && !selectImageUrl) {
      console.log('2段目');
      return renderNoImage();
    } else if (selectImageUrl) {
      console.log('3段目');
      return renderSelectImage();
    } else {
      console.log('最後');
      return renderUserImage();
    }
  };

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: SidebarScreenName.ACCOUNT }}
      header={{
        title: 'Account',
        activeTabName: 'プロフィール編集',
        tabs,
      }}>
      <Head>
        <title>ボールド | プロフィール編集</title>
      </Head>
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
      <div className={profileStyles.main}>
        <div className={profileStyles.image_wrapper}>
          {renderImageArea()}
          <Button mt="15px" colorScheme="blue" onClick={() => resetImageUrl()}>
            既存画像を削除
          </Button>
        </div>
        <div className={profileStyles.form_wrapper}>
          <FormControl className={profileStyles.input_wrapper}>
            <FormLabel fontWeight={'bold'}>メールアドレス</FormLabel>
            <Input
              type="email"
              name="email"
              placeholder="email@example.com"
              value={userInfo.email}
              background="white"
              onChange={handleChange}
            />
            <Stack spacing={5} direction="row">
              <Radio
                bg="white"
                colorScheme="green"
                isChecked={userInfo.isEmailPublic}
                value={'public'}
                onChange={() =>
                  setUserInfo((v) => ({ ...v, isEmailPublic: true }))
                }>
                公開
              </Radio>
              <Radio
                bg="white"
                colorScheme="green"
                isChecked={!userInfo.isEmailPublic}
                value={'inPublic'}
                onChange={() =>
                  setUserInfo((v) => ({ ...v, isEmailPublic: true }))
                }>
                非公開
              </Radio>
            </Stack>
          </FormControl>
          <FormControl className={profileStyles.input_wrapper}>
            <FormLabel fontWeight={'bold'}>電話番号</FormLabel>
            <Input
              type="phone"
              name="phone"
              placeholder="000-0000-0000"
              background="white"
              value={userInfo.phone}
              onChange={handleChange}
            />
            <Stack spacing={5} direction="row">
              <Radio
                bg="white"
                colorScheme="green"
                isChecked={userInfo.isPhonePublic}
                value={'public'}
                onChange={() =>
                  setUserInfo((v) => ({ ...v, isPhonePublic: true }))
                }>
                公開
              </Radio>
              <Radio
                bg="white"
                colorScheme="green"
                isChecked={!userInfo.isPhonePublic}
                value={'unPublic'}
                onChange={() =>
                  setUserInfo((v) => ({ ...v, isPhonePublic: false }))
                }>
                非公開
              </Radio>
            </Stack>
          </FormControl>
          <FormControl className={profileStyles.input_wrapper}>
            <FormLabel fontWeight={'bold'}>姓</FormLabel>
            <Input
              type="text"
              name="lastName"
              placeholder="山田"
              value={userInfo.lastName}
              background="white"
              onChange={handleChange}
            />
          </FormControl>
          <FormControl className={profileStyles.input_wrapper}>
            <FormLabel fontWeight={'bold'}>名</FormLabel>
            <Input
              type="text"
              name="firstName"
              placeholder="太郎"
              value={userInfo.firstName}
              background="white"
              onChange={handleChange}
            />
          </FormControl>
          <FormControl className={profileStyles.input_wrapper}>
            <FormLabel fontWeight={'bold'}>姓(フリガナ)</FormLabel>
            <Input
              type="text"
              name="lastNameKana"
              placeholder="ヤマダ"
              value={userInfo.lastNameKana}
              background="white"
              onChange={handleChange}
            />
          </FormControl>
          <FormControl className={profileStyles.input_wrapper}>
            <FormLabel fontWeight={'bold'}>名(フリガナ)</FormLabel>
            <Input
              type="text"
              name="firstNameKana"
              placeholder="タロウ"
              value={userInfo.firstNameKana}
              background="white"
              onChange={handleChange}
            />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel fontWeight={'bold'}>所属支社</FormLabel>
            <Select
              name="branch"
              value={userInfo.branch}
              bg="white"
              height="10"
              onChange={handleChange}>
              <option value={BranchType.NON_SET}>未設定</option>
              <option value={BranchType.TOKYO}>東京</option>
              <option value={BranchType.OSAKA}>大阪</option>
            </Select>
          </FormControl>
          <FormControl mb={4}>
            <FormLabel fontWeight={'bold'}>自己紹介</FormLabel>
            <Textarea
              type="text"
              name="introduceOther"
              height="10"
              placeholder="自己紹介を入力してください"
              value={userInfo.introduceOther}
              background="white"
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
            <FormLabel fontWeight={'bold'}>技術の紹介</FormLabel>
            <Textarea
              placeholder="技術についての紹介を入力してください"
              type="text"
              name="introduceTech"
              height="10"
              value={userInfo.introduceTech}
              background="white"
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
            <FormLabel fontWeight={'bold'}>資格の紹介</FormLabel>
            <Textarea
              placeholder="資格についての紹介を入力してください"
              type="text"
              name="introduceQualification"
              height="10"
              value={userInfo.introduceQualification}
              background="white"
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
            <FormLabel fontWeight={'bold'}>部活動の紹介</FormLabel>
            <Textarea
              placeholder="部活動についての紹介を入力してください"
              type="text"
              name="introduceClub"
              height="10"
              value={userInfo.introduceClub}
              background="white"
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
            <FormLabel fontWeight={'bold'}>趣味の紹介</FormLabel>
            <Textarea
              placeholder="趣味についての紹介を入力してください"
              type="text"
              name="introduceHobby"
              height="10"
              value={userInfo.introduceHobby}
              background="white"
              onChange={handleChange}
            />
          </FormControl>
        </div>
      </div>
      <Button
        className={profileStyles.update_button_wrapper}
        width="40"
        colorScheme="blue"
        onClick={() => {
          checkErrors();
        }}>
        {isLoading ? <Spinner /> : <Text>更新</Text>}
      </Button>
    </LayoutWithTab>
  );
};
export default Profile;
