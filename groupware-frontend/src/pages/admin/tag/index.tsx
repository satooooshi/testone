import { Tab } from 'src/types/header/tab/types';
import LayoutWithTab from '@/components/layout/LayoutWithTab';
import { SidebarScreenName } from '@/components/layout/Sidebar';
import React, { useEffect } from 'react';
import { Tag, TagType, UserRole, UserTag } from 'src/types';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import { useHeaderTab } from '@/hooks/headerTab/useHeaderTab';
import tagAdminStyles from '@/styles/layouts/admin/TagAdmin.module.scss';
import { useAPIGetTag } from '@/hooks/api/tag/useAPIGetTag';
import TagListBox from '@/components/admin/TagListCard';
import { useAPICreateTag } from '@/hooks/api/tag/useAPICreateTag';
import { useAPIDeleteTag } from '@/hooks/api/tag/useAPIDeleteTag';

const TagAdmin: React.FC = () => {
  const router = useRouter();
  const { user } = useAuthenticate();
  const { data: tags, refetch } = useAPIGetTag();
  const { mutate: createTag } = useAPICreateTag({
    onSuccess: () => {
      refetch();
    },
  });
  const { mutate: deleteTag } = useAPIDeleteTag({
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

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: SidebarScreenName.ADMIN }}
      header={{
        title: 'Admin',
        activeTabName: 'タグ管理',
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
        {user?.role === UserRole.ADMIN && (
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
        )}
        {user?.role === UserRole.ADMIN && (
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
        )}
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
        {user?.role === UserRole.ADMIN && (
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
        )}
      </div>
    </LayoutWithTab>
  );
};

export default TagAdmin;
