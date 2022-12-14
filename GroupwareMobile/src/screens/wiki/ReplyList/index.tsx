import React, {useState} from 'react';
import {TouchableOpacity, useWindowDimensions} from 'react-native';
import {Div, Text, Collapse, Icon} from 'react-native-magnus';
import {QAAnswer, User} from '../../../types';
import MarkdownIt from 'markdown-it';
import RenderHtml from 'react-native-render-html';
import {userNameFactory} from '../../../utils/factory/userNameFactory';
import {darkFontColor} from '../../../utils/colors';
import UserAvatar from '../../../components/common/UserAvatar';
import {dateTimeFormatterFromJSDDate} from '../../../utils/dateTimeFormatterFromJSDate';

type ReplyListProps = {
  answer: QAAnswer;
  onPressAvatar: (user: User) => void;
};

const ReplyList: React.FC<ReplyListProps> = ({answer, onPressAvatar}) => {
  const mdParser = new MarkdownIt({breaks: true});
  const {width: windowWidth} = useWindowDimensions();
  const [repliesHeight, setRepliesHeight] = useState<number>(100);
  return (
    <>
      {answer.replies?.length ? (
        <Collapse mb={8}>
          <Collapse.Header
            bg="white"
            color="gray"
            py="lg"
            prefix={
              <Icon
                name="triangle-down"
                mr="lg"
                color="gray"
                fontFamily="Octicons"
              />
            }
            activePrefix={
              <Icon
                name="triangle-up"
                mr="lg"
                color="gray"
                fontFamily="Octicons"
              />
            }
            suffix={
              <Text color="gray" fontSize={14}>
                {`${answer.replies.length}件の返信`}を見る
              </Text>
            }
            activeSuffix={
              <Text color="gray" fontSize={14}>
                {`${answer.replies.length}件の返信`}を閉じる
              </Text>
            }
          />
          <Collapse.Body mb={8} h={repliesHeight}>
            <Div onLayout={e => setRepliesHeight(e.nativeEvent.layout.height)}>
              {answer.replies.length ? (
                answer.replies.map(
                  reply =>
                    reply.writer && (
                      <>
                        <Div flexDir="column">
                          <Div
                            flexDir="row"
                            justifyContent="flex-start"
                            alignItems="center">
                            <TouchableOpacity
                              onPress={() => {
                                if (reply.writer && reply.writer.existence) {
                                  onPressAvatar(reply.writer);
                                }
                              }}>
                              <Div mr={8}>
                                <UserAvatar
                                  w={32}
                                  h={32}
                                  user={reply.writer}
                                  GoProfile={true}
                                />
                              </Div>
                            </TouchableOpacity>
                            <Text fontSize={14} color={darkFontColor}>
                              {userNameFactory(reply.writer)}
                            </Text>
                            <Div flex={1} />
                            <Text fontSize={14} color={darkFontColor}>
                              {dateTimeFormatterFromJSDDate({
                                dateTime: new Date(reply.createdAt),
                              })}
                            </Text>
                          </Div>
                        </Div>
                        <Div bg="white" rounded="md" pb={8} ml={40} mb={16}>
                          <RenderHtml
                            contentWidth={windowWidth * 0.9}
                            source={{
                              html:
                                reply.textFormat === 'html'
                                  ? reply.body
                                  : mdParser.render(reply.body),
                            }}
                          />
                        </Div>
                      </>
                    ),
                )
              ) : (
                <Text fontSize={16} textAlign="center">
                  返信を投稿してください
                </Text>
              )}
            </Div>
          </Collapse.Body>
        </Collapse>
      ) : null}
    </>
  );
};

export default ReplyList;
