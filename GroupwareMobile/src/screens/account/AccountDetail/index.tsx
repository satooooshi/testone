import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {
  StackActions,
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {Alert, useWindowDimensions} from 'react-native';
import {Text, Div, ScrollDiv, Button, Icon} from 'react-native-magnus';
import {ActivityIndicator} from 'react-native-paper';
import TagListBox from '../../../components/account/TagListBox';
import UserAvatar from '../../../components/common/UserAvatar';
import EventCard from '../../../components/events/EventCard';
import HeaderWithTextButton from '../../../components/Header';
import {Tab} from '../../../components/Header/HeaderTemplate';
import WholeContainer from '../../../components/WholeContainer';
import WikiCard from '../../../components/wiki/WikiCard';
import {useIsTabBarVisible} from '../../../contexts/bottomTab/useIsTabBarVisible';
import {useAuthenticate} from '../../../contexts/useAuthenticate';
import {useAPISaveChatGroup} from '../../../hooks/api/chat/useAPISaveChatGroup';
import {useAPIGetEventList} from '../../../hooks/api/event/useAPIGetEventList';
import {useAPIGetUserInfoById} from '../../../hooks/api/user/useAPIGetUserInfoById';
import {useAPIGetWikiList} from '../../../hooks/api/wiki/useAPIGetWikiList';
import {useTagType} from '../../../hooks/tag/useTagType';
import {accountDetailStyles} from '../../../styles/screen/account/accountDetail.style';
import {
  BoardCategory,
  RoomType,
  TagType,
  User,
  UserRole,
  WikiType,
} from '../../../types';
import {
  AccountDetailNavigationProps,
  AccountDetailRouteProps,
} from '../../../types/navigator/drawerScreenProps';
import {darkFontColor} from '../../../utils/colors';
import {userNameFactory} from '../../../utils/factory/userNameFactory';
import {userRoleNameFactory} from '../../../utils/factory/userRoleNameFactory';
import {useInviteCall} from '../../../contexts/call/useInviteCall';
import {branchTypeNameFactory} from '../../../utils/factory/branchTypeNameFactory';
import {useHandleBadge} from '../../../contexts/badge/useHandleBadge';
import {userNameKanaFactory} from '../../../utils/factory/userNameKanaFactory';

const TopTab = createMaterialTopTabNavigator();

type DetailScreenProps = {
  profile: User;
  isLoading: boolean;
};

const DetailScreen: React.FC<DetailScreenProps> = ({profile, isLoading}) => {
  const {width: windowWidth} = useWindowDimensions();
  const {filteredTags: techTags} = useTagType(TagType.TECH, profile.tags || []);
  const {filteredTags: qualificationTags} = useTagType(
    TagType.QUALIFICATION,
    profile.tags || [],
  );
  const {filteredTags: clubTags} = useTagType(TagType.CLUB, profile.tags || []);
  const {filteredTags: hobbyTags} = useTagType(
    TagType.HOBBY,
    profile.tags || [],
  );

  return (
    <Div px={18} mt="lg">
      {!isLoading ? (
        <>
          <Div mb={'lg'}>
            <Text fontSize={14} fontWeight="bold">
              社員番号
            </Text>
            <Text fontSize={14}>{profile.employeeId || '未登録'}</Text>
          </Div>
          <Div mb={'lg'}>
            <Text fontSize={14} fontWeight="bold">
              社員区分
            </Text>
            <Text fontSize={14}>{userRoleNameFactory(profile.role)}</Text>
          </Div>
          <Div mb={'lg'}>
            <Text fontSize={14} fontWeight="bold">
              所属支社
            </Text>
            <Text fontSize={14}>{branchTypeNameFactory(profile.branch)}</Text>
          </Div>
          <Div mb={'lg'}>
            <Text fontSize={14} fontWeight="bold">
              メール
            </Text>
            <Text fontSize={14}>
              {profile.isEmailPublic ? profile.email : '非公開'}
            </Text>
          </Div>
          <Div mb={'lg'}>
            <Text fontSize={14} fontWeight="bold">
              電話番号
            </Text>
            <Text fontSize={14}>
              {profile.isPhonePublic ? profile.phone : '非公開'}
            </Text>
          </Div>
          <Div my={10} borderColor="gray200" borderBottomWidth={1} />
          <Text fontSize={20} fontWeight="bold">
            タグ
          </Text>
          <TagListBox
            mb={'lg'}
            tags={techTags || []}
            tagType={TagType.TECH}
            introduce={profile.introduceTech}
          />
          <TagListBox
            mb={'lg'}
            tags={qualificationTags || []}
            tagType={TagType.QUALIFICATION}
            introduce={profile.introduceQualification}
          />
          <TagListBox
            mb={'lg'}
            tags={clubTags || []}
            tagType={TagType.CLUB}
            introduce={profile.introduceClub}
          />
          <TagListBox
            tags={hobbyTags || []}
            tagType={TagType.HOBBY}
            introduce={profile.introduceHobby}
          />
        </>
      ) : (
        <ActivityIndicator />
      )}
    </Div>
  );
};

const AccountDetail: React.FC = () => {
  const navigation = useNavigation<AccountDetailNavigationProps>();
  const route = useRoute<AccountDetailRouteProps>();
  const {user, setUser, logout} = useAuthenticate();
  const {sendCallInvitation} = useInviteCall();
  const {setIsTabBarVisible} = useIsTabBarVisible();
  const {editChatGroup} = useHandleBadge();
  const id = route.params?.id;
  const userID = id || user?.id;
  const screenName = 'AccountDetail';
  const defaultScreenName = `${screenName}-default`;
  const eventScreenName = `${screenName}-event`;
  const questionScreenName = `${screenName}-question`;
  const knowledgeScreenName = `${screenName}-knowledge`;
  const goodScreenName = `${screenName}-good`;
  const {width: windowWidth} = useWindowDimensions();
  const [screenHeight, setScreenHeight] = useState<{
    [key: string]: {height: number};
  }>({[defaultScreenName]: {height: 3600}});
  const {
    data: profile,
    refetch,
    isLoading: loadingProfile,
  } = useAPIGetUserInfoById(userID?.toString() || '0');
  const {data: events, refetch: refetchEventList} = useAPIGetEventList({
    participant_id: userID?.toString(),
  });
  const {data: questionList, refetch: refetchQuestionList} = useAPIGetWikiList({
    writer: userID?.toString() || '0',
    type: WikiType.BOARD,
    board_category: BoardCategory.QA,
  });
  const {data: knowledgeList, refetch: refetchKnowledgeList} =
    useAPIGetWikiList({
      writer: userID?.toString() || '0',
      type: WikiType.BOARD,
      board_category: BoardCategory.KNOWLEDGE,
    });
  const [safetyCreateGroup, setCreatGroup] = useState(false);
  const {mutate: createGroup} = useAPISaveChatGroup({
    onSuccess: createdData => {
      if (createdData.updatedAt === createdData.createdAt) {
        editChatGroup(createdData);
      }
      const resetAction = StackActions.popToTop();
      navigation.dispatch(resetAction);

      navigation.navigate('ChatStack', {
        screen: 'Chat',
        params: {room: createdData},
        initial: false,
      });
    },
    onError: () => {
      Alert.alert('チャットルームの作成に失敗しました');
    },
  });

  useEffect(() => {
    if (safetyCreateGroup && profile) {
      createGroup({
        name: '',
        members: [profile],
        roomType: RoomType.PERSONAL,
      });
    }
  }, [safetyCreateGroup, profile, createGroup]);

  const isFocused = useIsFocused();
  const [activeScreen, setActiveScreen] = useState(defaultScreenName);

  const bottomContentsHeight = () => {
    return screenHeight[activeScreen]?.height;
  };

  const mySelfOfNot = id === user?.id || !id;

  const tabs: Tab[] =
    userID !== user?.id
      ? [
          {
            name: 'アカウント情報',
            onPress: () =>
              navigation.navigate('AccountStack', {screen: 'MyProfile'}),
          },
        ]
      : [
          {
            name: 'アカウント情報',
            onPress: () => {},
          },
          {
            name: 'プロフィール編集',
            onPress: () =>
              navigation.navigate('AccountStack', {screen: 'Profile'}),
          },
          {
            name: 'パスワード更新',
            onPress: () =>
              navigation.navigate('AccountStack', {screen: 'UpdatePassword'}),
          },
        ];

  const handleLogout = () => {
    logout();
    setUser({});
  };

  const inviteCall = async () => {
    if (user && profile) {
      await sendCallInvitation(user, profile);
    }
  };
  // const inviteCall = async () => {
  //   if (user && profile) {
  //     const localInvitation = await setupCallInvitation(user, profile);
  //     setLocalInvitationState(localInvitation);
  //   }
  // };

  useEffect(() => {
    if (isFocused) {
      refetch();
      refetchEventList();
      refetchQuestionList();
      refetchKnowledgeList();
      setIsTabBarVisible(true);
    }
  }, [
    isFocused,
    refetch,
    refetchEventList,
    refetchQuestionList,
    refetchKnowledgeList,
    setIsTabBarVisible,
  ]);

  return (
    <WholeContainer>
      <HeaderWithTextButton
        title={'Account'}
        tabs={tabs}
        activeTabName={'アカウント情報'}
        enableBackButton={userID !== user?.id}
        rightButtonName={mySelfOfNot ? 'ログアウト' : undefined}
        onPressRightButton={mySelfOfNot ? handleLogout : undefined}
        screenForBack={
          route.params?.previousScreenName
            ? route.params.previousScreenName
            : undefined
        }
      />
      {/* <Button onPress={() => SoundPlayer.resume()}>test </Button> */}
      <ScrollDiv
        contentContainerStyle={accountDetailStyles.scrollView}
        style={{backgroundColor: 'white'}}>
        {profile && (
          <>
            <Div px={18}>
              <Div flexDir="row" my={8}>
                <Div mr={12}>
                  <UserAvatar user={profile} h={100} w={100} />
                </Div>
                <Div alignSelf="center">
                  <Text fontSize={16} fontWeight="bold">
                    {userNameFactory(profile)}
                  </Text>
                  <Text fontSize={12} color="gray500">
                    {userNameKanaFactory(profile)}
                  </Text>
                </Div>
              </Div>
              {userID === user?.id ? (
                <Button
                  py="md"
                  mb={20}
                  w="100%"
                  rounded="circle"
                  bg="gray200"
                  color="black">
                  <Text fontSize={16}>編集</Text>
                </Button>
              ) : null}

              <Div my={8}>
                <Text fontSize={14} lineHeight={20} fontWeight="bold">
                  メールアドレス
                </Text>
                <Text fontSize={14} lineHeight={20}>
                  {profile.isEmailPublic ? profile.email : '非公開'}
                </Text>
              </Div>
              <Div my={8}>
                <Text fontSize={14} lineHeight={20} fontWeight="bold">
                  自己紹介
                </Text>
                <Text fontSize={14} lineHeight={20}>
                  {profile.introduceOther || '未設定'}
                </Text>
              </Div>

              <Div alignItems="center">
                <Div flexDir="row" mb="sm">
                  {profile.id !== user?.id &&
                  profile.role !== UserRole.EXTERNAL_INSTRUCTOR ? (
                    <Button
                      mr={-50}
                      mt={-10}
                      bg="white"
                      rounded="circle"
                      onPress={() => {
                        Alert.alert('通話しますか？', undefined, [
                          {
                            text: 'はい',
                            onPress: () => inviteCall(),
                          },
                          {
                            text: 'いいえ',
                            onPress: () => {},
                          },
                        ]);
                      }}>
                      <Icon
                        name="call"
                        fontFamily="Ionicons"
                        fontSize={24}
                        color="blue700"
                      />
                    </Button>
                  ) : null}
                </Div>
              </Div>
            </Div>
            <Div>
              <Div h={bottomContentsHeight() ? bottomContentsHeight() : 700}>
                <TopTab.Navigator
                  initialRouteName={defaultScreenName}
                  screenOptions={{
                    tabBarScrollEnabled: true,
                  }}>
                  <TopTab.Screen
                    listeners={{
                      focus: () => setActiveScreen(defaultScreenName),
                    }}
                    name={defaultScreenName}
                    children={() => (
                      <Div bg="white">
                        <DetailScreen
                          isLoading={loadingProfile}
                          profile={profile}
                        />
                        <Div
                          onLayout={({nativeEvent}) => {
                            setScreenHeight(s => ({
                              ...s,
                              [defaultScreenName]: {
                                ...s?.[defaultScreenName],
                                height: nativeEvent.layout.y + 130,
                              },
                            }));
                          }}
                        />
                      </Div>
                    )}
                    options={{title: 'プロフィール'}}
                  />
                  <TopTab.Screen
                    listeners={{focus: () => setActiveScreen(eventScreenName)}}
                    name={eventScreenName}
                    children={() => (
                      <Div bg="white">
                        <Div alignItems="center" mt="lg">
                          {events?.events?.length ? (
                            events?.events?.map(e => (
                              <Div mb={'lg'} key={e.id}>
                                <EventCard event={e} />
                              </Div>
                            ))
                          ) : (
                            <Text fontSize={16}>
                              参加したイベントが見つかりませんでした
                            </Text>
                          )}
                        </Div>
                        <Div
                          onLayout={({nativeEvent}) => {
                            setScreenHeight(s => ({
                              ...s,
                              [eventScreenName]: {
                                ...s?.[eventScreenName],
                                height: nativeEvent.layout.y + 130,
                              },
                            }));
                          }}
                        />
                      </Div>
                    )}
                    options={{title: '参加したイベント'}}
                  />
                  <TopTab.Screen
                    listeners={{
                      focus: () => setActiveScreen(questionScreenName),
                    }}
                    name={questionScreenName}
                    children={() => (
                      <Div bg="white">
                        <Div alignItems="center" mt="lg">
                          {questionList?.wiki?.length ? (
                            questionList?.wiki?.map(w => (
                              <WikiCard key={w.id} wiki={w} />
                            ))
                          ) : (
                            <Text fontSize={16}>
                              投稿した質問が見つかりませんでした
                            </Text>
                          )}
                        </Div>
                        <Div
                          onLayout={({nativeEvent}) => {
                            setScreenHeight(s => ({
                              ...s,
                              [questionScreenName]: {
                                ...s?.[questionScreenName],
                                height: nativeEvent.layout.y + 130,
                              },
                            }));
                          }}
                        />
                      </Div>
                    )}
                    options={{title: '質問'}}
                  />
                  <TopTab.Screen
                    listeners={{
                      focus: () => setActiveScreen(knowledgeScreenName),
                    }}
                    name={knowledgeScreenName}
                    children={() => (
                      <Div bg="white">
                        <Div alignItems="center" mt="lg">
                          {knowledgeList?.wiki?.length ? (
                            knowledgeList?.wiki?.map(w => (
                              <WikiCard key={w.id} wiki={w} />
                            ))
                          ) : (
                            <Text fontSize={16}>
                              投稿したナレッジが見つかりませんでした
                            </Text>
                          )}
                        </Div>
                        <Div
                          onLayout={({nativeEvent}) => {
                            setScreenHeight(s => ({
                              ...s,
                              [knowledgeScreenName]: {
                                ...s?.[knowledgeScreenName],
                                height: nativeEvent.layout.y + 130,
                              },
                            }));
                          }}
                        />
                      </Div>
                    )}
                    options={{title: 'ナレッジ'}}
                  />
                  <TopTab.Screen
                    listeners={{
                      focus: () => setActiveScreen(goodScreenName),
                    }}
                    name={goodScreenName}
                    children={() => (
                      <>
                        <Div alignItems="center" mt="lg">
                          {profile?.userGoodForBoard?.length ? (
                            profile?.userGoodForBoard?.map(w => (
                              <WikiCard key={w.id} wiki={w} />
                            ))
                          ) : (
                            <Text fontSize={16}>
                              いいねした掲示板が見つかりませんでした
                            </Text>
                          )}
                        </Div>
                        <Div
                          onLayout={({nativeEvent}) => {
                            setScreenHeight(s => ({
                              ...s,
                              [goodScreenName]: {
                                ...s?.[goodScreenName],
                                height: nativeEvent.layout.y + 130,
                              },
                            }));
                          }}
                        />
                      </>
                    )}
                    options={{title: 'いいね'}}
                  />
                </TopTab.Navigator>
              </Div>
            </Div>
          </>
        )}
      </ScrollDiv>
      {profile &&
        profile.id !== user?.id &&
        profile.role !== UserRole.EXTERNAL_INSTRUCTOR && (
          <Button
            bg="purple600"
            position="absolute"
            right={10}
            bottom={10}
            h={60}
            w={60}
            zIndex={20}
            rounded="circle"
            onPress={() => setCreatGroup(true)}>
            <Icon
              fontSize={'6xl'}
              color="white"
              name="chatbubble-ellipses-outline"
              fontFamily="Ionicons"
            />
          </Button>
        )}
    </WholeContainer>
  );
};

export default AccountDetail;
