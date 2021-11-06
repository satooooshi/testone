import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useReducer,
} from 'react';
import { SidebarScreenName } from '@/components/layout/Sidebar';
import { Tab } from 'src/types/header/tab/types';
import LayoutWithTab from '@/components/layout/LayoutWithTab';
import profileStyles from '@/styles/layouts/Profile.module.scss';
import { useAPIUpdateUser } from '@/hooks/api/user/useAPIUpdateUser';
import { TagType, User, UserTag } from 'src/types';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import { imageExtensions } from 'src/utils/imageExtensions';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import noImage from '@/public/no-image.jpg';
import { useAPIUploadStorage } from '@/hooks/api/storage/useAPIUploadStorage';
import Head from 'next/head';
import ReactCrop from 'react-image-crop';
import { dataURLToFile } from 'src/utils/dataURLToFile';
import { useAPIGetProfile } from '@/hooks/api/user/useAPIGetProfile';
import { useImageCrop } from '@/hooks/crop/useImageCrop';
import { useHeaderTab } from '@/hooks/headerTab/useHeaderTab';
import TagModal from '@/components/common/TagModal';
import { toggleTag } from 'src/utils/toggleTag';
import { useAPIGetUserTag } from '@/hooks/api/tag/useAPIGetUserTag';
import FormToLinkTag from '@/components/FormToLinkTag';

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
  const [userInfo, setUserInfo] = useState<Partial<User>>({
    email: '',
    lastName: '',
    firstName: '',
    avatarUrl: '',
    introduceOther: '',
  });

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

  const { mutate: uploadImage } = useAPIUploadStorage({
    onSuccess: async (fileURLs) => {
      const updateEventImageOnState = async () => {
        Promise.resolve();
        setUserInfo((e) => ({ ...e, avatarUrl: fileURLs[0] }));
      };
      await updateEventImageOnState();
      updateUser({ ...userInfo, avatarUrl: fileURLs[0] });
    },
  });
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
  const displayToast = (
    title: string,
    status?: 'info' | 'warning' | 'success' | 'error',
    duration?: number | null,
    isClosable?: boolean,
  ) => {
    toast({
      title: title,
      status: status,
      duration: duration,
      isClosable: isClosable,
    });
  };

  const { mutate: updateUser } = useAPIUpdateUser({
    onSuccess: (responseData) => {
      if (responseData) {
        const message = 'プロフィールを更新しました。';
        displayToast(message, 'success', 3000, true);
        dispatchCrop({ type: 'setImageFile', value: undefined });
      }
    },
  });

  const tabs: Tab[] = useHeaderTab({ headerTabType: 'account', user });

  const onClickUpdateRegex = () => {
    const emailRegex =
      /^[a-zA-Z0-9]{1}[a-zA-Z0-9_.-]*[a-zA-Z0-9]{1}@{1}[a-zA-Z0-9]{1}[a-zA-Z0-9_-]{1,}\.[a-zA-Z]{1,}$/;

    if (!userInfo.email) {
      const message = 'メールアドレスは必ず入力してください。';
      displayToast(message, 'error', 3000, true);
    } else if (!emailRegex.test(userInfo.email)) {
      const message = '正しいメールアドレスを指定してください。';
      displayToast(message, 'error', 3000, true);
    } else {
      handleUpdateUser();
    }
  };

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

  useEffect(() => {
    if (profile) {
      setUserInfo(profile);
    }
  }, [profile]);

  const toggleSelectedTag = (t: UserTag) => {
    const toggledTag = toggleTag(userInfo?.tags, t);
    setUserInfo((i) => ({
      ...i,
      tags: toggledTag,
    }));
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
          {userInfo.avatarUrl && !selectImageUrl ? (
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
          ) : null}
          {!userInfo.avatarUrl && !selectImageUrl ? (
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
          ) : null}
          {selectImageUrl ? (
            <ReactCrop
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
        </div>
        <div className={profileStyles.form_wrapper}>
          <FormControl className={profileStyles.input_wrapper}>
            <FormLabel fontWeight={'bold'}>メールアドレス</FormLabel>
            <Input
              type="email"
              placeholder="山田"
              value={userInfo.email}
              background="white"
              onChange={(e) =>
                setUserInfo((i) => ({ ...i, email: e.target.value }))
              }
            />
          </FormControl>
          <FormControl className={profileStyles.input_wrapper}>
            <FormLabel fontWeight={'bold'}>姓</FormLabel>
            <Input
              type="text"
              placeholder="山田"
              value={userInfo.lastName}
              background="white"
              onChange={(e) =>
                setUserInfo((i) => ({ ...i, lastName: e.target.value }))
              }
            />
          </FormControl>
          <FormControl className={profileStyles.input_wrapper}>
            <FormLabel fontWeight={'bold'}>名</FormLabel>
            <Input
              type="text"
              placeholder="太郎"
              value={userInfo.firstName}
              background="white"
              onChange={(e) =>
                setUserInfo((i) => ({ ...i, firstName: e.target.value }))
              }
            />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel fontWeight={'bold'}>自己紹介</FormLabel>
            <Textarea
              type="text"
              height="10"
              placeholder="自己紹介を入力してください"
              value={userInfo.introduceOther}
              background="white"
              onChange={(e) =>
                setUserInfo((i) => ({ ...i, introduceOther: e.target.value }))
              }
            />
          </FormControl>
          <Box mb={2} w={'100%'}>
            <FormToLinkTag
              tags={userInfo?.tags || []}
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
              value={userInfo.introduceTech}
              background="white"
              onChange={(e) =>
                setUserInfo((i) => ({ ...i, introduceTech: e.target.value }))
              }
            />
          </FormControl>
          <Box mb={2} w={'100%'}>
            <FormToLinkTag
              tags={userInfo?.tags || []}
              tagType={TagType.QUALIFICATION}
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
              height="10"
              value={userInfo.introduceQualification}
              background="white"
              onChange={(e) =>
                setUserInfo((i) => ({
                  ...i,
                  introduceQualification: e.target.value,
                }))
              }
            />
          </FormControl>
          <Box mb={2} w={'100%'}>
            <FormToLinkTag
              tags={userInfo?.tags || []}
              tagType={TagType.CLUB}
              onEditButtonClick={() => dispatchModal({ type: 'openClub' })}
            />
          </Box>
          <FormControl mb={6}>
            <FormLabel fontWeight={'bold'}>部活動の紹介</FormLabel>
            <Textarea
              placeholder="部活動についての紹介を入力してください"
              type="text"
              height="10"
              value={userInfo.introduceClub}
              background="white"
              onChange={(e) =>
                setUserInfo((i) => ({
                  ...i,
                  introduceClub: e.target.value,
                }))
              }
            />
          </FormControl>
          <Box mb={2} w={'100%'}>
            <FormToLinkTag
              tags={userInfo?.tags || []}
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
              value={userInfo.introduceHobby}
              background="white"
              onChange={(e) =>
                setUserInfo((i) => ({
                  ...i,
                  introduceHobby: e.target.value,
                }))
              }
            />
          </FormControl>
        </div>
      </div>
      <Button
        className={profileStyles.update_button_wrapper}
        width="40"
        colorScheme="blue"
        onClick={onClickUpdateRegex}>
        更新
      </Button>
    </LayoutWithTab>
  );
};
export default Profile;
