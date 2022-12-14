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
  Image,
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
import {FAB} from 'react-native-paper';
import MarkdownIt from 'markdown-it';
import {useHTMLScrollFeature} from '../../../hooks/scroll/useHTMLScrollFeature';
import {useDom} from '../../../hooks/dom/useDom';
import {generateClientURL} from '../../../utils/url';
import UserAvatar from '../../../components/common/UserAvatar';
import tailwind from 'tailwind-rn';
import {useAuthenticate} from '../../../contexts/useAuthenticate';
import GoodSendersModal from '../../../components/chat/GoodSendersModal';
import {useAPIToggleGoodForBoard} from '../../../hooks/api/wiki/useAPIToggleGoodForBoard';
import {
  dateTimeFormatterFromJSDDate,
  dateTimeFormatterFromJSDDateWithoutTime,
} from '../../../utils/dateTimeFormatterFromJSDate';
import {useIsTabBarVisible} from '../../../contexts/bottomTab/useIsTabBarVisible';
import {wikiCardStyles} from '../../../styles/component/wiki/wikiCard.style';
import FileIcon from '../../../components/common/FileIcon';
import ImageView from 'react-native-image-viewing';
import DownloadIcon from '../../../components/common/DownLoadIcon';
import ChatShareIcon from '../../../components/common/ChatShareIcon';
import {useAPIGetGoodsForBoard} from '../../../hooks/api/wiki/useAPIGetGoodForBoard';
import {tagBgColorFactory} from '../../../utils/factory/tagBgColorFactory';
import {tagFontColorFactory} from '../../../utils/factory/tagFontColorFactory';
import ShareTextButton from '../../../components/common/ShareTextButton';

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
  const [imageModal, setImageModal] =
    useState<{index: number; visible: boolean}>();

  const mdParser = new MarkdownIt({breaks: true});
  const wikiBody =
    wikiState?.textFormat === 'html'
      ? wikiState?.body
      : wikiState?.textFormat === 'markdown'
      ? mdParser.render(wikiState?.body || '')
      : '';
  const {dom, headings, imageUrls} = useDom(wikiBody);
  const {scrollViewRef, scroller} = useHTMLScrollFeature(wikiState?.body);
  const {mutate: getGoodsForBoard, data: goodsForBoard} =
    useAPIGetGoodsForBoard();
  const onPressEntry = useCallback(
    (entry: string) => {
      setIsVisibleTOCModal(false);
      scroller.scrollToEntry(entry);
      setActiveEntry(entry);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scroller],
  );

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
      setIsTabBarVisible(false);
    } else {
      setIsTabBarVisible(true);
    }
  }, [isFocused, refetchWikiInfo, setIsTabBarVisible, id]);

  const headerTitle = wikiTypeName + '??????';
  const headerRightButtonName =
    authUser?.id === wikiState?.writer?.id || authUser?.role === UserRole.ADMIN
      ? wikiTypeName + '?????????'
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
      setIsPressHeart(prevHeartStatus => {
        setWikiState(w => {
          if (w) {
            if (prevHeartStatus) {
              w.goodsCount = (w.goodsCount || 0) - 1;
            } else {
              w.goodsCount = (w.goodsCount || 0) + 1;
            }
            return w;
          }
        });
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
        // eslint-disable-next-line react-native/no-inline-styles
        style={{backgroundColor: 'white'}}
        contentContainerStyle={{
          ...wikiDetailStyles.wrapper,
          width: windowWidth,
        }}>
        {wikiState && wikiState.writer ? (
          <Div flexDir="column" w={'100%'}>
            {wikiState?.tags ? (
              <FlatList
                style={tailwind('my-2')}
                horizontal
                data={wikiState?.tags || []}
                renderItem={({item: t}) => (
                  <Tag
                    fontSize={'md'}
                    py="sm"
                    px="md"
                    bg={tagBgColorFactory(t.type)}
                    color={tagFontColorFactory(t.type)}
                    mr={4}>
                    {t.name}
                  </Tag>
                )}
              />
            ) : null}
            <Div mb={16} flexDir="row" justifyContent="space-between" mt="sm">
              <Text
                fontWeight="bold"
                fontSize={24}
                color={darkFontColor}
                mt={16}
                w={'70%'}>
                {wikiState.title}
              </Text>
              {/* <ShareButton
                urlPath={generateClientURL(`/wiki/detail/${wikiState.id}`)}
                text={wikiState.title}
              /> */}
            </Div>

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
              <Div flexDir="column" alignItems="flex-start" mt={10}>
                <Text textAlignVertical="bottom" textAlign="center">
                  {`?????????: ${dateTimeFormatterFromJSDDateWithoutTime({
                    dateTime: new Date(wikiState.createdAt),
                  })}`}
                </Text>
                <Text textAlignVertical="bottom" textAlign="center">
                  {`???????????????: ${dateTimeFormatterFromJSDDateWithoutTime({
                    dateTime: new Date(wikiState.updatedAt),
                  })}`}
                </Text>
              </Div>
            </Div>

            <Div flexDir="row" alignItems="center">
              <ShareTextButton
                urlPath={generateClientURL(`/wiki/detail/${wikiState.id}`)}
                text={wikiState.title}
              />
              {wikiState?.type === WikiType.BOARD && (
                <>
                  <Button
                    mx="md"
                    rounded="circle"
                    bg="white"
                    borderWidth={1}
                    borderColor="gray400"
                    onPress={() => {
                      mutate(wikiState.id);
                    }}>
                    {isPressHeart ? (
                      <Icon
                        name="heart"
                        fontFamily="AntDesign"
                        fontSize={'xl'}
                        color={'red'}
                      />
                    ) : (
                      <Icon
                        name="hearto"
                        fontFamily="AntDesign"
                        fontSize={'xl'}
                        color={darkFontColor}
                      />
                    )}
                  </Button>
                  <TouchableOpacity
                    onPress={() => {
                      getGoodsForBoard(wikiState.id);
                      setIsVisible(true);
                    }}>
                    <Div row alignItems="center">
                      <Text fontSize="lg" fontWeight="bold">
                        {wikiState.goodsCount}???
                      </Text>
                      <Text> ????????????</Text>
                    </Div>
                  </TouchableOpacity>
                </>
              )}
            </Div>

            <Div bg="white" rounded="md" p={8} mb={16}>
              {dom && <WikiBodyRenderer dom={dom} />}
            </Div>
          </Div>
        ) : null}
        <ScrollDiv mb={5} flexDir="row" horizontal>
          {imageUrls.length
            ? imageUrls.map((i, index) => (
                <TouchableHighlight
                  onPress={() => setImageModal({visible: true, index: index})}>
                  <Image
                    w={50}
                    h={50}
                    mt={5}
                    mb={20}
                    mr={5}
                    source={{uri: i}}
                  />
                </TouchableHighlight>
              ))
            : null}
        </ScrollDiv>
        <Text fontWeight="bold" fontSize={16}>
          {wikiInfo?.files?.length ? '??????????????????' : null}
        </Text>
        <Div flexDir="row" flexWrap="wrap" mt={10} mb={10}>
          {wikiInfo?.files?.map(f =>
            f.url && f.name ? (
              <Div mr={4} mb={4}>
                <FileIcon url={f.url} name={f.name} />
              </Div>
            ) : null,
          )}
        </Div>
        <ImageView
          animationType="slide"
          images={imageUrls.map(i => {
            return {uri: i};
          })}
          imageIndex={imageModal?.index ? imageModal?.index : 0}
          visible={!!imageModal?.visible}
          onRequestClose={() => setImageModal(undefined)}
          swipeToCloseEnabled={false}
          doubleTapToZoomEnabled={true}
          FooterComponent={({imageIndex}) => (
            <Div>
              <DownloadIcon url={imageUrls[imageIndex]} />
              <ChatShareIcon
                image={{
                  fileName: `image${imageIndex + 1}.png`,
                  uri: imageUrls[imageIndex],
                }}
              />
            </Div>
          )}
        />

        {goodsForBoard && (
          <GoodSendersModal
            isVisible={isVisible}
            onClose={() => setIsVisible(false)}
            goodsForBoard={goodsForBoard}
          />
        )}
        {wikiState?.type === WikiType.BOARD ? (
          <Div w={windowWidth * 0.9} alignSelf="center">
            <Button
              alignSelf="center"
              rounded="xl"
              w={windowWidth * 0.8}
              mb="xl"
              bg="blue700"
              fontWeight="bold"
              color="white"
              onPress={onPressPostAnswerButton}>
              {wikiState.boardCategory === BoardCategory.QA
                ? '????????????'
                : '???????????????????????????'}
            </Button>

            <Div
              justifyContent="space-between"
              alignItems="center"
              flexDir="row"
              mb={10}
              pb={10}
              borderBottomWidth={1}
              borderBottomColor="gray400">
              <Text fontWeight="bold" fontSize={20} color={darkFontColor}>
                {wikiState.boardCategory === BoardCategory.QA
                  ? '??????'
                  : '????????????'}
              </Text>
            </Div>

            <Text fontSize={14} mb="lg">
              {wikiState?.answers?.length ? wikiState.answers.length : 0}??????
              {wikiState.boardCategory === BoardCategory.QA
                ? '??????'
                : '????????????'}
            </Text>

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
