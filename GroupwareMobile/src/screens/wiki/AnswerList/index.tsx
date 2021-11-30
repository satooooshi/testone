import React from 'react';
import {FlatList, TouchableOpacity, useWindowDimensions} from 'react-native';
import RenderHtml from 'react-native-render-html';
import {Div, Avatar, Text} from 'react-native-magnus';
import {QAAnswer, User} from '../../../types';
import {darkFontColor} from '../../../utils/colors';
import {userNameFactory} from '../../../utils/factory/userNameFactory';
import MarkdownIt from 'markdown-it';

type AnswerListProps = {
  answers?: QAAnswer[];
  onPressAvatar: (user: User) => void;
};

const AnswerList: React.FC<AnswerListProps> = ({answers, onPressAvatar}) => {
  const mdParser = new MarkdownIt({breaks: true});
  const {width: windowWidth} = useWindowDimensions();
  return (
    <FlatList
      data={answers || []}
      keyExtractor={item => item.id.toString()}
      renderItem={({item}) => (
        <>
          <Div flexDir="row" alignItems="center" mb={16}>
            <TouchableOpacity
              onPress={() => {
                if (item.writer && item.writer.existence) {
                  onPressAvatar(item.writer);
                }
              }}>
              <Avatar
                mr={8}
                source={
                  item.writer?.existence
                    ? {uri: item.writer?.avatarUrl}
                    : item.writer?.avatarUrl
                    ? require('../../../../assets/bold-mascot.png')
                    : require('../../../../assets/no-image-avatar.png')
                }
              />
            </TouchableOpacity>
            <Text fontSize={18} color={darkFontColor}>
              {userNameFactory(item.writer)}
            </Text>
          </Div>
          <Div bg="white" rounded="md" p={8} mb={16}>
            <RenderHtml
              contentWidth={windowWidth * 0.9}
              source={{
                html:
                  item.textFormat === 'html'
                    ? item.body
                    : mdParser.render(item.body),
              }}
            />
          </Div>
        </>
      )}
      ListEmptyComponent={
        <Text fontSize={16} textAlign="center">
          回答を投稿してください
        </Text>
      }
    />
  );
};

export default AnswerList;
