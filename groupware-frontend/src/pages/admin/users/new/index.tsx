import LayoutWithTab from '@/components/layout/LayoutWithTab';
import { SidebarScreenName } from '@/components/layout/Sidebar';
import React, { useEffect, useState } from 'react';
import { Tab } from 'src/types/header/tab/types';
import Head from 'next/head';
import { User, UserRole } from 'src/types';
import { useAPIUploadStorage } from '@/hooks/api/storage/useAPIUploadStorage';
import { Progress, useToast } from '@chakra-ui/react';
import { useAPIRegister } from '@/hooks/api/auth/useAPIRegister';
import { useAPIGetUserTag } from '@/hooks/api/tag/useAPIGetUserTag';
import { useHeaderTab } from '@/hooks/headerTab/useHeaderTab';
import { useRouter } from 'next/router';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import ProfileForm from 'src/templates/account/ProfileForm';

const CreateNewUser = () => {
  const toast = useToast();
  const router = useRouter();
  const { data: tags } = useAPIGetUserTag();
  const { user } = useAuthenticate();
  const [loadingUserRole, setLoadingUserRole] = useState(true);
  const [userInfo, setUserInfo] = useState<Partial<User> | undefined>();

  const { mutate: uploadImage, isLoading: loadingUplaod } = useAPIUploadStorage(
    {
      onSuccess: async (fileURLs) => {
        const updateEventImageOnState = async () => {
          Promise.resolve();
          setUserInfo((e) => ({ ...e, avatarUrl: fileURLs[0] }));
        };
        await updateEventImageOnState();
        registerUser({ ...userInfo, avatarUrl: fileURLs[0] });
      },
    },
  );

  const { mutate: registerUser, isLoading: loadingRegister } = useAPIRegister({
    onSuccess: (responseData) => {
      if (responseData) {
        const tempPassword: string = userInfo?.password || '';
        toast({
          title: `${responseData.lastName} ${responseData.firstName}さんのアカウントを作成しました`,
          description: `パスワード: ${tempPassword}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        const wait = new Promise((resolve) => {
          setTimeout(resolve, 3000);
        });
        wait.then(() => location.reload());
      }
    },
  });

  const tabs: Tab[] = useHeaderTab({ headerTabType: 'admin' });

  const isLoading = loadingRegister || loadingUplaod;

  useEffect(() => {
    if (user?.role !== UserRole.ADMIN) {
      router.back();
      return;
    }
    setLoadingUserRole(false);
  }, [user, router]);

  if (loadingUserRole) {
    return <Progress isIndeterminate size="lg" />;
  }

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
      <ProfileForm
        tags={tags}
        isLoading={isLoading}
        saveUser={registerUser}
        uploadImage={uploadImage}
        setUserInfoProps={setUserInfo}
      />
    </LayoutWithTab>
  );
};

export default CreateNewUser;
