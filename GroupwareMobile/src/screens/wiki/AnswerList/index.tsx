import React from 'react';
import {
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import RenderHtml from 'react-native-render-html';
import {Div, Text, Button, Overlay, Icon} from 'react-native-magnus';
import {BoardCategory, User, Wiki} from '../../../types';
import {darkFontColor} from '../../../utils/colors';
import {userNameFactory} from '../../../utils/factory/userNameFactory';
import MarkdownIt from 'markdown-it';
import ReplyList from '../ReplyList';
import {useAPICreateBestAnswer} from '../../../hooks/api/wiki/useAPICreateBestAnswer';
import {useAuthenticate} from '../../../contexts/useAuthenticate';
import {useAPIGetWikiDetail} from '../../../hooks/api/wiki/useAPIGetWikiDetail';
import UserAvatar from '../../../components/common/UserAvatar';
import {dateTimeFormatterFromJSDDate} from '../../../utils/dateTimeFormatterFromJSDate';
import {PostReplyNavigationProps} from '../../../types/navigator/drawerScreenProps';
import {useNavigation} from '@react-navigation/native';

type AnswerListProps = {
  wiki: Wiki;
  onPressAvatar: (user: User) => void;
};

const AnswerList: React.FC<AnswerListProps> = ({wiki, onPressAvatar}) => {
  const mdParser = new MarkdownIt({breaks: true});
  const {width: windowWidth} = useWindowDimensions();
  const {user} = useAuthenticate();
  const {mutate: saveBestAnswer, isLoading: loadingSaveBestAnswer} =
    useAPICreateBestAnswer({
      onSuccess: () => refetchWikiInfo(),
      onError: () => {
        Alert.alert(
          'ベストアンサー更新中にエラーが発生しました。\n時間をおいて再実行してください。',
        );
      },
    });
  const {refetch: refetchWikiInfo} = useAPIGetWikiDetail(wiki.id);
  const navigation: PostReplyNavigationProps =
    useNavigation<PostReplyNavigationProps>();

  return (
    <>
      <Overlay visible={loadingSaveBestAnswer} p="xl">
        <ActivityIndicator />
      </Overlay>
      {wiki.answers?.length ? (
        wiki.answers.map(
          answer =>
            answer.writer && (
              <Div mb={26}>
                <Div flexDir="column">
                  <Div
                    flexDir="row"
                    justifyContent="flex-start"
                    alignItems="center">
                    <TouchableOpacity
                      onPress={() => {
                        if (answer.writer && answer.writer.existence) {
                          onPressAvatar(answer.writer);
                        }
                      }}>
                      <Div mr={8}>
                        <UserAvatar
                          user={answer.writer}
                          h={32}
                          w={32}
                          GoProfile={true}
                        />
                      </Div>
                    </TouchableOpacity>
                    <Text fontSize={14} color={darkFontColor}>
                      {userNameFactory(answer.writer)}
                    </Text>
                    <Div flex={1} />
                    <Text fontSize={14} color={darkFontColor}>
                      {dateTimeFormatterFromJSDDate({
                        dateTime: new Date(answer.createdAt),
                      })}
                    </Text>
                  </Div>
                </Div>
                <Div ml={40}>
                  <Div mb={'sm'}>
                    <RenderHtml
                      baseStyle={{color: 'black'}}
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

                  <Div flexDir="row" alignItems="center">
                    <Button
                      rounded="circle"
                      borderWidth={1}
                      borderColor="gray400"
                      bg="white"
                      p="lg"
                      onPress={() => {
                        navigation.navigate('WikiStack', {
                          screen: 'PostReply',
                          params: {id: answer.id},
                          initial: false,
                        });
                      }}>
                      <Icon
                        name="reply"
                        fontFamily="MaterialIcons"
                        fontSize={'2xl'}
                        color={'gray'}
                      />
                    </Button>
                    <Div flex={1} />
                    {wiki.boardCategory === BoardCategory.QA &&
                      (wiki.bestAnswer?.id === answer.id ? (
                        <Button
                          bg="white"
                          color="green500"
                          borderWidth={1}
                          borderColor="green500"
                          rounded={'xl'}
                          prefix={
                            <Icon
                              name="award"
                              fontFamily="Feather"
                              fontSize={'2xl'}
                              color={'green500'}
                              mr={'sm'}
                            />
                          }>
                          ベストアンサー
                        </Button>
                      ) : !wiki.resolvedAt && wiki.writer?.id === user?.id ? (
                        <Button
                          bg="white"
                          borderWidth={1}
                          borderColor="gray400"
                          color="gray"
                          rounded="xl"
                          prefix={
                            <Icon
                              name="award"
                              fontFamily="Feather"
                              fontSize={'2xl'}
                              color={'gray'}
                              mr={'sm'}
                            />
                          }
                          onPress={() =>
                            saveBestAnswer({...wiki, bestAnswer: answer})
                          }>
                          ベストアンサーに選ぶ
                        </Button>
                      ) : null)}
                  </Div>
                </Div>
              </Div>
            ),
        )
      ) : (
        <Text fontSize={16} textAlign="center" mb="lg">
          回答を投稿してください
        </Text>
      )}
    </>
  );
};

export default AnswerList;
