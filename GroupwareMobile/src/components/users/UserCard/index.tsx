import {useNavigation, useRoute} from '@react-navigation/native';
import React from 'react';
import {FlatList, TouchableHighlight, useWindowDimensions} from 'react-native';
import {Text, Div, Tag, Button} from 'react-native-magnus';
import {useAuthenticate} from '../../../contexts/useAuthenticate';
import {useTagType} from '../../../hooks/tag/useTagType';
import {userCardStyles} from '../../../styles/component/user/userCard.style';
import {TagType, User, UserTag} from '../../../types';
import {grayColor, darkFontColor} from '../../../utils/colors';
import {tagTypeNameFactory} from '../../../utils/factory/tag/tagTypeNameFactory';
import {tagBgColorFactory} from '../../../utils/factory/tagBgColorFactory';
import {tagColorFactory} from '../../../utils/factory/tagColorFactory';
import {tagFontColorFactory} from '../../../utils/factory/tagFontColorFactory';
import {userNameFactory} from '../../../utils/factory/userNameFactory';
import {userNameKanaFactory} from '../../../utils/factory/userNameKanaFactory';
import UserAvatar from '../../common/UserAvatar';

type UserCardProps = {
  user: User;
  filteredDuration: 'week' | 'month' | undefined;
};

const UserCard: React.FC<UserCardProps> = ({user, filteredDuration}) => {
  const navigation = useNavigation<any>();
  const {user: mySelf} = useAuthenticate();
  const {width: windowWidth} = useWindowDimensions();
  const {filteredTags: techTags} = useTagType(TagType.TECH, user?.tags || []);
  const {filteredTags: qualificationTags} = useTagType(
    TagType.QUALIFICATION,
    user?.tags || [],
  );
  const {filteredTags: clubTags} = useTagType(TagType.CLUB, user?.tags || []);
  const {filteredTags: hobbyTags} = useTagType(TagType.HOBBY, user?.tags || []);

  const durationText = () => {
    switch (filteredDuration) {
      case 'week':
        return '(週間)';
      case 'month':
        return '(月間)';
      default:
        return '';
    }
  };

  const navigateToAccountScreen = () => {
    if (user?.id === mySelf?.id) {
      navigation.navigate('AccountStack', {
        screen: 'MyProfile',
        params: {id: user?.id},
      });
    } else {
      navigation.navigate('UsersStack', {
        screen: 'AccountDetail',
        params: {id: user?.id},
      });
    }
  };

  const onPressTag = (tag: UserTag) => {
    navigation.navigate('UsersStack', {
      screen: 'UserList',
      params: {tag: tag.id.toString()},
    });
  };

  return (
    <Div bg="white" w={windowWidth * 0.9} rounded="xl" p="lg">
      <Div mb="lg" justifyContent="space-between" flexDir="row">
        <Div mr={10}>
          <UserAvatar
            user={user}
            w={100}
            h={100}
            onPress={navigateToAccountScreen}
          />
        </Div>
        <Div flex={1}>
          <Text fontSize={18} fontWeight="bold" color="black">
            {userNameFactory(user)}
          </Text>
          <Text fontSize={12} color="gray">
            {userNameKanaFactory(user)}
          </Text>
          <Text
            fontSize={12}
            my={12}
            color="gray"
            numberOfLines={3}
            letterSpacing={0.5}>
            {user.introduceOther || '未設定'}
          </Text>
          {/* <Div
              flexDir="row"
              w={'80%'}
              justifyContent="space-between"
              alignItems="center">
              <Text fontSize={14}>イベント参加数{durationText()}</Text>
              <Text color="blue700" fontWeight="bold" fontSize={18}>
                {user.eventCount || 0}
              </Text>
            </Div>
            <Div
              flexDir="row"
              w={'80%'}
              justifyContent="space-between"
              alignItems="center">
              <Text fontSize={14}>質問数{durationText()}</Text>
              <Text color="blue700" fontWeight="bold" fontSize={18}>
                {user.questionCount || 0}
              </Text>
            </Div>
            <Div
              flexDir="row"
              w={'80%'}
              justifyContent="space-between"
              alignItems="center">
              <Text fontSize={14}>質問回答数{durationText()}</Text>
              <Text color="blue700" fontWeight="bold" fontSize={18}>
                {user.answerCount || 0}
              </Text>
            </Div>
            <Div
              flexDir="row"
              w={'80%'}
              justifyContent="space-between"
              alignItems="center">
              <Text fontSize={14}>ナレッジ投稿数{durationText()}</Text>
              <Text color="blue700" fontWeight="bold" fontSize={18}>
                {user.knowledgeCount || 0}
              </Text>
            </Div> */}
        </Div>
      </Div>
      <Div mb={'xs'} flexDir="row" alignItems="center">
        <Text w={50} fontSize={14} color="gray">{`${tagTypeNameFactory(
          TagType.TECH,
        )}:`}</Text>
        {techTags?.length ? (
          <FlatList
            style={userCardStyles.tagList}
            horizontal
            data={techTags}
            renderItem={({item: t}) => (
              <Tag
                onPress={() => onPressTag(t)}
                fontSize={'md'}
                h={24}
                py={0}
                bg={tagBgColorFactory(t.type)}
                color={tagFontColorFactory(t.type)}
                mr={4}>
                {t.name}
              </Tag>
            )}
          />
        ) : (
          <Tag
            fontSize={'md'}
            h={24}
            py={0}
            bg={tagBgColorFactory(TagType.TECH)}
            color={tagFontColorFactory(TagType.TECH)}
            mr={4}>
            未設定
          </Tag>
        )}
      </Div>
      <Div mb={'xs'} flexDir="row" alignItems="center">
        <Text w={50} fontSize={14} color="gray">{`${tagTypeNameFactory(
          TagType.QUALIFICATION,
        )}:`}</Text>
        {qualificationTags?.length ? (
          <FlatList
            style={userCardStyles.tagList}
            horizontal
            data={qualificationTags}
            renderItem={({item: t}) => (
              <Tag
                onPress={() => onPressTag(t)}
                fontSize={'md'}
                h={24}
                py={0}
                bg={tagBgColorFactory(t.type)}
                color={tagFontColorFactory(t.type)}
                mr={4}>
                {t.name}
              </Tag>
            )}
          />
        ) : (
          <Tag
            fontSize={'md'}
            h={24}
            py={0}
            bg={tagBgColorFactory(TagType.QUALIFICATION)}
            color={tagFontColorFactory(TagType.QUALIFICATION)}
            mr={4}>
            未設定
          </Tag>
        )}
      </Div>
      <Div mb={'xs'} flexDir="row" alignItems="center">
        <Text w={50} fontSize={14} color="gray">{`${tagTypeNameFactory(
          TagType.CLUB,
        )}:`}</Text>
        {clubTags?.length ? (
          <FlatList
            style={userCardStyles.tagList}
            horizontal
            data={clubTags}
            renderItem={({item: t}) => (
              <Tag
                onPress={() => onPressTag(t)}
                fontSize={'md'}
                h={24}
                py={0}
                bg={tagBgColorFactory(t.type)}
                color={tagFontColorFactory(t.type)}
                mr={4}>
                {t.name}
              </Tag>
            )}
          />
        ) : (
          <Tag
            fontSize={'md'}
            h={24}
            py={0}
            bg={tagBgColorFactory(TagType.CLUB)}
            color={tagFontColorFactory(TagType.CLUB)}
            mr={4}>
            未設定
          </Tag>
        )}
      </Div>
      <Div mb={'xs'} flexDir="row" alignItems="center">
        <Text w={50} fontSize={14} color="gray">{`${tagTypeNameFactory(
          TagType.HOBBY,
        )}:`}</Text>
        {hobbyTags?.length ? (
          <FlatList
            style={userCardStyles.tagList}
            horizontal
            data={hobbyTags}
            renderItem={({item: t}) => (
              <Tag
                onPress={() => onPressTag(t)}
                fontSize={'md'}
                h={24}
                py={0}
                bg={tagBgColorFactory(t.type)}
                color={tagFontColorFactory(t.type)}
                mr={4}>
                {t.name}
              </Tag>
            )}
          />
        ) : (
          <Tag
            fontSize={'md'}
            h={24}
            py={0}
            bg={tagBgColorFactory(TagType.HOBBY)}
            color={tagFontColorFactory(TagType.HOBBY)}
            mr={4}>
            未設定
          </Tag>
        )}
      </Div>
      <Div mt={20}>
        <Button
          bg="indigo100"
          rounded="circle"
          alignSelf="center"
          onPress={navigateToAccountScreen}>
          <Text fontWeight="bold" fontSize={16} color="blue700">
            プロフィールを見る
          </Text>
        </Button>
      </Div>
    </Div>
  );
};

export default UserCard;
