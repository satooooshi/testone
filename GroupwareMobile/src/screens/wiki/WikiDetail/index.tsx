import React, {useCallback, useEffect, useState} from 'react';
import WholeContainer from '../../../components/WholeContainer';
import {Div, Text, Avatar, Button} from 'react-native-magnus';
import {useAPIGetWikiDetail} from '../../../hooks/api/wiki/useAPIGetWikiDetail';
import {StyleSheet, TouchableOpacity, useWindowDimensions} from 'react-native';
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
import {ScrollerProvider} from '../../../utils/htmlScroll/scroller';
import {DrawerLayout, ScrollView} from 'react-native-gesture-handler';
import WikiBodyRenderer from '../../../components/wiki/WikiBodyRenderer';
import TOC from '../../../components/wiki/TOC';
import {FAB} from 'react-native-paper';
import MarkdownIt from 'markdown-it';
import {useHTMLScrollFeature} from '../../../hooks/scroll/useHTMLScrollFeature';
import {useDom} from '../../../hooks/dom/useDom';
import {useMinimumDrawer} from '../../../hooks/minimumDrawer/useMinimumDrawer';

const WikiDetail: React.FC<WikiDetailProps> = ({navigation, route}) => {
  const isFocused = useIsFocused();
  const {id} = route.params;
  const {drawerRef, openDrawer, closeDrawer} = useMinimumDrawer();
  const {width: windowWidth, height: windowHeight} = useWindowDimensions();
  const {data: wikiInfo, refetch: refetchWikiInfo} = useAPIGetWikiDetail(id);
  const [wikiTypeName, setWikiTypeName] = useState('Wiki');
  const mdParser = new MarkdownIt({breaks: true});
  const wikiBody =
    wikiInfo?.textFormat === 'html'
      ? wikiInfo?.body
      : wikiInfo?.textFormat === 'markdown'
      ? mdParser.render(wikiInfo?.body || '')
      : '';
  const {dom, headings} = useDom(wikiBody);
  const {scrollViewRef, scroller} = useHTMLScrollFeature(wikiInfo?.body);
  const onPressEntry = useCallback(
    (entry: string) => {
      closeDrawer();
      scroller.scrollToEntry(entry);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scroller],
  );

  const renderToc = useCallback(
    function renderToc() {
      return <TOC headings={headings} onPressEntry={onPressEntry} />;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [headings],
  );

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

  const renderingTOCNeeded = wikiInfo?.type !== WikiType.QA && headings.length;

  const article = (
    <ScrollerProvider scroller={scroller}>
      <ScrollView
        {...scroller.handlers}
        ref={scrollViewRef}
        scrollEventThrottle={100}
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
              {dom && <WikiBodyRenderer dom={dom} />}
            </Div>
          </Div>
        ) : null}
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
                {wikiInfo?.answers?.length
                  ? '回答を追加する'
                  : '回答を投稿する'}
              </Button>
            </Div>
            <AnswerList
              answers={wikiInfo.answers}
              onPressAvatar={onPressAvatar}
            />
          </Div>
        ) : null}
      </ScrollView>
    </ScrollerProvider>
  );

  return (
    <WholeContainer>
      <HeaderWithTextButton
        title={headerTitle}
        rightButtonName={headerRightButtonName}
        onPressRightButton={onPressHeaderRightButton}
        enableBackButton={true}
      />
      {renderingTOCNeeded ? (
        <DrawerLayout
          drawerPosition="right"
          drawerWidth={300}
          renderNavigationView={renderToc}
          ref={drawerRef}>
          {article}
          <FAB
            style={styles.fab}
            color="#61dafb"
            icon="format-list-bulleted-square"
            onPress={openDrawer}
          />
        </DrawerLayout>
      ) : (
        article
      )}
    </WholeContainer>
  );
};

export default WikiDetail;

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: 'white',
  },
});
