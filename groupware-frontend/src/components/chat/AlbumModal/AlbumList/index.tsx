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
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { ChatAlbum, ChatGroup } from 'src/types';
import AlbumBox from '../AlbumBox';

type AlbmListProps = {
  room: ChatGroup;
  onClickAlbum: (album: ChatAlbum) => void;
  isOpen: boolean;
  onClose: () => void;
};

const AlbumList: React.FC<AlbmListProps> = ({
  room,
  onClickAlbum,
  isOpen,
  onClose,
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
    setAlbumListPage(1);
  }, [room]);
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
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody onScroll={onScroll}>
          <Box>
            {albumsForScroll.map((a) => (
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
            ))}
            {isLoading && <Spinner />}
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default AlbumList;
