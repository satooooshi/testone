import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {FlatList} from 'react-native';
import {Button, Div, Icon, Text} from 'react-native-magnus';
import tailwind from 'tailwind-rn';
import ChatNoteCard from '../../../../components/chat/Note/ChatNoteCard';
import HeaderWithTextButton from '../../../../components/Header';
import WholeContainer from '../../../../components/WholeContainer';
import {useAPIGetChatNotes} from '../../../../hooks/api/chat/useAPIGetNotes';
import {ChatNote} from '../../../../types';
import {
  ChatNotesNavigationProps,
  ChatRouteProps,
} from '../../../../types/navigator/drawerScreenProps';

const ChatNotes: React.FC = () => {
  const navigation = useNavigation<ChatNotesNavigationProps>();
  const {room} = useRoute<ChatRouteProps>().params;
  const [page, setPage] = useState<string>('1');
  const {data} = useAPIGetChatNotes({roomId: room.id.toString(), page});
  const [notesForInfiniteScroll, setNotesForInfiniteScroll] = useState<
    ChatNote[]
  >([]);

  const onEndReached = () => {
    setPage(p => (Number(p) + 1).toString());
  };

  useEffect(() => {
    if (data?.notes?.length) {
      setNotesForInfiniteScroll(n => {
        if (n.length) {
          return [...n, ...data?.notes];
        }
        return data?.notes;
      });
    }
  }, [data?.notes]);

  return (
    <WholeContainer>
      <HeaderWithTextButton title="メニュー" />
      <Button
        bg="purple600"
        position="absolute"
        right={10}
        bottom={10}
        h={60}
        zIndex={20}
        rounded="circle"
        onPress={() =>
          navigation.navigate('ChatStack', {
            screen: 'PostChatNote',
            params: {room},
          })
        }
        w={60}>
        <Icon
          fontSize={'6xl'}
          name="pencil"
          fontFamily="Entypo"
          color="white"
        />
      </Button>
      {notesForInfiniteScroll.length ? (
        <FlatList
          {...{onEndReached}}
          style={tailwind('h-full bg-white')}
          data={notesForInfiniteScroll}
          renderItem={({item}) => (
            <ChatNoteCard
              note={item}
              onPress={() =>
                navigation.navigate('ChatStack', {
                  screen: 'EditChatNote',
                  params: {room, note: item},
                })
              }
            />
          )}
        />
      ) : (
        <Div bg="white">
          <Text>まだノートが投稿されていません</Text>
        </Div>
      )}
    </WholeContainer>
  );
};

export default ChatNotes;
