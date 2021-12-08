import React, {useEffect, useState} from 'react';
import WholeContainer from '../../components/WholeContainer';
import HeaderWithTextButton, {Tab} from '../../components/Header';
import PortalLinkBox from '../../components/PortalLinkBox';
import {Div, ScrollDiv, Text} from 'react-native-magnus';
import {Alert, TouchableHighlight, useWindowDimensions} from 'react-native';
import {storage} from '../../utils/url';
import {useAuthenticate} from '../../contexts/useAuthenticate';
import {useAPIGetTopNews} from '../../hooks/api/topNews/useAPIGetTopNews';
import {TopNews} from '../../types';
import {useNavigation} from '@react-navigation/native';
import {HomeNavigationProps} from '../../types/navigator/drawerScreenProps/home';
import tailwind from 'tailwind-rn';
import {ActivityIndicator} from 'react-native-paper';

const Home: React.FC = () => {
  const {setUser} = useAuthenticate();
  const navigation = useNavigation<HomeNavigationProps>();
  const {width: windowWidth} = useWindowDimensions();
  const [page, setPage] = useState(1);
  const [newsIndex, setNewsIndex] = useState(1);
  const {data, isLoading: loadingNews} = useAPIGetTopNews({
    page: page.toString(),
  });
  const [newsForScroll, setNewsForScroll] = useState<TopNews[]>([]);

  const tabs: Tab[] = [
    {
      name: 'ダッシュボード',
      onPress: console.log,
    },
    {
      name: 'メンション一覧',
      onPress: console.log,
    },
  ];
  const handleLogout = () => {
    storage.delete('userToken');
    setUser({});
  };

  const onPressNews = (news: TopNews) => {
    if (news.urlPath.includes('event')) {
      const id: string = news.urlPath.replace('/event/', '');
      if (typeof Number(id) === 'number') {
        navigation.navigate('EventStack', {
          screen: 'EventDetail',
          params: {id: Number(id)},
        });
      } else {
        Alert.alert('情報の取得に失敗しました');
      }
    } else if (news.urlPath.includes('wiki')) {
      const id: string = news.urlPath.replace('/wiki/', '');
      if (typeof Number(id) === 'number') {
        navigation.navigate('EventStack', {
          screen: 'EventDetail',
          params: {id: Number(id)},
        });
      } else {
        Alert.alert('情報の取得に失敗しました');
      }
    } else if (news.urlPath.includes('account')) {
      const id: string = news.urlPath.replace('/account/', '');
      if (typeof Number(id) === 'number') {
        navigation.navigate('EventStack', {
          screen: 'EventDetail',
          params: {id: Number(id)},
        });
      } else {
        Alert.alert('情報の取得に失敗しました');
      }
    }
  };

  useEffect(() => {
    if (data?.news?.length) {
      if (newsForScroll.length) {
        setNewsForScroll([...newsForScroll, ...data.news]);
        return;
      }
      setNewsForScroll([...data.news]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.news]);

  return (
    <WholeContainer>
      <HeaderWithTextButton
        title="Home"
        tabs={tabs}
        activeTabName="ダッシュボード"
        rightButtonName={'ログアウト'}
        onPressRightButton={handleLogout}
      />
      <ScrollDiv mt="lg">
        <Div
          bg="white"
          rounded="md"
          flexDir="column"
          alignItems="center"
          alignSelf="center"
          mb="lg"
          py="lg"
          px="lg"
          w={windowWidth * 0.9}>
          <Text mb={'sm'} fontWeight="bold" fontSize={16}>
            新着の特集記事
          </Text>
          {newsForScroll.length ? (
            newsForScroll.map((news, index) =>
              index < newsIndex * 5 ? (
                <TouchableHighlight
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
                <></>
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
        <Div flexDir="row" justifyContent="center" alignItems="center">
          <Div mb={8} mr={4}>
            <PortalLinkBox type="impressive_university" onPress={console.log} />
          </Div>
          <Div mb={8} mr={4}>
            <PortalLinkBox type="study_meeting" onPress={console.log} />
          </Div>
          <Div mb={8}>
            <PortalLinkBox type="bolday" onPress={console.log} />
          </Div>
        </Div>
        <Div flexDir="row" justifyContent="center" alignItems="center">
          <Div mb={8} mr={4}>
            <PortalLinkBox type="coach" onPress={console.log} />
          </Div>
          <Div mb={8} mr={4}>
            <PortalLinkBox type="club" onPress={console.log} />
          </Div>
          <Div mb={8}>
            <PortalLinkBox type="submission_etc" onPress={console.log} />
          </Div>
        </Div>
        <Div flexDir="row" justifyContent="center" alignItems="center">
          <Div mb={8} mr={4}>
            <PortalLinkBox type="wiki" onPress={console.log} />
          </Div>
          <Div mb={8} mr={4}>
            <PortalLinkBox type="chat" onPress={console.log} />
          </Div>
          <Div mb={8}>
            <PortalLinkBox type="account" onPress={console.log} />
          </Div>
        </Div>
      </ScrollDiv>
    </WholeContainer>
  );
};

export default Home;
