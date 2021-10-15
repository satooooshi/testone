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
import { useAPIGetTag } from '@/hooks/api/tag/useAPIGetTag';
import TagListBox from '@/components/admin/TagListCard';
import { useAPICreateTag } from '@/hooks/api/tag/useAPICreateTag';
import { useAPIDeleteTag } from '@/hooks/api/tag/useAPIDeleteTag';
import { useToast } from '@chakra-ui/react';

const TagAdmin: React.FC = () => {
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuthenticate();
  const { data: tags, refetch } = useAPIGetTag();
  const a = (targetString: string) => {
    const deleteSymbolFromStr = (str: string) => {
      return str.replace(/[^a-zA-Z ]/g, '');
    };
    const hiraToKana = (str: string) => {
      return str.replace(/[\u3041-\u3096]/g, (match) => {
        const chr = match.charCodeAt(0) + 0x60;
        return String.fromCharCode(chr);
      });
    };
    const escaped = deleteSymbolFromStr(targetString);
    const changedToLowerCamel = escaped.toLowerCase();
    const changedToKana = hiraToKana(changedToLowerCamel);
    return changedToKana;
  };
  const tagNames: string[] = tags?.map((t) => a(t.name)) || [''];
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
    if (!t.name) {
      return;
    }
    if (t.name.length >= 60) {
      toast({
        description: 'タグは60文字以内で入力してください',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (tagNames.includes(a(t.name))) {
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

export default TagAdmin;
