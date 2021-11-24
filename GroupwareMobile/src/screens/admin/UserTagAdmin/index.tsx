import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {ActivityIndicator, Alert, useWindowDimensions} from 'react-native';
import {Overlay, ScrollDiv} from 'react-native-magnus';
import TagCollapse from '../../../components/admin/TagCollapse';
import HeaderWithTextButton, {Tab} from '../../../components/Header';
import WholeContainer from '../../../components/WholeContainer';
import {useAPICreateUserTag} from '../../../hooks/api/tag/useAPICreateUesrTag';
import {useAPIDeleteUserTag} from '../../../hooks/api/tag/useAPIDelteUserTag';
import {useAPIGetUserTag} from '../../../hooks/api/tag/useAPIGetUserTag';
import {useTagType} from '../../../hooks/tag/useTagType';
import {tagAdminStyles} from '../../../styles/screen/admin/tagAdmin.style';
import {TagType, UserTag} from '../../../types';
import {UserTagAdminNavigationProps} from '../../../types/navigator/drawerScreenProps';

const UserTagAdmin: React.FC = () => {
  const navigation = useNavigation<UserTagAdminNavigationProps>();
  const {data: tags, refetch, isLoading: loadingTags} = useAPIGetUserTag();
  const {mutate: createTag, isLoading: loadingCreateTag} = useAPICreateUserTag({
    onSuccess: () => {
      refetch();
    },
  });
  const {mutate: deleteTag, isLoading: loadingDeleteTag} = useAPIDeleteUserTag({
    onSuccess: () => {
      refetch();
    },
  });
  const isLoading = loadingTags || loadingCreateTag || loadingDeleteTag;
  const {filteredTags: techTags} = useTagType(TagType.TECH, tags || []);
  const {width: windowWidth} = useWindowDimensions();
  const {filteredTags: qualificationTags} = useTagType(
    TagType.QUALIFICATION,
    tags || [],
  );
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
  const modifiedTags: UserTag[] =
    tags?.map(t => ({...t, name: modifyStrToFlat(t.name)})) || [];

  const tabs: Tab[] = [
    {
      name: 'ユーザー管理',
      onPress: () => navigation.navigate('AdminStack', {screen: 'UserAdmin'}),
    },
    {
      name: 'ユーザー作成',
      onPress: () =>
        navigation.navigate('AdminStack', {screen: 'UserRegisteringAdmin'}),
    },
    {
      name: 'タグ管理',
      onPress: () => navigation.navigate('AdminStack', {screen: 'TagAdmin'}),
    },
    {
      name: 'タグ管理(ユーザー)',
      onPress: () => {},
    },
    {
      name: 'CSV出力',
      onPress: () => {},
    },
  ];

  const handleDelete = (t: UserTag) => {
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

  const handleCreate = (t: Partial<UserTag>) => {
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
      <HeaderWithTextButton
        title={'タグ管理'}
        tabs={tabs}
        activeTabName={'タグ管理(ユーザー)'}
      />
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

export default UserTagAdmin;
