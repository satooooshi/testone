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
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
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
import createNewUserStyles from '@/styles/layouts/admin/CreateNewUser.module.scss';
import clsx from 'clsx';
import TagModal from '@/components/common/TagModal';
import { toggleTag } from 'src/utils/toggleTag';
import { useAPIGetUserTag } from '@/hooks/api/tag/useAPIGetUserTag';

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
    introduce: '',
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

  const { mutate: updateUser } = useAPIUpdateUser({
    onSuccess: (responseData) => {
      if (responseData) {
        alert('プロフィールを更新しました。');
        dispatchCrop({ type: 'setImageFile', value: undefined });
      }
    },
  });

  const tabs: Tab[] = useHeaderTab({ headerTabType: 'account', user });

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
          onCancel={() => {
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
              <Image
                className={profileStyles.avatar}
                src={noImage}
                alt="アバター画像"
              />
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
          <FormControl className={profileStyles.input_wrapper}>
            <FormLabel fontWeight={'bold'}>自己紹介</FormLabel>
            <Textarea
              type="text"
              height="40"
              value={userInfo.introduce}
              background="white"
              onChange={(e) =>
                setUserInfo((i) => ({ ...i, introduce: e.target.value }))
              }
            />
          </FormControl>
          <FormControl
            className={clsx(
              createNewUserStyles.input_wrapper,
              createNewUserStyles.edit_tags_button_wrapper,
            )}>
            <div className={createNewUserStyles.selected_tags_wrapper}>
              {userInfo?.tags
                ?.filter((t) => t.type === TagType.TECH)
                .map((t) => (
                  <Button
                    key={t.id}
                    size="xs"
                    colorScheme="teal"
                    className={createNewUserStyles.selected_tag_item}>
                    {t.name}
                  </Button>
                ))}
            </div>
            <Button
              size="sm"
              colorScheme="teal"
              onClick={() => {
                dispatchModal({ type: 'openTech' });
              }}>
              技術を編集
            </Button>
          </FormControl>
          <FormControl
            className={clsx(
              createNewUserStyles.input_wrapper,
              createNewUserStyles.edit_tags_button_wrapper,
            )}>
            <div className={createNewUserStyles.selected_tags_wrapper}>
              {userInfo?.tags
                ?.filter((t) => t.type === TagType.QUALIFICATION)
                .map((t) => (
                  <Button
                    key={t.id}
                    size="xs"
                    colorScheme="blue"
                    className={createNewUserStyles.selected_tag_item}
                    height="28px">
                    {t.name}
                  </Button>
                ))}
            </div>
            <Button
              size="sm"
              colorScheme="blue"
              onClick={() => dispatchModal({ type: 'openQualification' })}>
              資格を編集
            </Button>
          </FormControl>
          <FormControl
            className={clsx(
              createNewUserStyles.input_wrapper,
              createNewUserStyles.edit_tags_button_wrapper,
            )}>
            <div className={createNewUserStyles.selected_tags_wrapper}>
              {userInfo?.tags
                ?.filter((t) => t.type === TagType.CLUB)
                .map((t) => (
                  <Button
                    key={t.id}
                    size="xs"
                    colorScheme="green"
                    className={createNewUserStyles.selected_tag_item}
                    height="28px">
                    {t.name}
                  </Button>
                ))}
            </div>
            <Button
              size="sm"
              colorScheme="green"
              onClick={() => dispatchModal({ type: 'openClub' })}>
              部活動を編集
            </Button>
          </FormControl>
          <FormControl
            className={clsx(
              createNewUserStyles.input_wrapper,
              createNewUserStyles.edit_tags_button_wrapper,
            )}>
            <div className={createNewUserStyles.selected_tags_wrapper}>
              {userInfo?.tags
                ?.filter((t) => t.type === TagType.HOBBY)
                .map((t) => (
                  <Button
                    key={t.id}
                    size="xs"
                    colorScheme="pink"
                    className={createNewUserStyles.selected_tag_item}
                    height="28px">
                    {t.name}
                  </Button>
                ))}
            </div>
            <Button
              size="sm"
              colorScheme="pink"
              onClick={() => dispatchModal({ type: 'openHobby' })}>
              趣味を編集
            </Button>
          </FormControl>
        </div>
      </div>
      <Button
        className={profileStyles.update_button_wrapper}
        width="40"
        colorScheme="blue"
        onClick={handleUpdateUser}>
        更新
      </Button>
    </LayoutWithTab>
  );
};
export default Profile;
