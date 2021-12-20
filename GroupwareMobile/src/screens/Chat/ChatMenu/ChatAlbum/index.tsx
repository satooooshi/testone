import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
import {Alert, FlatList} from 'react-native';
import {Button, Div, Icon, Text} from 'react-native-magnus';
import tailwind from 'tailwind-rn';
import AlbumBox from '../../../../components/chat/AlbumBox';
import HeaderWithTextButton from '../../../../components/Header';
import WholeContainer from '../../../../components/WholeContainer';
import {useAPIDeleteChatAlbum} from '../../../../hooks/api/chat/album/useAPIDeleteChatAlbum';
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
  const {data, refetch: refetchAlbums} = useAPIGetChatAlbums({
    roomId: room.id.toString(),
    page: page,
  });
  const {mutate: deleteAlbum} = useAPIDeleteChatAlbum();

  const onEndReached = () => {
    setPage(p => (Number(p) + 1).toString());
  };

  useEffect(() => {
    if (data?.albums?.length) {
      if (page === '1') {
        setNotesForInfiniteScroll(data.albums);
      } else {
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
    }
  }, [data?.albums, page]);

  useFocusEffect(
    useCallback(() => {
      setNotesForInfiniteScroll([]);
      setPage('1');
      refetchAlbums();
    }, [refetchAlbums]),
  );

  return (
    <WholeContainer>
      <HeaderWithTextButton title="アルバム" enableBackButton={true} />
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
          name="plus"
          rounded="circle"
          color="white"
          fontFamily="Feather"
        />
      </Button>
      {notesForInfiniteScroll.length ? (
        <FlatList
          {...{onEndReached}}
          data={notesForInfiniteScroll}
          contentContainerStyle={tailwind('pb-16')}
          keyExtractor={item => item.id.toString()}
          renderItem={({item}) => (
            <AlbumBox
              album={item}
              onPress={() =>
                navigation.navigate('ChatStack', {
                  screen: 'ChatAlbumDetail',
                  params: {room, album: item},
                })
              }
              onPressDeleteButton={() => {
                Alert.alert('アルバムを削除してよろしいですか？', undefined, [
                  {
                    text: 'キャンセル',
                    style: 'cancel',
                  },
                  {
                    text: '削除',
                    style: 'destructive',
                    onPress: () => {
                      deleteAlbum(
                        {
                          roomId: room.id.toString(),
                          albumId: item.id.toString(),
                        },
                        {
                          onSuccess: () => {
                            setPage('1');
                            refetchAlbums();
                          },
                        },
                      );
                    },
                  },
                ]);
              }}
            />
          )}
        />
      ) : (
        <Div p={'sm'}>
          <Text fontSize={16}>まだアルバムが投稿されていません</Text>
        </Div>
      )}
    </WholeContainer>
  );
};

export default ChatAlbums;
