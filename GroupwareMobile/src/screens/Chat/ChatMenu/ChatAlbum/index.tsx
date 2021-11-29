import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {FlatList} from 'react-native';
import {Button, Icon, Text} from 'react-native-magnus';
import AlbumBox from '../../../../components/chat/AlbumBox';
import HeaderWithTextButton from '../../../../components/Header';
import WholeContainer from '../../../../components/WholeContainer';
import {useAPIGetChatAlbums} from '../../../../hooks/api/chat/album/useAPIGetAlbums';
import {ChatAlbum} from '../../../../types';
import {
  ChatAlbumsNavigationProps,
  ChatAlbumsRouteProps,
} from '../../../../types/navigator/drawerScreenProps';

const ChatAlbums: React.FC = () => {
  const navigation = useNavigation<ChatAlbumsNavigationProps>();
  const {room} = useRoute<ChatAlbumsRouteProps>().params;
  const [notesForInfiniteScroll, setNotesForInfiniteScroll] = useState<
    ChatAlbum[]
  >([]);
  const [page, setPage] = useState<string>('1');
  const {data} = useAPIGetChatAlbums({
    roomId: room.id.toString(),
    page: page,
  });

  const onEndReached = () => {
    setPage(p => (Number(p) + 1).toString());
  };

  useEffect(() => {
    if (data?.albums?.length) {
      setNotesForInfiniteScroll(n => {
        if (
          n.length &&
          new Date(n[n.length - 1].createdAt) >
            new Date(data.albums[0].createdAt)
        ) {
          return [...n, ...data?.albums];
        }
        return data?.albums;
      });
    }
  }, [data?.albums]);

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
            screen: 'PostChatAlbum',
            params: {room},
          })
        }
        w={60}>
        <Icon
          fontSize={'6xl'}
          name="pluscircle"
          rounded="circle"
          color="purple600"
          bg="white"
        />
      </Button>
      {notesForInfiniteScroll.length ? (
        <FlatList
          {...{onEndReached}}
          data={notesForInfiniteScroll}
          renderItem={({item}) => (
            <AlbumBox
              album={item}
              onPress={() =>
                navigation.navigate('ChatStack', {
                  screen: 'ChatAlbumDetail',
                  params: {room, album: item},
                })
              }
            />
          )}
        />
      ) : (
        <Text fontSize={16}>まだアルバムが投稿されていません</Text>
      )}
    </WholeContainer>
  );
};

export default ChatAlbums;
