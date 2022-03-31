import React, { useState } from 'react';
import { SidebarScreenName } from '@/components/layout/Sidebar';
import { Tab } from 'src/types/header/tab/types';
import LayoutWithTab from '@/components/layout/LayoutWithTab';
import { useAPIUpdateUser } from '@/hooks/api/user/useAPIUpdateUser';
import { User } from 'src/types';
import { useToast } from '@chakra-ui/react';
import { useAPIUploadStorage } from '@/hooks/api/storage/useAPIUploadStorage';
import Head from 'next/head';
import { useHeaderTab } from '@/hooks/headerTab/useHeaderTab';
import { useAPIGetUserTag } from '@/hooks/api/tag/useAPIGetUserTag';
import { useRouter } from 'next/router';
import { useAPIGetUserInfoById } from '@/hooks/api/user/useAPIGetUserInfoById';
import ProfileForm from 'src/templates/account/ProfileForm';

const Profile = () => {
  const router = useRouter();
  const toast = useToast();
  const { id } = router.query as { id: string };
  const { data: profile } = useAPIGetUserInfoById(id);
  const { data: tags } = useAPIGetUserTag();
  const [userInfo, setUserInfo] = useState<Partial<User> | undefined>();

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

  const { mutate: updateUser, isLoading: loadigUpdateUser } = useAPIUpdateUser({
    onSuccess: (responseData) => {
      if (responseData) {
        toast({
          title: 'プロフィールを更新しました。',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        router.back();
      }
    },
  });

  const tabs: Tab[] = useHeaderTab({ headerTabType: 'admin' });

  const isLoading = loadigUpdateUser || loadingUplaod;

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: SidebarScreenName.ADMIN }}
      header={{
        title: 'Admin',
        tabs,
      }}>
      <Head>
        <title>ボールド | プロフィール編集</title>
      </Head>
      <ProfileForm
        profile={profile}
        tags={tags}
        isLoading={isLoading}
        saveUser={updateUser}
        uploadImage={uploadImage}
        setUserInfoProps={setUserInfo}
      />
    </LayoutWithTab>
  );
};
export default Profile;
