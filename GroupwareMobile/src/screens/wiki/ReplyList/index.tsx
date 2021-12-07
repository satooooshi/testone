import React, {useState} from 'react';
import {FlatList, TouchableOpacity, useWindowDimensions} from 'react-native';
import {Div, Avatar, Text, Collapse, Button} from 'react-native-magnus';
import {QAAnswer, User} from '../../../types';
import MarkdownIt from 'markdown-it';
import RenderHtml from 'react-native-render-html';
import {userNameFactory} from '../../../utils/factory/userNameFactory';
import {PostReplyNavigationProps} from '../../../types/navigator/drawerScreenProps';
import {useNavigation} from '@react-navigation/native';
import {darkFontColor} from '../../../utils/colors';

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
              <FlatList
                data={answer.replies || []}
                keyExtractor={reply => reply.id.toString()}
                renderItem={({item: reply}) => (
                  <>
                    <Div flexDir="row" alignItems="center" mb={16}>
                      <TouchableOpacity
                        onPress={() => {
                          if (reply.writer && reply.writer.existence) {
                            onPressAvatar(reply.writer);
                          }
                        }}>
                        <Avatar
                          mr={8}
                          source={
                            reply.writer?.existence
                              ? {uri: reply.writer?.avatarUrl}
                              : reply.writer?.avatarUrl
                              ? require('../../../../assets/bold-mascot.png')
                              : require('../../../../assets/no-image-avatar.png')
                          }
                        />
                      </TouchableOpacity>
                      <Text fontSize={18} color={darkFontColor}>
                        {userNameFactory(reply.writer)}
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
                )}
                ListEmptyComponent={
                  <Text fontSize={16} textAlign="center">
                    返信を投稿してください
                  </Text>
                }
              />
            </Div>
          </Collapse.Body>
        </Collapse>
      ) : null}
      <Button
        mb={16}
        bg="pink600"
        w={'100%'}
        onPress={() => {
          navigation.navigate('WikiStack', {
            screen: 'PostReply',
            params: {id: answer.id},
          });
        }}>
        返信する
      </Button>
    </>
  );
};

export default ReplyList;
