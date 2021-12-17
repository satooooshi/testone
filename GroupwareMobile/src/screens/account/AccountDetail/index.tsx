import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {useIsFocused, useNavigation, useRoute} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {useWindowDimensions} from 'react-native';
import {Text, Div, ScrollDiv, Image} from 'react-native-magnus';
import {ActivityIndicator} from 'react-native-paper';
import TagListBox from '../../../components/account/TagListBox';
import EventCard from '../../../components/events/EventCard';
import HeaderWithTextButton from '../../../components/Header';
import {Tab} from '../../../components/Header/HeaderTemplate';
import WholeContainer from '../../../components/WholeContainer';
import WikiCard from '../../../components/wiki/WikiCard';
import {useAuthenticate} from '../../../contexts/useAuthenticate';
import {useAPIGetEventList} from '../../../hooks/api/event/useAPIGetEventList';
import {useAPIGetUserInfoById} from '../../../hooks/api/user/useAPIGetUserInfoById';
import {useAPIGetWikiList} from '../../../hooks/api/wiki/useAPIGetWikiList';
import {useTagType} from '../../../hooks/tag/useTagType';
import {accountDetailStyles} from '../../../styles/screen/account/accountDetail.style';
import {TagType, User, WikiType} from '../../../types';
import {
  AccountDetailNavigationProps,
  AccountDetailRouteProps,
} from '../../../types/navigator/drawerScreenProps';
import {darkFontColor} from '../../../utils/colors';
import {userNameFactory} from '../../../utils/factory/userNameFactory';
import {userRoleNameFactory} from '../../../utils/factory/userRoleNameFactory';
import {storage} from '../../../utils/url';

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
    <Div w={windowWidth * 0.9} alignSelf="center" mt="lg">
      {!isLoading ? (
        <>
          <Div mb={'lg'} flexDir="row">
            <Text mr="lg" fontSize={16}>
              社員区分
            </Text>
            <Text color={darkFontColor} fontWeight="bold" fontSize={20}>
              {userRoleNameFactory(profile.role)}
            </Text>
          </Div>
          <Div flexDir="row" mb={'lg'}>
            <Text mr="lg" fontSize={16}>
              自己紹介
            </Text>
            <Text color={darkFontColor} fontWeight="bold" fontSize={20}>
              {profile.introduceOther || '未設定'}
            </Text>
          </Div>
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
            mb={'lg'}
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
  const {user, setUser} = useAuthenticate();
  const id = route.params?.id;
  const userID = id || user?.id;
  const screenName = 'AccountDetail';
  const defaultScreenName = `${screenName}-default`;
  const eventScreenName = `${screenName}-event`;
  const questionScreenName = `${screenName}-question`;
  const knowledgeScreenName = `${screenName}-knowledge`;
  const {width: windowWidth, height: windowHeight} = useWindowDimensions();
  const {
    data: profile,
    refetch,
    isLoading: loadingProfile,
  } = useAPIGetUserInfoById(userID?.toString() || '0');
  const {data: events} = useAPIGetEventList({
    participant_id: userID?.toString(),
  });
  const {data: questionList} = useAPIGetWikiList({
    writer: userID?.toString() || '0',
    type: WikiType.QA,
  });
  const {data: knowledgeList} = useAPIGetWikiList({
    writer: userID?.toString() || '0',
    type: WikiType.KNOWLEDGE,
  });
  const isFocused = useIsFocused();
  const [activeScreen, setActiveScreen] = useState(defaultScreenName);

  const bottomContentsHeight = () => {
    if (activeScreen === defaultScreenName && profile?.tags) {
      return 700 + profile?.tags.length * 15;
    }
    if (activeScreen === eventScreenName && events?.events) {
      return 100 + events?.events.length * windowWidth * 0.9;
    }
    if (activeScreen === questionScreenName && questionList?.wiki) {
      return 100 + questionList?.wiki.length * 120;
    }
    if (activeScreen === knowledgeScreenName && knowledgeList?.wiki) {
      return 100 + knowledgeList?.wiki.length * 120;
    }
    return windowHeight;
  };

  const tabs: Tab[] =
    userID !== user?.id
      ? [
          {
            name: 'アカウント情報',
            onPress: () => {},
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
    storage.delete('userToken');
    setUser({});
  };

  useEffect(() => {
    if (isFocused) {
      refetch();
    }
  }, [isFocused, refetch]);

  return (
    <WholeContainer>
      <HeaderWithTextButton
        title={'Account'}
        tabs={tabs}
        activeTabName={'アカウント情報'}
        enableBackButton={userID !== user?.id}
        rightButtonName={!id ? 'ログアウト' : undefined}
        onPressRightButton={id ? handleLogout : undefined}
      />
      <ScrollDiv contentContainerStyle={accountDetailStyles.scrollView}>
        {profile && (
          <>
            <Div alignItems="center">
              <Image
                mt={'lg'}
                h={windowWidth * 0.6}
                w={windowWidth * 0.6}
                source={
                  profile.avatarUrl
                    ? {uri: profile.avatarUrl}
                    : require('../../../../assets/no-image-avatar.png')
                }
                rounded="circle"
                mb={'lg'}
              />
              <Text
                fontWeight="bold"
                mb={'lg'}
                color={darkFontColor}
                fontSize={24}>
                {userNameFactory(profile)}
              </Text>
            </Div>
            <Div h={bottomContentsHeight()}>
              <TopTab.Navigator
                initialRouteName={defaultScreenName}
                screenOptions={{
                  tabBarScrollEnabled: true,
                }}>
                <TopTab.Screen
                  listeners={{focus: () => setActiveScreen(defaultScreenName)}}
                  name={defaultScreenName}
                  children={() => (
                    <DetailScreen
                      isLoading={loadingProfile}
                      profile={profile}
                    />
                  )}
                  options={{title: '詳細'}}
                />
                <TopTab.Screen
                  listeners={{focus: () => setActiveScreen(eventScreenName)}}
                  name={eventScreenName}
                  children={() => (
                    <Div alignItems="center" mt="lg">
                      {events?.events?.length ? (
                        events?.events?.map(e => (
                          <Div mb={'lg'} key={e.id}>
                            <EventCard
                              event={e}
                              onPress={() =>
                                navigation.navigate('EventStack', {
                                  screen: 'EventDetail',
                                  params: {id: e.id},
                                })
                              }
                            />
                          </Div>
                        ))
                      ) : (
                        <Text fontSize={16}>
                          参加したイベントが見つかりませんでした
                        </Text>
                      )}
                    </Div>
                  )}
                  options={{title: '参加したイベント'}}
                />
                <TopTab.Screen
                  listeners={{focus: () => setActiveScreen(questionScreenName)}}
                  name={questionScreenName}
                  children={() => (
                    <Div alignItems="center" mt="lg">
                      {questionList?.wiki?.length ? (
                        questionList?.wiki?.map(w => (
                          <WikiCard
                            key={w.id}
                            wiki={w}
                            onPress={() =>
                              navigation.navigate('WikiStack', {
                                screen: 'WikiDetail',
                                params: {id: w.id},
                              })
                            }
                          />
                        ))
                      ) : (
                        <Text fontSize={16}>
                          投稿した質問が見つかりませんでした
                        </Text>
                      )}
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
                    <Div alignItems="center" mt="lg">
                      {knowledgeList?.wiki?.length ? (
                        knowledgeList?.wiki?.map(w => (
                          <WikiCard
                            key={w.id}
                            wiki={w}
                            onPress={() =>
                              navigation.navigate('WikiStack', {
                                screen: 'WikiDetail',
                                params: {id: w.id},
                              })
                            }
                          />
                        ))
                      ) : (
                        <Text fontSize={16}>
                          投稿したナレッジが見つかりませんでした
                        </Text>
                      )}
                    </Div>
                  )}
                  options={{title: 'ナレッジ'}}
                />
              </TopTab.Navigator>
            </Div>
          </>
        )}
      </ScrollDiv>
    </WholeContainer>
  );
};

export default AccountDetail;
