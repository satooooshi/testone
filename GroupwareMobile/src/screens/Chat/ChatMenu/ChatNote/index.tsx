import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
import {Alert, FlatList} from 'react-native';
import {Button, Div, Icon, Text} from 'react-native-magnus';
import tailwind from 'tailwind-rn';
import ChatNoteCard from '../../../../components/chat/Note/ChatNoteCard';
import HeaderWithTextButton from '../../../../components/Header';
import WholeContainer from '../../../../components/WholeContainer';
import {ChatNote, ChatNoteImage, ImageSource} from '../../../../types';
import {
  ChatNotesNavigationProps,
  ChatRouteProps,
} from '../../../../types/navigator/drawerScreenProps';
import ImageView from 'react-native-image-viewing';
import {useAPIGetChatNotes} from '../../../../hooks/api/chat/note/useAPIGetNotes';
import {useAPIDeleteChatNote} from '../../../../hooks/api/chat/note/useAPIDeleteChatNote';
import DownloadIcon from '../../../../components/common/DownLoadIcon';

const ChatNotes: React.FC = () => {
  const navigation = useNavigation<ChatNotesNavigationProps>();
  const {room} = useRoute<ChatRouteProps>().params;
  const [page, setPage] = useState<string>('1');
  const {data, refetch: refetchNotes} = useAPIGetChatNotes({
    roomId: room.id.toString(),
    page,
  });
  const [notesForInfiniteScroll, setNotesForInfiniteScroll] = useState<
    ChatNote[]
  >([]);
  const {mutate: deleteNote} = useAPIDeleteChatNote();
  const [imageModal, setImageModal] = useState(false);
  const [images, setImages] = useState<ImageSource[]>([]);
  const [nowImageIndex, setNowImageIndex] = useState<number>(0);

  const onEndReached = () => {
    setPage(p => (Number(p) + 1).toString());
  };

  const handlePressImage = (
    noteImages: Partial<ChatNoteImage>[],
    targetImage: Partial<ChatNoteImage>,
  ) => {
    const isNowUri = (element: Partial<ChatNoteImage>) =>
      element.imageURL === targetImage.imageURL;
    const imageSources: ImageSource[] = noteImages.map(i => ({
      uri: i.imageURL || '',
    }));
    setImages(imageSources);
    setNowImageIndex(noteImages.findIndex(isNowUri));
    setImageModal(true);
  };

  useEffect(() => {
    if (data?.notes?.length) {
      if (page === '1') {
        setNotesForInfiniteScroll(data.notes);
      } else {
        setNotesForInfiniteScroll(n => {
          if (
            n.length &&
            new Date(n[n.length - 1].createdAt) >
              new Date(data.notes[0].createdAt)
          ) {
            return [...n, ...data?.notes];
          }
          return data?.notes;
        });
      }
    }
  }, [data?.notes, page]);

  useFocusEffect(
    useCallback(() => {
      setPage('1');
      refetchNotes();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refetchNotes]),
  );

  return (
    <WholeContainer>
      <ImageView
        animationType="slide"
        images={images}
        imageIndex={nowImageIndex}
        visible={imageModal}
        onRequestClose={() => setImageModal(false)}
        swipeToCloseEnabled={false}
        doubleTapToZoomEnabled={true}
        FooterComponent={({imageIndex}) => (
          <Div position="absolute" bottom={5} right={5}>
            <DownloadIcon url={images[imageIndex].uri} />
          </Div>
        )}
      />
      <HeaderWithTextButton enableBackButton={true} title="ノート" />
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
          keyExtractor={item => item.id.toString()}
          renderItem={({item}) => (
            <ChatNoteCard
              key={item.id.toString()}
              note={item}
              onPressEditButton={() =>
                navigation.navigate('ChatStack', {
                  screen: 'EditChatNote',
                  params: {room, note: item},
                })
              }
              onPressDeleteButton={() => {
                Alert.alert('ノートを削除してよろしいですか？', undefined, [
                  {
                    text: 'キャンセル',
                    style: 'cancel',
                  },
                  {
                    text: '削除',
                    style: 'destructive',
                    onPress: () => {
                      deleteNote(
                        {
                          roomId: room.id.toString(),
                          noteId: item.id.toString(),
                        },
                        {
                          onSuccess: () => {
                            setPage('1');
                            refetchNotes();
                          },
                          onError: () => {
                            Alert.alert(
                              'ノートの削除中にエラーが発生しました。\n時間をおいて再実行してください。',
                            );
                          },
                        },
                      );
                    },
                  },
                ]);
              }}
              onPressImage={handlePressImage}
            />
          )}
        />
      ) : (
        <Div p={'sm'}>
          <Text fontSize={16}>まだノートが投稿されていません</Text>
        </Div>
      )}
    </WholeContainer>
  );
};

export default ChatNotes;
