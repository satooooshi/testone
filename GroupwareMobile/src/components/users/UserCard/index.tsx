import React from 'react';
import {FlatList, TouchableOpacity, useWindowDimensions} from 'react-native';
import {Image, Text, Div, Avatar, Icon, Tag} from 'react-native-magnus';
import {useTagType} from '../../../hooks/tag/useTagType';
import {wikiCardStyles} from '../../../styles/component/wiki/wikiCard.style';
import {TagType, User} from '../../../types';
import {grayColor, darkFontColor} from '../../../utils/colors';
import {tagTypeNameFactory} from '../../../utils/factory/tag/tagTypeNameFactory';
import {tagColorFactory} from '../../../utils/factory/tagColorFactory';
import {userNameFactory} from '../../../utils/factory/userNameFactory';

type UserCardProps = {
  user: User;
  onPress: () => void;
};

const UserCard: React.FC<UserCardProps> = ({user, onPress}) => {
  const {width: windowWidth} = useWindowDimensions();
  console.log(user.tags);
  const {filteredTags: techTags} = useTagType(TagType.TECH, user?.tags || []);
  const {filteredTags: qualificationTags} = useTagType(
    TagType.QUALIFICATION,
    user?.tags || [],
  );
  const {filteredTags: clubTags} = useTagType(TagType.CLUB, user?.tags || []);
  const {filteredTags: hobbyTags} = useTagType(TagType.HOBBY, user?.tags || []);

  return (
    <TouchableOpacity onPress={onPress}>
      <Div
        px="xs"
        bg={grayColor}
        w={windowWidth * 0.9}
        rounded="md"
        shadow="md">
        <Div justifyContent="space-between" flexDir="row">
          {user.avatarUrl ? (
            <Image
              source={{uri: user.avatarUrl}}
              w={120}
              h={120}
              rounded="circle"
            />
          ) : (
            <Avatar size={120} bg="gray500" rounded="circle">
              <Icon
                name="user"
                color="white"
                fontSize="6xl"
                fontFamily="Feather"
              />
            </Avatar>
          )}
          <Div w={'60%'}>
            <Text fontSize={18} fontWeight="bold" color={darkFontColor}>
              {userNameFactory(user)}
            </Text>
            <Text fontSize={16} color={darkFontColor}>
              {user.introduceOther || '未設定'}
            </Text>
            <Div
              flexDir="row"
              w={'60%'}
              justifyContent="space-between"
              alignItems="center">
              <Text fontSize={14}>イベント参加数</Text>
              <Text color="blue700" fontWeight="bold" fontSize={18}>
                {user.eventCount || 0}
              </Text>
            </Div>
            <Div
              flexDir="row"
              w={'60%'}
              justifyContent="space-between"
              alignItems="center">
              <Text fontSize={14}>質問数</Text>
              <Text color="blue700" fontWeight="bold" fontSize={18}>
                {user.questionCount || 0}
              </Text>
            </Div>
            <Div
              flexDir="row"
              w={'60%'}
              justifyContent="space-between"
              alignItems="center">
              <Text fontSize={14}>質問回答数</Text>
              <Text color="blue700" fontWeight="bold" fontSize={18}>
                {user.answerCount || 0}
              </Text>
            </Div>
            <Div
              flexDir="row"
              w={'60%'}
              justifyContent="space-between"
              alignItems="center">
              <Text fontSize={14}>ナレッジ投稿数</Text>
              <Text color="blue700" fontWeight="bold" fontSize={18}>
                {user.knowledgeCount || 0}
              </Text>
            </Div>
          </Div>
        </Div>
        <Div mb={'xs'} flexDir="row" alignItems="center">
          <Text w={'13%'} fontSize={14}>{`${tagTypeNameFactory(
            TagType.TECH,
          )}:`}</Text>
          {techTags?.length ? (
            <FlatList
              style={wikiCardStyles.tagList}
              horizontal
              data={techTags}
              renderItem={({item: t}) => (
                <TouchableOpacity>
                  <Tag
                    fontSize={'lg'}
                    h={28}
                    py={0}
                    bg={tagColorFactory(t.type)}
                    color="white"
                    mr={4}>
                    {t.name}
                  </Tag>
                </TouchableOpacity>
              )}
            />
          ) : (
            <Tag
              fontSize={'lg'}
              h={28}
              py={0}
              bg={tagColorFactory(TagType.TECH)}
              color="white"
              mr={4}>
              未設定
            </Tag>
          )}
        </Div>
        <Div mb={'xs'} flexDir="row" alignItems="center">
          <Text w={'13%'} fontSize={14}>{`${tagTypeNameFactory(
            TagType.QUALIFICATION,
          )}:`}</Text>
          {qualificationTags?.length ? (
            <FlatList
              style={wikiCardStyles.tagList}
              horizontal
              data={qualificationTags}
              renderItem={({item: t}) => (
                <TouchableOpacity>
                  <Tag
                    fontSize={'lg'}
                    h={28}
                    py={0}
                    bg={tagColorFactory(t.type)}
                    color="white"
                    mr={4}>
                    {t.name}
                  </Tag>
                </TouchableOpacity>
              )}
            />
          ) : (
            <Tag
              fontSize={'lg'}
              h={28}
              py={0}
              bg={tagColorFactory(TagType.QUALIFICATION)}
              color="white"
              mr={4}>
              未設定
            </Tag>
          )}
        </Div>
        <Div mb={'xs'} flexDir="row" alignItems="center">
          <Text w={'13%'} fontSize={14}>{`${tagTypeNameFactory(
            TagType.CLUB,
          )}:`}</Text>
          {clubTags?.length ? (
            <FlatList
              style={wikiCardStyles.tagList}
              horizontal
              data={clubTags}
              renderItem={({item: t}) => (
                <TouchableOpacity>
                  <Tag
                    fontSize={'lg'}
                    h={28}
                    py={0}
                    bg={tagColorFactory(t.type)}
                    color="white"
                    mr={4}>
                    {t.name}
                  </Tag>
                </TouchableOpacity>
              )}
            />
          ) : (
            <Tag
              fontSize={'lg'}
              h={28}
              py={0}
              bg={tagColorFactory(TagType.CLUB)}
              color="white"
              mr={4}>
              未設定
            </Tag>
          )}
        </Div>
        <Div mb={'xs'} flexDir="row" alignItems="center">
          <Text w={'13%'} fontSize={14}>{`${tagTypeNameFactory(
            TagType.HOBBY,
          )}:`}</Text>
          {hobbyTags?.length ? (
            <FlatList
              style={wikiCardStyles.tagList}
              horizontal
              data={hobbyTags}
              renderItem={({item: t}) => (
                <TouchableOpacity>
                  <Tag
                    fontSize={'lg'}
                    h={28}
                    py={0}
                    bg={tagColorFactory(t.type)}
                    color="white"
                    mr={4}>
                    {t.name}
                  </Tag>
                </TouchableOpacity>
              )}
            />
          ) : (
            <Tag
              fontSize={'lg'}
              h={28}
              py={0}
              bg={tagColorFactory(TagType.HOBBY)}
              color="white"
              mr={4}>
              未設定
            </Tag>
          )}
        </Div>
      </Div>
    </TouchableOpacity>
  );
};

export default UserCard;
