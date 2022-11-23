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
        title="Home"
        activeTabName="ダッシュボード"
        // rightButtonName={'ログアウト'}
        // onPressRightButton={handleLogout}
      />

      <ScrollDiv pt="lg" px="5%">
        <Text mb={'sm'} fontWeight="bold" fontSize={18}>
          新着の特集記事
        </Text>
        <Div
          bg="white"
          rounded="md"
          flexDir="column"
          alignItems="center"
          alignSelf="center"
          mb="lg"
          py="lg"
          px="lg"
          w="100%">
          {newsForScroll.length ? (
            newsForScroll.map((news, index) =>
              index < newsIndex * 5 ? (
                <TouchableHighlight
                  key={news.id.toString()}
                  underlayColor="none"
                  style={tailwind('w-full')}
                  onPress={() => onPressNews(news)}>
                  <Div
                    mb={8}
                    pb={8}
                    borderBottomColor="black"
                    borderBottomWidth={1}
                    alignItems="center"
                    flexDir="row">
                    <Text fontWeight="bold">・</Text>
                    <Text color="blue" fontSize={16}>
                      {news.title}
                    </Text>
                  </Div>
                </TouchableHighlight>
              ) : (
                <React.Fragment key={news.id.toString()} />
              ),
            )
          ) : (
            <></>
          )}
          {loadingNews && <ActivityIndicator />}
          <TouchableHighlight
            underlayColor="none"
            style={tailwind('self-end')}
            onPress={() => {
              setNewsIndex(i => {
                if ((i + 1) % 4 === 0) {
                  setPage(p => p + 1);
                }
                return i + 1;
              });
            }}>
            {data?.pageCount && newsIndex !== data.pageCount * 4 ? (
              <Text color="blue" fontWeight="bold" fontSize={16}>
                もっと見る
              </Text>
            ) : (
              <></>
            )}
          </TouchableHighlight>
        </Div>
      </ScrollDiv>
    </WholeContainer>
  );
};

export default Home;
