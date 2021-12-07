import React from 'react';
import {TouchableOpacity, useWindowDimensions} from 'react-native';
import RenderHtml from 'react-native-render-html';
import {Div, Avatar, Text} from 'react-native-magnus';
import {QAAnswer, User} from '../../../types';
import {darkFontColor} from '../../../utils/colors';
import {userNameFactory} from '../../../utils/factory/userNameFactory';
import MarkdownIt from 'markdown-it';
import ReplyList from '../ReplyList';

type AnswerListProps = {
  answers?: QAAnswer[];
  onPressAvatar: (user: User) => void;
};

const AnswerList: React.FC<AnswerListProps> = ({answers, onPressAvatar}) => {
  const mdParser = new MarkdownIt({breaks: true});
  const {width: windowWidth} = useWindowDimensions();
  return (
    <>
      {answers?.length ? (
        answers.map(answer => (
          <Div mb={26}>
            <Div flexDir="row" alignItems="center" mb={8}>
              <TouchableOpacity
                onPress={() => {
                  if (answer.writer && answer.writer.existence) {
                    onPressAvatar(answer.writer);
                  }
                }}>
                <Avatar
                  mr={8}
                  source={
                    answer.writer?.existence
                      ? {uri: answer.writer?.avatarUrl}
                      : answer.writer?.avatarUrl
                      ? require('../../../../assets/bold-mascot.png')
                      : require('../../../../assets/no-image-avatar.png')
                  }
                />
              </TouchableOpacity>
              <Text fontSize={18} color={darkFontColor}>
                {userNameFactory(answer.writer)}
              </Text>
            </Div>
            <Div bg="white" rounded="md" p={8} mb={8}>
              <RenderHtml
                contentWidth={windowWidth * 0.9}
                source={{
                  html:
                    answer.textFormat === 'html'
                      ? answer.body
                      : mdParser.render(answer.body),
                }}
              />
            </Div>
            <ReplyList answer={answer} onPressAvatar={onPressAvatar} />
          </Div>
        ))
      ) : (
        <Text fontSize={16} textAlign="center">
          回答を投稿してください
        </Text>
      )}
    </>
  );
};

export default AnswerList;
