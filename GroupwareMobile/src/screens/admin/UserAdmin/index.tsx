import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
  FlatList,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import {Text, Div, Image, Icon, Dropdown} from 'react-native-magnus';
import DropdownOpenerButton from '../../../components/common/DropdownOpenerButton';
import SearchForm from '../../../components/common/SearchForm';
import SearchFormOpenerButton from '../../../components/common/SearchForm/SearchFormOpenerButton';
import AppHeader, {Tab} from '../../../components/Header';
import WholeContainer from '../../../components/WholeContainer';
import {useAPIGetUserTag} from '../../../hooks/api/tag/useAPIGetUserTag';
import {useAPIDeleteUser} from '../../../hooks/api/user/useAPIDeleteUser';
import {
  SearchQueryToGetUsers,
  useAPISearchUsers,
} from '../../../hooks/api/user/useAPISearchUsers';
import {useAPIUpdateUser} from '../../../hooks/api/user/useAPIUpdateUser';
import {userAdminStyles} from '../../../styles/screen/admin/userAdmin.style';
import {User, UserRole, UserTag} from '../../../types';
import {UserAdminProps} from '../../../types/navigator/screenProps/Admin';
import {
  defaultDropdownOptionProps,
  defaultDropdownProps,
} from '../../../utils/dropdown/helper';
import {userNameFactory} from '../../../utils/factory/userNameFactory';
import {userRoleNameFactory} from '../../../utils/factory/userRoleNameFactory';

const UserAdmin: React.FC<UserAdminProps> = ({navigation}) => {
  const [searchQuery, setSearchQuery] = useState<SearchQueryToGetUsers>({
    page: '1',
  });
  const [selectedTags, setSelectedTags] = useState<UserTag[]>([]);
  const {data: users, refetch} = useAPISearchUsers(searchQuery);
  const {data: tags} = useAPIGetUserTag();
  const [currentUpdatingUser, setCurrentUpdatingUser] = useState<User>();
  const [visibleSearchFormModal, setVisibleSearchFormModal] = useState(false);
  const queryRefresh = (
    query: Partial<SearchQueryToGetUsers>,
    selected?: UserTag[],
  ) => {
    const selectedTagIDs = selected?.map(t => t.id.toString());
    const tagQuery = selectedTagIDs?.join('+');

    setSearchQuery(q => ({...q, ...query, tag: tagQuery || ''}));
  };
  const {mutate: updateUser} = useAPIUpdateUser({
    onSuccess: () => {
      refetch();
    },
  });
  const {mutate: deleteUser} = useAPIDeleteUser({
    onSuccess: () => {
      refetch();
    },
  });
  const dropdownRef = useRef<any | null>(null);

  const handleDeleteUser = (u: User) => {
    Alert.alert(
      `${userNameFactory(u)}さんを削除してよろしいですか？`,
      undefined,
      [
        {
          text: 'はい',
          onPress: () => deleteUser(u),
        },
        {
          text: 'いいえ',
        },
      ],
    );
  };

  const tabs: Tab[] = [
    {
      name: 'ユーザー管理',
      onPress: () => {},
    },
    {
      name: 'ユーザー作成',
      onPress: () => {},
    },
    {
      name: 'タグ管理',
      onPress: () => {},
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

  useEffect(() => {
    const tagIDs = searchQuery.tag?.split('+') || [];
    if (tags?.length && tagIDs.length) {
      setSelectedTags(tags.filter(t => tagIDs.includes(t.id.toString())));
    }
  }, [searchQuery.tag, tags]);

  return (
    <WholeContainer>
      <AppHeader title="Admin" tabs={tabs} activeTabName={'ユーザー管理'} />
      <SearchForm
        defaultValue={{word: '', selectedTags}}
        isVisible={visibleSearchFormModal}
        onCloseModal={() => setVisibleSearchFormModal(false)}
        tags={tags || []}
        onSubmit={values => {
          queryRefresh({word: values.word}, values.selectedTags);
          setVisibleSearchFormModal(false);
        }}
      />
      <SearchFormOpenerButton
        bottom={10}
        right={10}
        onPress={() => setVisibleSearchFormModal(true)}
      />
      <Div
        borderBottomWidth={1}
        borderBottomColor={'#b0b0b0'}
        flexDir="row"
        h={40}>
        <Div minW={'20%'} />
        <Div minW={'30%'} justifyContent="center">
          <Text fontWeight="bold" fontSize={16}>
            {'名前\nメールアドレス'}
          </Text>
        </Div>
        <Div minW={'40%'} justifyContent="center">
          <Text fontWeight="bold" fontSize={16}>
            社員区分
          </Text>
        </Div>
        <Div minW={'10%'} />
      </Div>
      <Dropdown {...defaultDropdownProps} ref={dropdownRef}>
        <Dropdown.Option
          {...defaultDropdownOptionProps}
          value={UserRole.ADMIN}
          onPress={() => {
            if (currentUpdatingUser) {
              updateUser({...currentUpdatingUser, role: UserRole.ADMIN});
              setCurrentUpdatingUser(undefined);
            }
          }}>
          {userRoleNameFactory(UserRole.ADMIN)}
        </Dropdown.Option>
        <Dropdown.Option
          {...defaultDropdownOptionProps}
          value={UserRole.COMMON}
          onPress={() => {
            if (currentUpdatingUser) {
              updateUser({...currentUpdatingUser, role: UserRole.COMMON});
              setCurrentUpdatingUser(undefined);
            }
          }}>
          {userRoleNameFactory(UserRole.COMMON)}
        </Dropdown.Option>
        <Dropdown.Option
          {...defaultDropdownOptionProps}
          value={UserRole.COACH}
          onPress={() => {
            if (currentUpdatingUser) {
              updateUser({...currentUpdatingUser, role: UserRole.COACH});
              setCurrentUpdatingUser(undefined);
            }
          }}>
          {userRoleNameFactory(UserRole.COACH)}
        </Dropdown.Option>
        <Dropdown.Option
          {...defaultDropdownOptionProps}
          value={UserRole.INTERNAL_INSTRUCTOR}
          onPress={() => {
            if (currentUpdatingUser) {
              updateUser({
                ...currentUpdatingUser,
                role: UserRole.INTERNAL_INSTRUCTOR,
              });
              setCurrentUpdatingUser(undefined);
            }
          }}>
          {userRoleNameFactory(UserRole.INTERNAL_INSTRUCTOR)}
        </Dropdown.Option>
        <Dropdown.Option
          {...defaultDropdownOptionProps}
          value={UserRole.EXTERNAL_INSTRUCTOR}
          onPress={() => {
            if (currentUpdatingUser) {
              updateUser({
                ...currentUpdatingUser,
                role: UserRole.EXTERNAL_INSTRUCTOR,
              });
              setCurrentUpdatingUser(undefined);
            }
          }}>
          {userRoleNameFactory(UserRole.EXTERNAL_INSTRUCTOR)}
        </Dropdown.Option>
      </Dropdown>

      <FlatList
        data={users?.users || []}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <Div
            py="xs"
            w={'100%'}
            borderBottomWidth={1}
            borderBottomColor={'#b0b0b0'}
            flexDir="row"
            alignItems="center"
            minH={40}>
            <TouchableOpacity
              style={userAdminStyles.avatar}
              onPress={() =>
                navigation.navigate('AccountDetail', {id: item.id})
              }>
              <Image
                w={'100%'}
                h={'100%'}
                rounded="circle"
                source={{uri: item.avatarUrl}}
              />
            </TouchableOpacity>
            <Text w={'29%'} mr={'1%'}>{`${userNameFactory(item)}\n${
              item.email
            }`}</Text>
            <Div w={'39%'} mr={'1%'}>
              <DropdownOpenerButton
                onPress={() => {
                  setCurrentUpdatingUser(item);
                  dropdownRef.current?.open();
                }}
                name={userRoleNameFactory(item.role)}
              />
            </Div>
            <TouchableOpacity onPress={() => handleDeleteUser(item)}>
              <Icon name="delete" fontSize={26} />
            </TouchableOpacity>
          </Div>
        )}
      />
    </WholeContainer>
  );
};

export default UserAdmin;
