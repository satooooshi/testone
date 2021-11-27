import React, {useEffect, useState} from 'react';
import WholeContainer from '../../../components/WholeContainer';
import {ScrollDiv, Div, Text, Avatar, Button} from 'react-native-magnus';
import RenderHtml from 'react-native-render-html';
import {useAPIGetWikiDetail} from '../../../hooks/api/wiki/useAPIGetWikiDetail';
import MarkdownIt from 'markdown-it';
import {TouchableOpacity, useWindowDimensions} from 'react-native';
import HeaderWithTextButton from '../../../components/Header';
import {wikiTypeNameFactory} from '../../../utils/factory/wiki/wikiTypeNameFactory';
import {
  darkFontColor,
  wikiAnswerButtonColor,
  wikiBorderColor,
} from '../../../utils/colors';
import {userNameFactory} from '../../../utils/factory/userNameFactory';
import {wikiDetailStyles} from '../../../styles/screen/wiki/wikiDetail.style';
import {User, WikiType} from '../../../types';
import {WikiDetailProps} from '../../../types/navigator/drawerScreenProps';
import {useIsFocused} from '@react-navigation/core';
import AnswerList from '../AnswerList';

const WikiDetail: React.FC<WikiDetailProps> = ({navigation, route}) => {
  const isFocused = useIsFocused();
  const {id} = route.params;
  const mdParser = new MarkdownIt({breaks: true});
  const {width: windowWidth, height: windowHeight} = useWindowDimensions();
  const {data: wikiInfo, refetch: refetchWikiInfo} = useAPIGetWikiDetail(id);
  const [wikiTypeName, setWikiTypeName] = useState('Wiki');

  useEffect(() => {
    if (wikiInfo) {
      const nameStr = wikiTypeNameFactory(wikiInfo.type, wikiInfo.ruleCategory);
      setWikiTypeName(nameStr);
    }
  }, [wikiInfo]);

  useEffect(() => {
    if (isFocused) {
      refetchWikiInfo();
    }
  }, [isFocused, refetchWikiInfo]);

  const headerTitle = wikiTypeName + '詳細';
  const headerRightButtonName = wikiTypeName + 'を編集';

  const onPressHeaderRightButton = () => {
    if (wikiInfo) {
      navigation.navigate('WikiStack', {
        screen: 'EditWiki',
        params: {id: wikiInfo.id},
      });
    }
    // else error handling
  };

  const onPressPostAnswerButton = () => {
    if (wikiInfo) {
      navigation.navigate('WikiStack', {
        screen: 'PostAnswer',
        params: {id: wikiInfo.id},
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

  return (
    <WholeContainer>
      <HeaderWithTextButton
        title={headerTitle}
        rightButtonName={headerRightButtonName}
        onPressRightButton={onPressHeaderRightButton}
        enableBackButton={true}
      />
      <ScrollDiv
        contentContainerStyle={{
          ...wikiDetailStyles.wrapper,
          width: windowWidth * 0.9,
        }}>
        {wikiInfo && wikiInfo.writer ? (
          <Div flexDir="column" w={'100%'}>
            <Text fontWeight="bold" fontSize={24} color={darkFontColor} mb={16}>
              {wikiInfo.title}
            </Text>
            <Div flexDir="row" alignItems="center" mb={16}>
              <TouchableOpacity
                onPress={() => {
                  if (wikiInfo.writer && wikiInfo.writer.existence) {
                    onPressAvatar(wikiInfo.writer);
                  }
                }}>
                <Avatar
                  mr={8}
                  source={
                    wikiInfo.writer.existence
                      ? {uri: wikiInfo.writer?.avatarUrl}
                      : wikiInfo.writer?.avatarUrl
                      ? require('../../../../assets/bold-mascot.png')
                      : require('../../../../assets/no-image-avatar.png')
                  }
                />
              </TouchableOpacity>
              <Text fontSize={18} color={darkFontColor}>
                {userNameFactory(wikiInfo.writer)}
              </Text>
            </Div>
            <Div bg="white" rounded="md" p={8} mb={16}>
              <RenderHtml
                contentWidth={windowWidth * 0.9}
                source={{
                  html:
                    wikiInfo.textFormat === 'html'
                      ? wikiInfo.body
                      : mdParser.render(wikiInfo.body),
                }}
              />
            </Div>
          </Div>
        ) : null}
      </ScrollDiv>
      {wikiInfo?.type === WikiType.QA ? (
        <Div h={windowHeight * 0.5} w={windowWidth * 0.9} alignSelf="center">
          <Div
            justifyContent="space-between"
            alignItems="center"
            flexDir="row"
            mb={10}
            pb={10}
            borderBottomWidth={1}
            borderBottomColor={wikiBorderColor}>
            <Text fontWeight="bold" fontSize={24} color={darkFontColor}>
              回答
              {wikiInfo?.answers?.length ? wikiInfo.answers.length : 0}件
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
              {wikiInfo?.answers?.length ? '回答を追加する' : '回答を投稿する'}
            </Button>
          </Div>
          <AnswerList
            answers={wikiInfo.answers}
            onPressAvatar={onPressAvatar}
          />
        </Div>
      ) : null}
    </WholeContainer>
  );
};

export default WikiDetail;
