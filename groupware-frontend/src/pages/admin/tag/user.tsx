import { Tab } from 'src/types/header/tab/types';
import LayoutWithTab from '@/components/layout/LayoutWithTab';
import { ScreenName } from '@/components/layout/Sidebar';
import React, { useEffect } from 'react';
import { Tag, TagType, UserRole, UserTag } from 'src/types';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import { useHeaderTab } from '@/hooks/headerTab/useHeaderTab';
import tagAdminStyles from '@/styles/layouts/admin/TagAdmin.module.scss';
import { useAPIGetUserTag } from '@/hooks/api/tag/useAPIGetUserTag';
import { useAPICreateUserTag } from '@/hooks/api/tag/useAPICreateUesrTag';
import { useAPIDeleteUserTag } from '@/hooks/api/tag/useAPIDelteUserTag';
import TagListBox from '@/components/admin/TagListCard';

const UserTagAdmin: React.FC = () => {
  const router = useRouter();
  const { user } = useAuthenticate();
  const { data: tags, refetch } = useAPIGetUserTag();
  const { mutate: createTag } = useAPICreateUserTag({
    onSuccess: () => {
      refetch();
    },
  });
  const { mutate: deleteTag } = useAPIDeleteUserTag({
    onSuccess: () => {
      refetch();
    },
  });
  const tabs: Tab[] = useHeaderTab({ headerTabType: 'admin' });

  const handleCreate = (t: Partial<UserTag | Tag>) => {
    if (t.name && t.name.length >= 60) {
      alert('タグは60文字以内で入力してください');
      return;
    }
    createTag(t);
  };

  useEffect(() => {
    if (user?.role !== UserRole.ADMIN) {
      router.back();
    }
  }, [user, router]);

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: ScreenName.ADMIN }}
      header={{
        title: 'Admin',
        activeTabName: 'タグ管理(ユーザー)',
        tabs,
      }}>
      <Head>
        <title>ボールド | タグ管理</title>
      </Head>
      <div className={tagAdminStyles.main}>
        <TagListBox
          tagType={TagType.TECH}
          tags={tags}
          onClickDeleteButton={(t) => {
            if (confirm(`${t.name}を削除します。よろしいですか？`)) {
              deleteTag(t);
            }
          }}
          onClickSaveButton={(t) => handleCreate(t)}
        />
        <TagListBox
          tagType={TagType.QUALIFICATION}
          tags={tags}
          onClickDeleteButton={(t) => {
            if (confirm(`${t.name}を削除します。よろしいですか？`)) {
              deleteTag(t);
            }
          }}
          onClickSaveButton={(t) => handleCreate(t)}
        />
        <TagListBox
          tagType={TagType.CLUB}
          tags={tags}
          onClickDeleteButton={(t) => {
            if (confirm(`${t.name}を削除します。よろしいですか？`)) {
              deleteTag(t);
            }
          }}
          onClickSaveButton={(t) => handleCreate(t)}
        />
        <TagListBox
          tagType={TagType.HOBBY}
          tags={tags}
          onClickDeleteButton={(t) => {
            if (confirm(`${t.name}を削除します。よろしいですか？`)) {
              deleteTag(t);
            }
          }}
          onClickSaveButton={(t) => handleCreate(t)}
        />
        <TagListBox
          tagType={TagType.OTHER}
          tags={tags}
          onClickDeleteButton={(t) => {
            if (confirm(`${t.name}を削除します。よろしいですか？`)) {
              deleteTag(t);
            }
          }}
          onClickSaveButton={(t) => handleCreate(t)}
        />
      </div>
    </LayoutWithTab>
  );
};

export default UserTagAdmin;
