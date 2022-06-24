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
import {useAPIGetFileMessages} from '../../../../hooks/api/chat/useAPIGetFIlesMessages';
import {useAPIGetMessages} from '../../../../hooks/api/chat/useAPIGetMessages';
import {ChatMessage} from '../../../../types';
import {
  ChatFilesNavigationProps,
  ChatFilesRouteProps,
} from '../../../../types/navigator/drawerScreenProps';

const ChatFiles: React.FC = () => {
  const navigation = useNavigation<ChatFilesNavigationProps>();
  const {room} = useRoute<ChatFilesRouteProps>().params;
  const [filesForScroll, setFilesForScroll] = useState<ChatMessage[]>([]);
  const [page, setPage] = useState(1);
  const {refetch: refetchMessages} = useAPIGetFileMessages(
    {
      group: room.id.toString(),
      page: page.toString(),
    },
    {
      onSuccess: data => {
        setFilesForScroll(msg => (page === 1 ? data : [...msg, ...data]));
        console.log(
          '-----',
          data.map(m => m.fileName),
        );
      },
    },
  );

  const onEndReached = () => {
    if (filesForScroll.length >= 30) {
      setPage(p => p + 1);
    }
  };

  // useEffect(() => {
  //   if (data?.albums?.length) {
  //     if (page === '1') {
  //       setAlbumsForScroll(data.albums);
  //     } else {
  //       setAlbumsForScroll(a => {
  //         if (
  //           a.length &&
  //           new Date(a[a.length - 1].createdAt) >
  //             new Date(data.albums[0].createdAt)
  //         ) {
  //           return [...a, ...data?.albums];
  //         }
  //         return a;
  //       });
  //     }
  //   }
  // }, [data?.albums, page]);

  // useFocusEffect(
  //   useCallback(() => {
  //     // setAlbumsForScroll([]);
  //     setPage('1');
  //     refetchAlbums();
  //   }, [refetchAlbums]),
  // );

  return (
    <WholeContainer>
      <HeaderWithTextButton title="ファイル" enableBackButton={true} />
      <Button
        bg="purple600"
        position="absolute"
        right={10}
        bottom={10}
        h={60}
        zIndex={20}
        rounded="circle"
        // onPress={() =>
        //   navigation.navigate('ChatStack', {
        //     screen: 'ChatFile',
        //     params: {room},
        //   })
        // }
        w={60}>
        <Icon
          fontSize={'6xl'}
          name="plus"
          rounded="circle"
          color="white"
          fontFamily="Feather"
        />
      </Button>
      {filesForScroll.length ? (
        <FlatList
          {...{onEndReached}}
          data={filesForScroll}
          contentContainerStyle={tailwind('pb-16')}
          keyExtractor={item => item.id.toString()}
          renderItem={({item}) => <Text fontSize={16}>{item.fileName}</Text>}
        />
      ) : (
        <Div p={'sm'}>
          <Text fontSize={16}>まだファイルが投稿されていません</Text>
        </Div>
      )}
    </WholeContainer>
  );
};

export default ChatFiles;
