import React from 'react';
import {useWindowDimensions, FlatList, TouchableOpacity} from 'react-native';
import {Wiki} from '../../../types';
import {Div, Avatar, Text, Tag, Icon} from 'react-native-magnus';
import {tagColorFactory} from '../../../utils/factory/tagColorFactory';
import {wikiCardStyles} from '../../../styles/component/wiki/wikiCard.style';

type WikiCardProps = {
  wiki: Wiki;
  onPress: (wiki: Wiki) => void;
};

const WikiCard: React.FC<WikiCardProps> = ({wiki, onPress}) => {
  const windowWidth = useWindowDimensions().width;
  return (
    <TouchableOpacity onPress={() => onPress(wiki)}>
      <Div
        flexDir="column"
        w={windowWidth}
        justifyContent="space-between"
        borderBottomWidth={1}
        h={120}
        bg="#eceeec"
        borderColor="#b0b0b0">
        <Div px={8} h={'60%'} mb={16} flexDir="row" alignItems="center">
          {wiki.writer?.avatarUrl ? (
            <Avatar mr={8} source={{uri: wiki.writer?.avatarUrl}} />
          ) : (
            <Avatar mr={8} bg="gray500" rounded="circle">
              <Icon
                name="user"
                color="white"
                fontSize="6xl"
                fontFamily="Feather"
              />
            </Avatar>
          )}
          <Text numberOfLines={2} fontWeight="bold" fontSize={22}>
            {wiki.title}
          </Text>
        </Div>
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
      </Div>
    </TouchableOpacity>
  );
};

export default WikiCard;
