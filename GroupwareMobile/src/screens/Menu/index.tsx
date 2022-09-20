import React from 'react';
import WholeContainer from '../../components/WholeContainer';
import PortalLinkBox from '../../components/PortalLinkBox';
import {Div, ScrollDiv, Tag, Text} from 'react-native-magnus';
import {Alert, Linking} from 'react-native';
import {useAuthenticate} from '../../contexts/useAuthenticate';
import {EventType, UserRole} from '../../types';
import {useNavigation} from '@react-navigation/native';
import {HomeNavigationProps} from '../../types/navigator/drawerScreenProps/home';
import {useAPIGetUserInfoById} from '../../hooks/api/user/useAPIGetUserInfoById';
import UserAvatar from '../../components/common/UserAvatar';
import {userRoleNameFactory} from '../../utils/factory/userRoleNameFactory';
import {userNameFactory} from '../../utils/factory/userNameFactory';

const Home: React.FC = () => {
  const {user, setUser, logout} = useAuthenticate();
  const isAdmin = user?.role === UserRole.ADMIN;
  const userID = user?.id;
  const navigation = useNavigation<HomeNavigationProps>();
  const {data: profile} = useAPIGetUserInfoById(userID?.toString() || '0');

  const handleLogout = () => {
    logout();
    setUser({});
  };

  return (
    <WholeContainer>
      <ScrollDiv mt="lg" px={16}>
        {profile ? (
          <Div flexDir="row" my={20}>
            <Div mr={12}>
              <UserAvatar user={profile} h={60} w={60} />
            </Div>
            <Div alignSelf="center">
              <Tag color="green600" bg="green100" fontSize={12} mb={10}>
                {userRoleNameFactory(profile.role)}
              </Tag>
              <Text fontSize={16} fontWeight="bold" mb={6}>
                {userNameFactory(profile)}
              </Text>
            </Div>
          </Div>
        ) : null}

        <Div flexDir="row" mb={8}>
          <Div flex={1} mr={12}>
            <PortalLinkBox
              type="account"
              onPress={() => {
                navigation.navigate('AccountStack', {
                  screen: 'MyProfile',
                });
              }}
            />
          </Div>
          <Div flex={1}>
            <PortalLinkBox
              type="my_schedule"
              onPress={() => {
                navigation.navigate('EventStack', {
                  screen: 'EventList',
                  params: {personal: true},
                });
              }}
            />
          </Div>
        </Div>

        <Div flexDir="row" mb={8}>
          <Div flex={1} mr={12}>
            <PortalLinkBox
              type="safety_confirmation"
              onPress={() => {
                Alert.alert('近日公開予定です');
              }}
            />
          </Div>
          <Div flex={1}>
            <PortalLinkBox
              type="salary"
              onPress={() => {
                Alert.alert('今後実装予定です');
              }}
            />
          </Div>
        </Div>
        <Div flexDir="row" mb={8}>
          <Div flex={1} mr={12}>
            <PortalLinkBox
              type="attendance"
              onPress={() => {
                Linking.openURL('https://bold-kintai.net/bold/root/attendance');
              }}
            />
          </Div>
          <Div flex={1} />
        </Div>

        <Text fontSize={18} fontWeight="bold" my={12}>
          全体
        </Text>
        <Div flexDir="row" mb={8}>
          <Div flex={1} mr={12}>
            <PortalLinkBox
              type="impressive_university"
              onPress={() =>
                navigation.navigate('EventStack', {
                  screen: 'EventIntroduction',
                  params: {type: EventType.IMPRESSIVE_UNIVERSITY},
                })
              }
            />
          </Div>
          <Div flex={1}>
            <PortalLinkBox
              type="study_meeting"
              onPress={() =>
                navigation.navigate('EventStack', {
                  screen: 'EventIntroduction',
                  params: {type: EventType.STUDY_MEETING},
                })
              }
            />
          </Div>
        </Div>

        <Div flexDir="row" mb={8}>
          <Div flex={1} mr={12}>
            <PortalLinkBox
              type="bolday"
              onPress={() =>
                navigation.navigate('EventStack', {
                  screen: 'EventIntroduction',
                  params: {type: EventType.BOLDAY},
                })
              }
            />
          </Div>
          <Div flex={1}>
            <PortalLinkBox
              type="coach"
              onPress={() =>
                navigation.navigate('EventStack', {
                  screen: 'EventIntroduction',
                  params: {type: EventType.COACH},
                })
              }
            />
          </Div>
        </Div>

        <Div flexDir="row" mb={8}>
          <Div flex={1} mr={12}>
            <PortalLinkBox
              type="club"
              onPress={() =>
                navigation.navigate('EventStack', {
                  screen: 'EventIntroduction',
                  params: {type: EventType.CLUB},
                })
              }
            />
          </Div>
          <Div flex={1}>
            <PortalLinkBox
              type="submission_etc"
              onPress={() =>
                navigation.navigate('EventStack', {
                  screen: 'EventList',
                  params: {type: EventType.SUBMISSION_ETC},
                })
              }
            />
          </Div>
        </Div>

        <Div flexDir="row" mb={8}>
          <Div flex={1} mr={12}>
            <PortalLinkBox
              type="wiki"
              onPress={() => {
                navigation.navigate('WikiStack', {
                  screen: 'WikiList',
                  params: {},
                });
              }}
            />
          </Div>
          <Div flex={1}>
            <PortalLinkBox
              type="chat"
              onPress={() => {
                navigation.navigate('ChatStack', {
                  screen: 'RoomList',
                });
              }}
            />
          </Div>
        </Div>

        <Div flexDir="row" mb={8}>
          <Div flex={1} mr={12}>
            <PortalLinkBox
              type="users"
              onPress={() => {
                navigation.navigate('UsersStack', {
                  screen: 'UserList',
                  params: {},
                });
              }}
            />
          </Div>
          <Div flex={1} />
        </Div>

        <Text fontSize={18} fontWeight="bold" my={12}>
          管理
        </Text>
        {isAdmin ? (
          <Div flexDir="row" mb={8}>
            <Div flex={1} mr={12}>
              <PortalLinkBox
                type="user_admin"
                onPress={() => {
                  navigation.navigate('AdminStack', {
                    screen: 'UserAdmin',
                  });
                }}
              />
            </Div>
            <Div flex={1}>
              <PortalLinkBox
                type="user_registering_admin"
                onPress={() => {
                  navigation.navigate('AdminStack', {
                    screen: 'UserRegisteringAdmin',
                  });
                }}
              />
            </Div>
          </Div>
        ) : (
          <></>
        )}

        <Div flexDir="row" mb={8}>
          <Div flex={1} mr={12}>
            <PortalLinkBox
              type="tag_admin"
              onPress={() => {
                navigation.navigate('AdminStack', {
                  screen: 'TagAdmin',
                });
              }}
            />
          </Div>
          <Div flex={1}>
            <PortalLinkBox
              type="user_tag_admin"
              onPress={() => {
                navigation.navigate('AdminStack', {
                  screen: 'UserTagAdmin',
                });
              }}
            />
          </Div>
        </Div>

        <Text fontSize={18} fontWeight="bold" my={12}>
          アカウント
        </Text>
        <Div flexDir="row" mb={8}>
          <Div flex={1} mr={12}>
            <PortalLinkBox type="logout" onPress={handleLogout} />
          </Div>
          <Div flex={1} />
        </Div>
      </ScrollDiv>
    </WholeContainer>
  );
};

export default Home;
