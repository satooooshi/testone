import { Tab } from 'src/types/header/tab/types';
import LayoutWithTab from '@/components/layout/LayoutWithTab';
import { SidebarScreenName } from '@/components/layout/Sidebar';
import React from 'react';
import { Tag, TagType, UserRole, UserTag } from 'src/types';
import Head from 'next/head';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import { useHeaderTab } from '@/hooks/headerTab/useHeaderTab';
import tagAdminStyles from '@/styles/layouts/admin/TagAdmin.module.scss';
import { useAPIGetTag } from '@/hooks/api/tag/useAPIGetTag';
import TagListBox from '@/components/admin/TagListCard';
import { useAPICreateTag } from '@/hooks/api/tag/useAPICreateTag';
import { useAPIDeleteTag } from '@/hooks/api/tag/useAPIDeleteTag';
import { useToast } from '@chakra-ui/react';

const TagAdmin: React.FC = () => {
  const toast = useToast();
  const { user } = useAuthenticate();
  const { data: tags, refetch } = useAPIGetTag();
  const modifyStrToFlat = (targetString: string) => {
    const deleteSymbolFromStr = (str: string) => {
      return str.replace(/[^#+ぁ-んァ-ンーa-zA-Z0-9一-龠０-９\-\r]/g, '');
    };
    const hiraToKana = (str: string) => {
      return str.replace(/[ぁ-ん]/g, (s) => {
        return String.fromCharCode(s.charCodeAt(0) - 0x60);
      });
    };
    const escaped = deleteSymbolFromStr(targetString);
    const changedToLowerCamel = escaped.toLowerCase();
    const changedToKana = hiraToKana(changedToLowerCamel);
    return changedToKana;
  };
  const modifiedTags: Tag[] =
    tags?.map((t) => ({ ...t, name: modifyStrToFlat(t.name) })) || [];
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
  const tabs: Tab[] = useHeaderTab({
    headerTabType: user?.role === UserRole.ADMIN ? 'admin' : 'tagEdit',
  });

  const handleCreate = (t: Partial<UserTag | Tag>) => {
    if (!t.name) {
      return;
    }
    const tagNames: string[] = modifiedTags
      .filter((modifiedT) => modifiedT.type === t.type)
      .map((t) => modifyStrToFlat(t.name)) || [''];
    if (t.name.length >= 60) {
      toast({
        description: 'タグは60文字以内で入力してください',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (tagNames.includes(modifyStrToFlat(t.name))) {
      toast({
        description: 'タグがすでに存在します',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    createTag(t);
  };

  return (
    <LayoutWithTab
      sidebar={{
        activeScreenName:
          user?.role === UserRole.ADMIN
            ? SidebarScreenName.ADMIN
            : SidebarScreenName.TAGADMIN,
      }}
      header={{
        title: 'Admin',
        activeTabName: 'タグ管理',
        tabs,
      }}>
      <Head>
        <title>りゅう鍼灸整骨院 | タグ管理</title>
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
