import React, {useCallback, useEffect, useState} from 'react';
import WholeContainer from '../../../components/WholeContainer';
import {
  Div,
  Text,
  Button,
  Tag,
  Icon,
  ScrollDiv,
  Modal,
} from 'react-native-magnus';
import {useAPIGetWikiDetail} from '../../../hooks/api/wiki/useAPIGetWikiDetail';
import {
  StyleSheet,
  TouchableOpacity,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import HeaderWithTextButton from '../../../components/Header';
import {wikiTypeNameFactory} from '../../../utils/factory/wiki/wikiTypeNameFactory';
import {
  darkFontColor,
  wikiAnswerButtonColor,
  wikiBorderColor,
} from '../../../utils/colors';
import {userNameFactory} from '../../../utils/factory/userNameFactory';
import {wikiDetailStyles} from '../../../styles/screen/wiki/wikiDetail.style';
import {BoardCategory, User, UserRole, WikiType} from '../../../types';
import {WikiDetailProps} from '../../../types/navigator/drawerScreenProps';
import {useIsFocused} from '@react-navigation/core';
import AnswerList from '../AnswerList';
import {ScrollerProvider} from '../../../utils/htmlScroll/scroller';
import {ScrollView, TouchableHighlight} from 'react-native-gesture-handler';
import WikiBodyRenderer from '../../../components/wiki/WikiBodyRenderer';
import TOC from '../../../components/wiki/TOC';
import {ActivityIndicator, FAB} from 'react-native-paper';
import MarkdownIt from 'markdown-it';
import {useHTMLScrollFeature} from '../../../hooks/scroll/useHTMLScrollFeature';
import {useDom} from '../../../hooks/dom/useDom';
import ShareButton from '../../../components/common/ShareButton';
import {generateClientURL} from '../../../utils/url';
import UserAvatar from '../../../components/common/UserAvatar';
import {tagColorFactory} from '../../../utils/factory/tagColorFactory';
import tailwind from 'tailwind-rn';
import {useAuthenticate} from '../../../contexts/useAuthenticate';
import GoodSendersModal from '../../../components/chat/GoodSendersModal';
import {useAPIToggleGoodForBoard} from '../../../hooks/api/wiki/useAPIToggleGoodForBoard';
import {dateTimeFormatterFromJSDDate} from '../../../utils/dateTimeFormatterFromJSDate';
import {useIsTabBarVisible} from '../../../contexts/bottomTab/useIsTabBarVisible';
import {useAPIGetGoodsForBoard} from '../../../hooks/api/wiki/useAPIGetGoodForBoard';

const WikiDetail: React.FC<WikiDetailProps> = ({navigation, route}) => {
  const isFocused = useIsFocused();
  const {user: authUser} = useAuthenticate();
  const {id} = route.params;
  const {width: windowWidth} = useWindowDimensions();
  const {data: wikiInfo, refetch: refetchWikiInfo} = useAPIGetWikiDetail(id);
  const {user} = useAuthenticate();
  const [wikiTypeName, setWikiTypeName] = useState('Wiki');
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const {setIsTabBarVisible} = useIsTabBarVisible();
  const [isPressHeart, setIsPressHeart] = useState<boolean>(
    wikiInfo?.isGoodSender || false,
  );
  const [wikiState, setWikiState] = useState(wikiInfo);
  const [isVisibleTOCModal, setIsVisibleTOCModal] = useState<boolean>(false);
  const [activeEntry, setActiveEntry] = useState<string>('');

  const mdParser = new MarkdownIt({breaks: true});
  const wikiBody =
    wikiState?.textFormat === 'html'
      ? wikiState?.body
      : wikiState?.textFormat === 'markdown'
      ? mdParser.render(wikiState?.body || '')
      : '';
  const {dom, headings} = useDom(wikiBody);
  const {scrollViewRef, scroller} = useHTMLScrollFeature(wikiState?.body);
  const onPressEntry = useCallback(
    (entry: string) => {
      setIsVisibleTOCModal(false);
      scroller.scrollToEntry(entry);
      setActiveEntry(entry);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scroller],
  );

  const {
    mutate: getGoodsForBoard,
    data: goodsForBoard,
    isLoading,
  } = useAPIGetGoodsForBoard({
    onSuccess: res => {
      const senderIDs = res.map(g => g.user.id);
      const isGoodSender = senderIDs.some(id => id === user?.id);
      if (isGoodSender) {
        setIsPressHeart(true);
      }
    },
  });
  const renderToc = useCallback(
    function renderToc() {
      return (
        <TOC
          headings={headings}
          onPressEntry={onPressEntry}
          activeEntry={activeEntry}
          setActiveEntry={setActiveEntry}
        />
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [headings, activeEntry],
  );

  useEffect(() => {
    if (wikiInfo) {
      const nameStr = wikiTypeNameFactory(wikiInfo.type, wikiInfo.ruleCategory);
      setWikiTypeName(nameStr);
      setIsPressHeart(wikiInfo.isGoodSender || false);
      setWikiState(wikiInfo);
    }
  }, [wikiInfo]);

  useEffect(() => {
    if (isFocused) {
      refetchWikiInfo();
      getGoodsForBoard(id);
      setIsTabBarVisible(false);
    } else {
      setIsTabBarVisible(true);
    }
  }, [isFocused, refetchWikiInfo, setIsTabBarVisible, getGoodsForBoard, id]);

  const headerTitle = wikiTypeName + '詳細';
  const headerRightButtonName =
    authUser?.id === wikiState?.writer?.id || authUser?.role === UserRole.ADMIN
      ? wikiTypeName + 'を編集'
      : undefined;

  const onPressHeaderRightButton = () => {
    if (wikiState) {
      navigation.navigate('WikiStack', {
        screen: 'EditWiki',
        params: {id: wikiState.id},
      });
    }
    // else error handling
  };

  const onPressPostAnswerButton = () => {
    if (wikiState) {
      navigation.navigate('WikiStack', {
        screen: 'PostAnswer',
        params: {id: wikiState.id},
      });
    }
    // else error handling
  };

  const onPressAvatar = (user: User) => {
    navigation.navigate('AccountStack', {
      screen: 'AccountDetail',
      params: {id: user.id},
    });
  };

  const renderingTOCNeeded =
    !(
      wikiState?.type === WikiType.BOARD &&
      wikiState?.boardCategory === BoardCategory.QA
    ) && headings.length;

  const {mutate} = useAPIToggleGoodForBoard({
    onSuccess: () => {
      getGoodsForBoard(id);
      setIsPressHeart(prevHeartStatus => {
        return !prevHeartStatus;
      });
    },
  });

  const article = (
    <ScrollerProvider scroller={scroller}>
      <ScrollView
        {...scroller.handlers}
        ref={scrollViewRef}
        scrollEventThrottle={100}
        contentContainerStyle={{
          ...wikiDetailStyles.wrapper,
          width: windowWidth * 0.9,
        }}>
        {wikiState && wikiState.writer ? (
          <Div flexDir="column" w={'100%'}>
            <Div mb={16} flexDir="row" justifyContent="space-between" mt="sm">
              <Text
                fontWeight="bold"
                fontSize={24}
                color={darkFontColor}
                mt={16}
                w={'70%'}>
                {wikiState.title}
              </Text>
              <ShareButton
                urlPath={generateClientURL(`/wiki/detail/${wikiState.id}`)}
                text={wikiState.title}
              />
            </Div>
            <FlatList
              style={tailwind('mb-4')}
              horizontal
              data={wikiState?.tags || []}
              renderItem={({item: t}) => (
                <Tag
                  fontSize={'md'}
                  h={21}
                  py={0}
                  px={8}
                  bg={tagColorFactory(t.type)}
                  color="white"
                  mr={4}>
                  {t.name}
                </Tag>
              )}
            />
            <Div flexDir="column" mb={16}>
              <Div
                flexDir="row"
                justifyContent="flex-start"
                alignItems="center">
                <TouchableOpacity
                  onPress={() => {
                    if (wikiState.writer && wikiState.writer.existence) {
                      onPressAvatar(wikiState.writer);
                    }
                  }}>
                  <Div mr={8}>
                    <UserAvatar
                      h={48}
                      w={48}
                      user={wikiState.writer}
                      GoProfile={true}
                    />
                  </Div>
                </TouchableOpacity>
                <Text fontSize={18} color={darkFontColor}>
                  {userNameFactory(wikiState.writer)}
                </Text>
              </Div>
              <Div flexDir="column" alignItems="flex-end">
                <Text textAlignVertical="bottom" textAlign="center">
                  {`投稿日: ${dateTimeFormatterFromJSDDate({
                    dateTime: new Date(wikiState.createdAt),
                  })}`}
                </Text>
                <Text textAlignVertical="bottom" textAlign="center">
                  {`最終更新日: ${dateTimeFormatterFromJSDDate({
                    dateTime: new Date(wikiState.updatedAt),
                  })}`}
                </Text>
              </Div>
            </Div>
            <Div bg="white" rounded="md" p={8} mb={16}>
              {dom && <WikiBodyRenderer dom={dom} />}
            </Div>
          </Div>
        ) : null}
        {wikiState?.type === WikiType.BOARD && (
          <Div flexDir="row" ml="auto" mb={10}>
            <TouchableHighlight
              underlayColor={'none'}
              onPress={() => mutate(wikiState.id)}>
              {isPressHeart ? (
                <Icon
                  name="heart"
                  fontFamily="AntDesign"
                  fontSize={37}
                  color={'red'}
                  mr={3}
                />
              ) : (
                <Icon
                  name="hearto"
                  fontFamily="AntDesign"
                  fontSize={35}
                  color={darkFontColor}
                  mr={3}
                />
              )}
            </TouchableHighlight>
            <Button onPress={() => setIsVisible(true)}>
              {!isLoading && goodsForBoard ? (
                `${goodsForBoard?.map(g => g.user).length}件のいいね`
              ) : (
                <ActivityIndicator />
              )}
            </Button>
          </Div>
        )}
        <GoodSendersModal
          goodSenders={goodsForBoard?.map(g => g.user) || []}
          isVisible={isVisible}
          onClose={() => setIsVisible(false)}
        />
        {wikiState?.type === WikiType.BOARD ? (
          <Div w={windowWidth * 0.9} alignSelf="center">
            <Div
              justifyContent="space-between"
              alignItems="center"
              flexDir="row"
              mb={10}
              pb={10}
              borderBottomWidth={1}
              borderBottomColor={wikiBorderColor}>
              <Text fontWeight="bold" fontSize={24} color={darkFontColor}>
                {wikiState.boardCategory === BoardCategory.QA
                  ? '回答'
                  : 'コメント'}
                {wikiState?.answers?.length ? wikiState.answers.length : 0}件
              </Text>
              <Button
                alignSelf="center"
                h={32}
                fontSize={16}
                py={0}
                px={10}
                onPress={onPressPostAnswerButton}
                bg={wikiAnswerButtonColor}
                color="white">
                {wikiState.boardCategory === BoardCategory.QA
                  ? wikiState?.answers?.length
                    ? '回答を追加する'
                    : '回答を投稿する'
                  : wikiState?.answers?.length
                  ? 'コメントを追加する'
                  : 'コメントを投稿する'}
              </Button>
            </Div>

            <AnswerList wiki={wikiState} onPressAvatar={onPressAvatar} />
          </Div>
        ) : null}
      </ScrollView>
    </ScrollerProvider>
  );

  return (
    <WholeContainer>
      <HeaderWithTextButton
        title={headerTitle}
        rightButtonName={headerRightButtonName}
        onPressRightButton={onPressHeaderRightButton}
        enableBackButton={true}
        screenForBack={
          route.params?.previousScreenName
            ? route.params.previousScreenName
            : undefined
        }
      />
      {renderingTOCNeeded ? (
        <>
          {article}
          <FAB
            style={styles.fab}
            color="#61dafb"
            icon="format-list-bulleted-square"
            onPress={() => setIsVisibleTOCModal(true)}
          />
          <Modal h={400} isVisible={isVisibleTOCModal}>
            <ScrollDiv>
              <Button
                bg="gray400"
                h={35}
                w={35}
                right={0}
                alignSelf="flex-end"
                rounded="circle"
                onPress={() => setIsVisibleTOCModal(false)}>
                <Icon color="black" name="close" />
              </Button>
              {renderToc()}
            </ScrollDiv>
          </Modal>
        </>
      ) : (
        article
      )}
    </WholeContainer>
  );
};

export default WikiDetail;

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'white',
  },
});
