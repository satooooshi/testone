import React, {useState, useEffect} from 'react';
import {useWindowDimensions, FlatList, TouchableHighlight} from 'react-native';
import {BoardCategory, User, Wiki, WikiType} from '../../../types';
import {Div, Text, Tag, Icon, Button} from 'react-native-magnus';
import {tagColorFactory} from '../../../utils/factory/tagColorFactory';
import {wikiCardStyles} from '../../../styles/component/wiki/wikiCard.style';
import {wikiTypeColorFactory} from '../../../utils/factory/wiki/wikiTypeColorFactory';
import {wikiTypeNameFactory} from '../../../utils/factory/wiki/wikiTypeNameFactory';
import {useNavigation} from '@react-navigation/native';
import UserAvatar from '../../common/UserAvatar';
import {dateTimeFormatterFromJSDDate} from '../../../utils/dateTimeFormatterFromJSDate';
import {useAPIToggleGoodForBoard} from '../../../hooks/api/wiki/useAPIToggleGoodForBoard';
import {useAuthenticate} from '../../../contexts/useAuthenticate';
import {darkFontColor} from '../../../utils/colors';
import GoodSendersModal from '../../chat/GoodSendersModal';
import {useAPIGetGoodsForBoard} from '../../../hooks/api/wiki/useAPIGetGoodForBoard';
import {ActivityIndicator} from 'react-native-paper';

type WikiCardProps = {
  wiki: Wiki;
};

const WikiCard: React.FC<WikiCardProps> = ({wiki}) => {
  const windowWidth = useWindowDimensions().width;
  const navigation = useNavigation<any>();
  const routes = navigation.getState()?.routes;
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const isBoard = wiki.type === WikiType.BOARD;
  const isQA = wiki.boardCategory === BoardCategory.QA;
  const [isPressHeart, setIsPressHeart] = useState<boolean>(
    wiki.isGoodSender || false,
  );
  const {user} = useAuthenticate();
  const [wikiState, setWikiState] = useState(wiki);

  const {
    mutate: getGoodsForBoard,
    data: goodsForBoard,
    isLoading,
  } = useAPIGetGoodsForBoard({
    onSuccess: res => {
      const senderIDs = res.map(g => g.user.id);
      const isGoodSender = senderIDs.some(id => id === user?.id);
      if (isGoodSender) {
        setWikiState(w => ({...w, isGoodSender: true}));
        setIsPressHeart(true);
      }
    },
  });

  const {mutate} = useAPIToggleGoodForBoard({
    onSuccess: () => {
      getGoodsForBoard(wiki.id);
      setIsPressHeart(prevHeartStatus => {
        return !prevHeartStatus;
      });
    },
  });

  useEffect(() => {
    setWikiState(wiki);
    getGoodsForBoard(wiki.id);
  }, [wiki, getGoodsForBoard]);

  return (
    <TouchableHighlight
      underlayColor="none"
      onPress={() =>
        navigation.navigate('WikiStack', {
          screen: 'WikiDetail',
          params: {id: wiki.id, previousScreenName: routes[routes?.length - 1]},
          initial: false,
        })
      }>
      <Div
        flexDir="column"
        w={windowWidth}
        borderBottomWidth={1}
        py={4}
        bg="#eceeec"
        borderColor="#b0b0b0">
        <Div w={'100%'} px={8} flexDir="row" alignItems="center">
          {wiki.type !== WikiType.RULES && (
            <Div mr={8}>
              <UserAvatar user={wiki.writer} h={48} w={48} GoProfile={true} />
            </Div>
          )}
          <Text w={'80%'} numberOfLines={2} fontWeight="bold" fontSize={22}>
            {wiki.title}
          </Text>
        </Div>
        <Div flexDir="column" w="100%">
          <Div flexDir="row" justifyContent="flex-end" mb={4} mr={4}>
            {/* {isBoard ? (
              <Div mr="lg" flexDir="row">
                <Text textAlignVertical="bottom" mr={2}>
                  {isQA ? '回答' : 'コメント'}
                </Text>
                <Text
                  color="green600"
                  textAlignVertical="bottom"
                  fontSize={18}
                  mt={-3}>
                  {wiki.answers?.length.toString() || 0}
                </Text>
              </Div>
            ) : null} */}
            <Div flexDir="column" alignItems="flex-end">
              <Text textAlignVertical="bottom" textAlign="center">
                {`投稿日: ${dateTimeFormatterFromJSDDate({
                  dateTime: new Date(wiki.createdAt),
                })}`}
              </Text>
              <Text textAlignVertical="bottom" textAlign="center">
                {`最終更新日: ${dateTimeFormatterFromJSDDate({
                  dateTime: new Date(wiki.updatedAt),
                })}`}
              </Text>
            </Div>
          </Div>
        </Div>

        <Div flexDir="row">
          {wiki?.tags?.length ? (
            <FlatList
              ListHeaderComponent={
                <Tag
                  fontSize={'lg'}
                  h={28}
                  py={0}
                  bg={wikiTypeColorFactory(wiki.type, wiki.ruleCategory)}
                  color="white"
                  ml={4}>
                  {wikiTypeNameFactory(
                    wiki.type,
                    wiki.ruleCategory,
                    true,
                    wiki?.boardCategory,
                  )}
                </Tag>
              }
              style={wikiCardStyles.tagList}
              horizontal
              data={wiki?.tags || []}
              renderItem={({item: t}) => (
                <Tag
                  onPress={() =>
                    navigation.navigate('WikiStack', {
                      screen: 'WikiList',
                      params: {tag: t.id.toString()},
                    })
                  }
                  fontSize={'lg'}
                  h={28}
                  py={0}
                  bg={tagColorFactory(t.type)}
                  color="white"
                  ml={4}>
                  {t.name}
                </Tag>
              )}
            />
          ) : (
            <>
              <Tag
                fontSize={'lg'}
                h={28}
                py={0}
                bg={wikiTypeColorFactory(wiki.type, wiki.ruleCategory)}
                color="white"
                ml={4}>
                {wikiTypeNameFactory(
                  wiki.type,
                  wiki.ruleCategory,
                  true,
                  wiki?.boardCategory,
                )}
              </Tag>
            </>
          )}
          {wiki.type === WikiType.BOARD && (
            <Div flexDir="row" ml="auto" mr={5}>
              <TouchableHighlight
                underlayColor={'none'}
                onPress={() => mutate(wiki.id)}>
                {isPressHeart ? (
                  <Icon
                    name="heart"
                    fontFamily="AntDesign"
                    fontSize={35}
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
        </Div>
      </Div>
    </TouchableHighlight>
  );
};

export default WikiCard;
