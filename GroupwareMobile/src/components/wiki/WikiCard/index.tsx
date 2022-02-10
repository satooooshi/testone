import React from 'react';
import {useWindowDimensions, FlatList, TouchableHighlight} from 'react-native';
import {BoardCategory, Wiki, WikiType} from '../../../types';
import {Div, Text, Tag} from 'react-native-magnus';
import {tagColorFactory} from '../../../utils/factory/tagColorFactory';
import {wikiCardStyles} from '../../../styles/component/wiki/wikiCard.style';
import {wikiTypeColorFactory} from '../../../utils/factory/wiki/wikiTypeColorFactory';
import {wikiTypeNameFactory} from '../../../utils/factory/wiki/wikiTypeNameFactory';
import {useNavigation} from '@react-navigation/native';
import UserAvatar from '../../common/UserAvatar';
import {dateTimeFormatterFromJSDDate} from '../../../utils/dateTimeFormatterFromJSDate';

type WikiCardProps = {
  wiki: Wiki;
};

const WikiCard: React.FC<WikiCardProps> = ({wiki}) => {
  const windowWidth = useWindowDimensions().width;
  const navigation = useNavigation<any>();
  const isQA =
    wiki.type === WikiType.BOARD && wiki.boardCategory === BoardCategory.QA;
  return (
    <TouchableHighlight
      underlayColor="none"
      onPress={() =>
        navigation.navigate('WikiStack', {
          screen: 'WikiDetail',
          params: {id: wiki.id},
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
              <UserAvatar user={wiki.writer} h={48} w={48} />
            </Div>
          )}
          <Text w={'80%'} numberOfLines={2} fontWeight="bold" fontSize={22}>
            {wiki.title}
          </Text>
        </Div>
        <Div flexDir="row" justifyContent="flex-end" mb={4} mr={4}>
          {isQA ? (
            <Div mr="lg" flexDir="row">
              <Text textAlignVertical="bottom" mr={2}>
                回答
              </Text>
              <Text
                color="green600"
                textAlignVertical="bottom"
                fontSize={18}
                mt={-3}>
                {wiki.answers?.length.toString() || 0}
              </Text>
            </Div>
          ) : null}
          <Text textAlignVertical="bottom" textAlign="center">
            {dateTimeFormatterFromJSDDate({dateTime: new Date(wiki.createdAt)})}
          </Text>
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
                  {wikiTypeNameFactory(wiki.type, wiki.ruleCategory)}
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
                {wikiTypeNameFactory(wiki.type, wiki.ruleCategory)}
              </Tag>
            </>
          )}
        </Div>
      </Div>
    </TouchableHighlight>
  );
};

export default WikiCard;
