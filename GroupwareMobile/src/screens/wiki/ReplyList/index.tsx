import React, {useState} from 'react';
import {TouchableOpacity, useWindowDimensions} from 'react-native';
import {Div, Text, Collapse, Button} from 'react-native-magnus';
import {QAAnswer, User} from '../../../types';
import MarkdownIt from 'markdown-it';
import RenderHtml from 'react-native-render-html';
import {userNameFactory} from '../../../utils/factory/userNameFactory';
import {PostReplyNavigationProps} from '../../../types/navigator/drawerScreenProps';
import {useNavigation} from '@react-navigation/native';
import {darkFontColor} from '../../../utils/colors';
import UserAvatar from '../../../components/common/UserAvatar';
import {dateTimeFormatterFromJSDDate} from '../../../utils/dateTimeFormatterFromJSDate';

type ReplyListProps = {
  answer: QAAnswer;
  onPressAvatar: (user: User) => void;
};

const ReplyList: React.FC<ReplyListProps> = ({answer, onPressAvatar}) => {
  const navigation: PostReplyNavigationProps =
    useNavigation<PostReplyNavigationProps>();
  const mdParser = new MarkdownIt({breaks: true});
  const {width: windowWidth} = useWindowDimensions();
  const [repliesHeight, setRepliesHeight] = useState<number>(100);
  return (
    <>
      <Button
        bg="pink600"
        w={'100%'}
        onPress={() => {
          navigation.navigate('WikiStack', {
            screen: 'PostReply',
            params: {id: answer.id},
            initial: false,
          });
        }}>
        返信する
      </Button>
      {answer.replies?.length ? (
        <Collapse mb={8}>
          <Collapse.Header
            pt={12}
            pb={12}
            bg={darkFontColor}
            w={'100%'}
            rounded="none"
            justifyContent="center">
            <Text fontSize={14} color="white">
              回答への返信{answer.replies.length}件
            </Text>
          </Collapse.Header>
          <Collapse.Body mb={8} h={repliesHeight}>
            <Div onLayout={e => setRepliesHeight(e.nativeEvent.layout.height)}>
              {answer.replies.length ? (
                answer.replies.map(
                  reply =>
                    reply.writer && (
                      <>
                        <Div flexDir="column" mb={16}>
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
                              <Div>
                                <UserAvatar
                                  w={64}
                                  h={64}
                                  user={reply.writer}
                                  GoProfile={true}
                                />
                              </Div>
                            </TouchableOpacity>
                            <Text fontSize={18} color={darkFontColor}>
                              {userNameFactory(reply.writer)}
                            </Text>
                          </Div>
                          <Text textAlignVertical="bottom" textAlign="right">
                            {`投稿日: ${dateTimeFormatterFromJSDDate({
                              dateTime: new Date(reply.createdAt),
                            })}`}
                          </Text>
                        </Div>
                        <Div bg="white" rounded="md" p={8} mb={16}>
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
