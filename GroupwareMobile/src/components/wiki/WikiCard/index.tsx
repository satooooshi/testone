import React from 'react';
import {useWindowDimensions, FlatList, TouchableHighlight} from 'react-native';
import {Wiki} from '../../../types';
import {Div, Avatar, Text, Tag} from 'react-native-magnus';
import {tagColorFactory} from '../../../utils/factory/tagColorFactory';
import {wikiCardStyles} from '../../../styles/component/wiki/wikiCard.style';
import {wikiTypeColorFactory} from '../../../utils/factory/wiki/wikiTypeColorFactory';
import {wikiTypeNameFactory} from '../../../utils/factory/wiki/wikiTypeNameFactory';

type WikiCardProps = {
  wiki: Wiki;
  onPress: (wiki: Wiki) => void;
};

const WikiCard: React.FC<WikiCardProps> = ({wiki, onPress}) => {
  const windowWidth = useWindowDimensions().width;
  return (
    <TouchableHighlight underlayColor="none" onPress={() => onPress(wiki)}>
      <Div
        flexDir="column"
        w={windowWidth}
        borderBottomWidth={1}
        h={104}
        bg="#eceeec"
        borderColor="#b0b0b0">
        <Div
          w={'100%'}
          px={8}
          h={'60%'}
          mb={4}
          flexDir="row"
          alignItems="center">
          <Avatar
            mr={8}
            source={
              !wiki.writer?.existence
                ? require('../../../../assets/bold-mascot.png')
                : wiki.writer?.avatarUrl
                ? {uri: wiki.writer?.avatarUrl}
                : require('../../../../assets/no-image-avatar.png')
            }
          />
          <Text w={'80%'} numberOfLines={2} fontWeight="bold" fontSize={22}>
            {wiki.title}
          </Text>
        </Div>
        <Div flexDir="row">
          <Tag
            fontSize={'lg'}
            h={28}
            py={0}
            bg={wikiTypeColorFactory(wiki.type, wiki.ruleCategory)}
            color="white"
            ml={4}>
            {wikiTypeNameFactory(wiki.type, wiki.ruleCategory)}
          </Tag>
          {wiki?.tags?.length ? (
            <FlatList
              style={wikiCardStyles.tagList}
              horizontal
              data={wiki?.tags || []}
              renderItem={({item: t}) => (
                <Tag
                  fontSize={'lg'}
                  h={28}
                  py={0}
                  bg={tagColorFactory(t.type)}
                  color="white"
                  mr={4}>
                  {t.name}
                </Tag>
              )}
            />
          ) : (
            <Tag
              fontSize={'lg'}
              h={28}
              py={0}
              bg={'orange'}
              color="white"
              ml={4}>
              タグなし
            </Tag>
          )}
        </Div>
      </Div>
    </TouchableHighlight>
  );
};

export default WikiCard;
