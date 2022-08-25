import React, {useEffect, useState} from 'react';
import WholeContainer from '../../components/WholeContainer';
import HeaderWithTextButton from '../../components/Header';
import PortalLinkBox from '../../components/PortalLinkBox';
import {Div, ScrollDiv, Text} from 'react-native-magnus';
import {
  Alert,
  Linking,
  TouchableHighlight,
  useWindowDimensions,
} from 'react-native';
import {useAuthenticate} from '../../contexts/useAuthenticate';
import {useAPIGetTopNews} from '../../hooks/api/topNews/useAPIGetTopNews';
import {EventType, TopNews} from '../../types';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import {HomeNavigationProps} from '../../types/navigator/drawerScreenProps/home';
import tailwind from 'tailwind-rn';
import {ActivityIndicator} from 'react-native-paper';

const Home: React.FC = () => {
  const {setUser, logout} = useAuthenticate();
  const navigation = useNavigation<HomeNavigationProps>();
  const {width: windowWidth} = useWindowDimensions();
  const [page, setPage] = useState(1);
  const [newsIndex, setNewsIndex] = useState(1);
  const {
    data,
    refetch,
    isLoading: loadingNews,
    isRefetching,
  } = useAPIGetTopNews({
    page: page.toString(),
  });
  const [newsForScroll, setNewsForScroll] = useState<TopNews[]>([]);

  const isFocused = useIsFocused();

  const handleLogout = () => {
    logout();
    setUser({});
  };

  const onPressNews = (news: TopNews) => {
    if (news.urlPath.includes('event')) {
      const id: string = news.urlPath.replace('/event/', '');
      if (typeof Number(id) === 'number') {
        navigation.navigate('EventStack', {
          screen: 'EventDetail',
          params: {id: Number(id)},
          initial: false,
        });
      } else {
        Alert.alert('情報の取得に失敗しました');
      }
    } else if (news.urlPath.includes('wiki')) {
      const id: string = news.urlPath.replace('/wiki/detail/', '');
      if (typeof Number(id) === 'number') {
        navigation.navigate('WikiStack', {
          screen: 'WikiDetail',
          params: {id: Number(id)},
          initial: false,
        });
      } else {
        Alert.alert('情報の取得に失敗しました');
      }
    } else if (news.urlPath.includes('account')) {
      const id: string = news.urlPath.replace('/account/', '');
      if (typeof Number(id) === 'number') {
        navigation.navigate('UsersStack', {
          screen: 'AccountDetail',
          params: {id: Number(id)},
          initial: false,
        });
      } else {
        Alert.alert('情報の取得に失敗しました');
      }
    }
  };

  useEffect(() => {
    setNewsIndex(1);
    setPage(1);
    setNewsForScroll([]);
    if (isFocused) {
      refetch();
    }
  }, [refetch, isFocused]);

  useEffect(() => {
    if (!isRefetching && data?.news) {
      setNewsForScroll(n => {
        if (n.length) {
          return [...n, ...data.news];
        }
        return data.news;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.news, isRefetching]);

  return (
    <WholeContainer>
      <HeaderWithTextButton
        title="Menu"
        activeTabName="ダッシュボード"
        rightButtonName={'ログアウト'}
        onPressRightButton={handleLogout}
      />
      {/* TODO: ログイン名を出す */}
      <ScrollDiv mt="lg" px={16}>
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
              type="account"
              onPress={() => {
                navigation.navigate('AccountStack', {
                  screen: 'AccountDetail',
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
              type="users"
              onPress={() => {
                navigation.navigate('UsersStack', {
                  screen: 'UserList',
                  params: {},
                });
              }}
            />
          </Div>
          <Div flex={1}>
            <PortalLinkBox
              type="attendance"
              onPress={() => {
                Linking.openURL('https://bold-kintai.net/bold/root/attendance');
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
        {/* <Div flexDir="row" mb={8}>
          <Div flex={1} mr={12}></Div>
          <Div flex={1}></Div>
        </Div> */}
      </ScrollDiv>
    </WholeContainer>
  );
};

export default Home;
