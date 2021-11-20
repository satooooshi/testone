import React, {useEffect, useState} from 'react';
import WholeContainer from '../../../components/WholeContainer';
import {ScrollDiv, Div, Text, Avatar} from 'react-native-magnus';
import RenderHtml from 'react-native-render-html';
import {WikiDetailProps} from '../../../types/navigator/screenProps/Wiki';
import {useAPIGetWikiDetail} from '../../../hooks/api/wiki/useAPIGetWikiDetail';
import MarkdownIt from 'markdown-it';
import {TouchableOpacity, useWindowDimensions} from 'react-native';
import AppHeader from '../../../components/Header';
import {wikiTypeNameFactory} from '../../../utils/factory/wiki/wikiTypeNameFactory';
import {darkFontColor} from '../../../utils/colors';
import {userNameFactory} from '../../../utils/factory/userNameFactory';
import {wikiDetailStyles} from '../../../styles/screen/wiki/wikiDetail.style';
import {User} from '../../../types';

const WikiDetail: React.FC<WikiDetailProps> = ({navigation, route}) => {
  const {id} = route.params;
  const mdParser = new MarkdownIt({breaks: true});
  const {width: windowWidth} = useWindowDimensions();
  const {data: wikiInfo} = useAPIGetWikiDetail(id);
  const [wikiTypeName, setWikiTypeName] = useState('Wiki');

  useEffect(() => {
    if (wikiInfo) {
      const nameStr = wikiTypeNameFactory(wikiInfo.type, wikiInfo.ruleCategory);
      setWikiTypeName(nameStr);
    }
  }, [wikiInfo]);

  const headerTitle = wikiTypeName + '詳細';
  const headerRightButtonName = wikiTypeName + 'を編集';

  const onPressHeaderRightButton = () => {
    if (wikiInfo) {
      navigation.navigate('EditWiki', {id: wikiInfo.id});
    }
    // else error handling
  };

  const onPressAvatar = (user: User) => {
    navigation.navigate('AccountDetail', {id: user.id});
  };

  return (
    <WholeContainer>
      <AppHeader
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
                    !wikiInfo.writer.existence
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
            <Div bg="white" rounded="md" p={8}>
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
    </WholeContainer>
  );
};

export default WikiDetail;
