import React from 'react';
import {ActivityIndicator, Alert, useWindowDimensions} from 'react-native';
import {Overlay, ScrollDiv} from 'react-native-magnus';
import TagCollapse from '../../../components/admin/TagCollapse';
import AppHeader, {Tab} from '../../../components/Header';
import WholeContainer from '../../../components/WholeContainer';
import {useAPICreateTag} from '../../../hooks/api/tag/useAPICreateTag';
import {useAPIDeleteTag} from '../../../hooks/api/tag/useAPIDeleteTag';
import {useAPIGetTag} from '../../../hooks/api/tag/useAPIGetTag';
import {useTagType} from '../../../hooks/tag/useTagType';
import {tagAdminStyles} from '../../../styles/screen/admin/tagAdmin.style';
import {Tag, TagType} from '../../../types';
import {TagAdminProps} from '../../../types/navigator/screenProps/Admin';

const TagAdmin: React.FC<TagAdminProps> = ({navigation}) => {
  const {data: tags, refetch, isLoading: loadingTags} = useAPIGetTag();
  const {mutate: createTag, isLoading: loadingCreateTag} = useAPICreateTag({
    onSuccess: () => {
      refetch();
    },
  });
  const {mutate: deleteTag, isLoading: loadingDeleteTag} = useAPIDeleteTag({
    onSuccess: () => {
      refetch();
    },
  });
  const {filteredTags: techTags} = useTagType(TagType.TECH, tags || []);
  const {width: windowWidth} = useWindowDimensions();
  const {filteredTags: qualificationTags} = useTagType(
    TagType.QUALIFICATION,
    tags || [],
  );
  const isLoading = loadingTags || loadingCreateTag || loadingDeleteTag;
  const {filteredTags: clubTags} = useTagType(TagType.CLUB, tags || []);
  const {filteredTags: hobbyTags} = useTagType(TagType.HOBBY, tags || []);
  const {filteredTags: otherTags} = useTagType(TagType.OTHER, tags || []);
  const modifyStrToFlat = (targetString: string) => {
    const deleteSymbolFromStr = (str: string) => {
      return str.replace(/[^#+ぁ-んァ-ンーa-zA-Z0-9一-龠０-９\-\r]/g, '');
    };
    const hiraToKana = (str: string) => {
      return str.replace(/[ぁ-ん]/g, s => {
        return String.fromCharCode(s.charCodeAt(0) - 0x60);
      });
    };
    const escaped = deleteSymbolFromStr(targetString);
    const changedToLowerCamel = escaped.toLowerCase();
    const changedToKana = hiraToKana(changedToLowerCamel);
    return changedToKana;
  };
  const modifiedTags: Tag[] =
    tags?.map(t => ({...t, name: modifyStrToFlat(t.name)})) || [];

  const tabs: Tab[] = [
    {
      name: 'ユーザー管理',
      onPress: () => navigation.navigate('UserAdmin'),
    },
    {
      name: 'ユーザー作成',
      onPress: () => navigation.navigate('UserRegisteringAdmin'),
    },
    {
      name: 'タグ管理',
      onPress: () => {},
    },
    {
      name: 'タグ管理(ユーザー)',
      onPress: () => navigation.navigate('UserTagAdmin'),
    },
    {
      name: 'CSV出力',
      onPress: () => {},
    },
  ];

  const handleDelete = (t: Tag) => {
    if (t.name) {
      Alert.alert(`${t.name}を削除してよろしいですか？`, undefined, [
        {
          text: 'はい',
          onPress: () => deleteTag(t),
        },
        {
          text: 'いいえ',
          onPress: () => {},
        },
      ]);
    }
  };

  const handleCreate = (t: Partial<Tag>) => {
    if (!t.name) {
      return;
    }
    const tagNames: string[] = modifiedTags
      .filter(modifiedT => modifiedT.type === t.type)
      .map(filteredT => modifyStrToFlat(filteredT.name)) || [''];
    if (t.name.length >= 60) {
      Alert.alert('タグは60文字以内で入力してください');
      return;
    }
    if (tagNames.includes(modifyStrToFlat(t.name))) {
      Alert.alert('タグがすでに存在します');
      return;
    }
    createTag(t);
  };

  return (
    <WholeContainer>
      <Overlay visible={isLoading} p="xl">
        <ActivityIndicator />
      </Overlay>
      <AppHeader title={'タグ管理'} tabs={tabs} activeTabName={'タグ管理'} />
      <ScrollDiv
        contentContainerStyle={{
          ...tagAdminStyles.scrollView,
          width: windowWidth * 0.9,
        }}>
        <TagCollapse
          tags={techTags || []}
          tagType={TagType.TECH}
          onPressSaveButton={handleCreate}
          onLongPressTag={handleDelete}
          mb={'lg'}
        />
        <TagCollapse
          tags={qualificationTags || []}
          tagType={TagType.QUALIFICATION}
          onPressSaveButton={handleCreate}
          onLongPressTag={handleDelete}
          mb={'lg'}
        />
        <TagCollapse
          tags={clubTags || []}
          tagType={TagType.CLUB}
          onPressSaveButton={handleCreate}
          onLongPressTag={handleDelete}
          mb={'lg'}
        />
        <TagCollapse
          tags={hobbyTags || []}
          tagType={TagType.HOBBY}
          onPressSaveButton={handleCreate}
          onLongPressTag={handleDelete}
          mb={'lg'}
        />
        <TagCollapse
          tags={otherTags || []}
          tagType={TagType.OTHER}
          onPressSaveButton={handleCreate}
          onLongPressTag={handleDelete}
          mb={'lg'}
        />
      </ScrollDiv>
    </WholeContainer>
  );
};

export default TagAdmin;
