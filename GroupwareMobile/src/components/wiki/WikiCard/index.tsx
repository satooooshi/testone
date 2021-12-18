import React from 'react';
import {useWindowDimensions, FlatList, TouchableHighlight} from 'react-native';
import {Wiki} from '../../../types';
import {Div, Text, Tag} from 'react-native-magnus';
import {tagColorFactory} from '../../../utils/factory/tagColorFactory';
import {wikiCardStyles} from '../../../styles/component/wiki/wikiCard.style';
import {useNavigation} from '@react-navigation/native';
import UserAvatar from '../../common/UserAvatar';

type WikiCardProps = {
  wiki: Wiki;
};

const WikiCard: React.FC<WikiCardProps> = ({wiki}) => {
  const windowWidth = useWindowDimensions().width;
  const navigation = useNavigation<any>();
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
          <Div mr={8}>
            <UserAvatar user={wiki.writer} h={48} w={48} />
          </Div>
          <Text w={'80%'} numberOfLines={2} fontWeight="bold" fontSize={22}>
            {wiki.title}
          </Text>
        </Div>
        {wiki?.tags?.length ? (
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
          <Tag fontSize={'lg'} h={28} py={0} bg={'orange'} color="white" ml={4}>
            タグなし
          </Tag>
        )}
      </Div>
    </TouchableHighlight>
  );
};

export default WikiCard;
