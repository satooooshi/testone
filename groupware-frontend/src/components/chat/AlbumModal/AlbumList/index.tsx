import { useAPIDeleteChatAlbum } from '@/hooks/api/chat/album/useAPIDeleteChatAlbum';
import { useAPIGetChatAlbums } from '@/hooks/api/chat/album/useAPIGetAlbums';
import {
  Box,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useToast,
  Text,
  Button,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { ChatAlbum, ChatGroup } from 'src/types';
import AlbumBox from '../AlbumBox';

type AlbmListProps = {
  room: ChatGroup;
  onClickAlbum: (album: ChatAlbum) => void;
  isOpen: boolean;
  onClose: () => void;
  onClickPost: () => void;
};

const AlbumList: React.FC<AlbmListProps> = ({
  room,
  onClickAlbum,
  isOpen,
  onClose,
  onClickPost,
}) => {
  const toast = useToast();
  const [albumsForScroll, setAlbumsForScroll] = useState<ChatAlbum[]>([]);
  const { mutate: deleteAlbum } = useAPIDeleteChatAlbum();
  const [albumListPage, setAlbumListPage] = useState(1);
  const {
    data: albums,
    isLoading,
    refetch: refetchAlbums,
  } = useAPIGetChatAlbums({
    roomId: room.id.toString(),
    page: albumListPage.toString(),
  });

  useEffect(() => {
    if (albums?.albums?.length) {
      if (albumListPage === 1) {
        setAlbumsForScroll(albums.albums);
      } else {
        setAlbumsForScroll((a) => {
          if (
            a.length &&
            new Date(a[a.length - 1].createdAt) >
              new Date(albums.albums[0].createdAt)
          ) {
            return [...a, ...albums?.albums];
          }
          return a;
        });
      }
    }
  }, [albumListPage, albums?.albums]);
  const onScroll = (e: any) => {
    if (
      e.target.scrollTop > (e.target.scrollHeight * 2) / 3 &&
      albums?.albums?.length
    ) {
      setAlbumListPage((p) => p + 1);
    }
  };

  useEffect(() => {
    setAlbumsForScroll([]);
    setAlbumListPage(1);
    refetchAlbums();
  }, [refetchAlbums, room]);

  return (
    <Modal onClose={onClose} isOpen={isOpen} scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent h="80vh" bg={'#f9fafb'}>
        <ModalHeader
          flexDir="row"
          justifyContent="space-between"
          display="flex"
          mr="24px">
          <Text>アルバム</Text>
          <Button
            size="sm"
            onClick={() => onClickPost()}
            mb="8px"
            colorScheme="green"
            alignItems="center">
            <Text display="inline">アルバムを作成</Text>
          </Button>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody onScroll={onScroll}>
          <Box>
            {albumsForScroll.length ? (
              albumsForScroll.map((a) => (
                <Box mb="16px" key={a.id}>
                  <AlbumBox
                    album={a}
                    onClick={() => {
                      onClickAlbum(a);
                    }}
                    onClickDeleteButton={() => {
                      if (confirm('アルバムを削除してよろしいですか？')) {
                        deleteAlbum(
                          {
                            roomId: room.id.toString(),
                            albumId: a.id.toString(),
                          },
                          {
                            onSuccess: () => {
                              setAlbumsForScroll([]);
                              setAlbumListPage(1);
                              toast({
                                description: 'アルバムを削除しました。',
                                status: 'success',
                                duration: 3000,
                                isClosable: true,
                              });
                              refetchAlbums();
                            },
                          },
                        );
                      }
                    }}
                  />
                </Box>
              ))
            ) : isLoading ? (
              <Spinner />
            ) : (
              <Text textAlign="center">まだアルバムが投稿されていません</Text>
            )}
            {albumsForScroll.length && isLoading ? <Spinner /> : null}
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default AlbumList;
