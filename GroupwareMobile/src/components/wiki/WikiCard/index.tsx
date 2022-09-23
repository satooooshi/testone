import React, {useState, useEffect} from 'react';
import {useWindowDimensions, FlatList, TouchableHighlight} from 'react-native';
import {BoardCategory, Wiki, WikiType} from '../../../types';
import {Div, Text, Tag, Icon, Button} from 'react-native-magnus';
import {wikiCardStyles} from '../../../styles/component/wiki/wikiCard.style';
import {wikiTypeColorFactory} from '../../../utils/factory/wiki/wikiTypeColorFactory';
import {wikiTypeNameFactory} from '../../../utils/factory/wiki/wikiTypeNameFactory';
import {useNavigation} from '@react-navigation/native';
import UserAvatar from '../../common/UserAvatar';
import {
  dateTimeFormatterFromJSDDate,
  dateTimeFormatterFromJSDDateWithoutTime,
} from '../../../utils/dateTimeFormatterFromJSDate';
import {useAPIToggleGoodForBoard} from '../../../hooks/api/wiki/useAPIToggleGoodForBoard';
import {useAuthenticate} from '../../../contexts/useAuthenticate';
import {darkFontColor} from '../../../utils/colors';
import GoodSendersModal from '../../chat/GoodSendersModal';
import {useAPIGetGoodsForBoard} from '../../../hooks/api/wiki/useAPIGetGoodForBoard';
import {tagBgColorFactory} from '../../../utils/factory/tagBgColorFactory';
import {tagFontColorFactory} from '../../../utils/factory/tagFontColorFactory';

type WikiCardProps = {
  wiki: Wiki;
  type?: WikiType | undefined;
};

const WikiCard: React.FC<WikiCardProps> = ({wiki, type}) => {
  const windowWidth = useWindowDimensions().width;
  const navigation = useNavigation<any>();
  const routes = navigation.getState()?.routes;
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const isBoard = wiki.type === WikiType.BOARD;
  const isQA = wiki.boardCategory === BoardCategory.QA;
  const [isPressHeart, setIsPressHeart] = useState<boolean>(false);
  const {user} = useAuthenticate();
  const [wikiState, setWikiState] = useState(wiki);
  const {mutate: getGoodsForBoard, data: goodsForBoard} =
    useAPIGetGoodsForBoard();

  const {mutate} = useAPIToggleGoodForBoard({
    onSuccess: () => {
      setIsPressHeart(prevHeartStatus => {
        setWikiState(w => {
          if (prevHeartStatus) {
            w.goodsCount = (w.goodsCount || 0) - 1;
          } else {
            w.goodsCount = (w.goodsCount || 0) + 1;
          }
          return w;
        });
        return !prevHeartStatus;
      });
    },
  });

  useEffect(() => {
    setWikiState(wiki);
    setIsPressHeart(wiki.isGoodSender || false);
  }, [wiki]);

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
        w="95%"
        bg="white"
        rounded={10}
        flexDir="column"
        ml="auto"
        mr="auto"
        p={10}
        mb={10}
        position="relative">
        <Div
          w="100%"
          pl={5}
          alignItems="center"
          flexDir="row"
          mb={
            !type || type === WikiType.BOARD || wiki.tags?.length
              ? 10
              : undefined
          }>
          {!type || type === WikiType.BOARD ? (
            <Tag
              fontSize={'md'}
              h={24}
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
          ) : null}
          {wiki.tags && wiki.tags.length ? (
            <FlatList
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
                  fontSize={'md'}
                  h={24}
                  py={0}
                  bg={tagBgColorFactory(t.type)}
                  color={tagFontColorFactory(t.type)}
                  ml={4}>
                  {t.name}
                </Tag>
              )}
            />
          ) : null}
        </Div>
        <Div flexDir={'row'} w="100%" alignItems="center" mb={10}>
          <Text fontSize={12} color={darkFontColor}>
            {`投稿: ${dateTimeFormatterFromJSDDateWithoutTime({
              dateTime: new Date(wiki.createdAt),
            })}`}
          </Text>
          <Text ml={10} fontSize={12} color={darkFontColor}>
            {`最終更新: ${dateTimeFormatterFromJSDDateWithoutTime({
              dateTime: new Date(wiki.updatedAt),
            })}`}
          </Text>
        </Div>
        <Div w={'100%'} px={8} flexDir="row" alignItems="center">
          {wiki.type !== WikiType.RULES && (
            <Div mr={8}>
              <UserAvatar user={wiki.writer} h={48} w={48} GoProfile={true} />
            </Div>
          )}
          <Text w={'80%'} numberOfLines={2} fontWeight="bold" fontSize={18}>
            {wiki.title}
          </Text>
        </Div>
        {isBoard ? (
          <Div
            ml="auto"
            mr={10}
            flexDir="row"
            alignItems="center"
            justifyContent="flex-end">
            <Div
              flexDir="row"
              alignItems="center"
              justifyContent="center"
              mb={4}
              mr={4}>
              <TouchableHighlight onPress={() => setIsVisible(true)}>
                <Text>いいね</Text>
              </TouchableHighlight>
              <Text mx={1} color="#90CDF4" fontWeight="bold">
                {wikiState.goodsCount || 0}
              </Text>
              <Div ml={5} mr="lg" flexDir="row">
                <Text textAlignVertical="bottom" mr={2}>
                  {isQA ? '回答' : 'コメント'}
                </Text>
                <Text color="#90CDF4" fontWeight="bold">
                  {wikiState.answersCount || 0}
                </Text>
              </Div>
            </Div>
            <TouchableHighlight
              underlayColor={'none'}
              onPress={() => mutate(wiki.id)}>
              {isPressHeart ? (
                <Icon
                  name="heart"
                  fontFamily="AntDesign"
                  fontSize={25}
                  color={'red'}
                  mr={3}
                />
              ) : (
                <Icon
                  name="hearto"
                  fontFamily="AntDesign"
                  fontSize={25}
                  color={darkFontColor}
                  mr={3}
                />
              )}
            </TouchableHighlight>
          </Div>
        ) : null}

        <Div flexDir="row">
          {goodsForBoard && (
            <GoodSendersModal
              isVisible={isVisible}
              onClose={() => setIsVisible(false)}
              goodsForBoard={goodsForBoard}
            />
          )}
        </Div>
      </Div>
    </TouchableHighlight>
  );
};

export default WikiCard;
