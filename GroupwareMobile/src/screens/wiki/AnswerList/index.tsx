import React from 'react';
import {
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import RenderHtml from 'react-native-render-html';
import {Div, Avatar, Text, Button, Overlay} from 'react-native-magnus';
import {User, Wiki} from '../../../types';
import {darkFontColor} from '../../../utils/colors';
import {userNameFactory} from '../../../utils/factory/userNameFactory';
import MarkdownIt from 'markdown-it';
import ReplyList from '../ReplyList';
import {useAPICreateBestAnswer} from '../../../hooks/api/wiki/useAPICreateBestAnswer';
import {useAuthenticate} from '../../../contexts/useAuthenticate';
import {useAPIGetWikiDetail} from '../../../hooks/api/wiki/useAPIGetWikiDetail';
import UserAvatar from '../../../components/common/UserAvatar';

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
    });
  const {refetch: refetchWikiInfo} = useAPIGetWikiDetail(wiki.id);

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
                <Div flexDir="row" alignItems="center" mb={8}>
                  <TouchableOpacity
                    onPress={() => {
                      if (answer.writer && answer.writer.existence) {
                        onPressAvatar(answer.writer);
                      }
                    }}>
                    <Div mr={8}>
                      <UserAvatar user={answer.writer} h={64} w={64} />
                    </Div>
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
                {wiki.bestAnswer?.id === answer.id ? (
                  <Button mb={8} bg="green600" w={'100%'}>
                    ベストアンサー
                  </Button>
                ) : !wiki.resolvedAt && wiki.writer?.id === user?.id ? (
                  <Button
                    mb={8}
                    bg="orange600"
                    w={'100%'}
                    onPress={() =>
                      saveBestAnswer({...wiki, bestAnswer: answer})
                    }>
                    ベストアンサーに選ぶ
                  </Button>
                ) : null}
                <ReplyList answer={answer} onPressAvatar={onPressAvatar} />
              </Div>
            ),
        )
      ) : (
        <Text fontSize={16} textAlign="center">
          回答を投稿してください
        </Text>
      )}
    </>
  );
};

export default AnswerList;
