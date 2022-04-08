import {
  Button,
  ModalBody,
  Box,
  SimpleGrid,
  Link,
  Text,
  Image,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import React, { useMemo, useState } from 'react';
import { AiOutlineLeft } from 'react-icons/ai';
import dynamic from 'next/dynamic';
import { useAPIGetChatAlbumImages } from '@/hooks/api/chat/album/useAPIGetChatAlbumImages';
import { ImageDecorator } from 'react-viewer/lib/ViewerProps';
import { ChatAlbumImage, ChatAlbum } from 'src/types';
const Viewer = dynamic(() => import('react-viewer'), { ssr: false });
import { saveAs } from 'file-saver';
import { fileNameTransformer } from 'src/utils/factory/fileNameTransformer';

type AlbumDetailProps = {
  onClickEdit: () => void;
  navigateToList: () => void;
  selectedAlbum: ChatAlbum;
  isOpen: boolean;
  onClose: () => void;
};

const AlbumDetail: React.FC<AlbumDetailProps> = ({
  onClickEdit,
  navigateToList,
  selectedAlbum,
  isOpen,
  onClose,
}) => {
  const [selectedImage, setSelectedImage] = useState<Partial<ChatAlbumImage>>();
  const [albumImages, setAlbumImage] = useState<ChatAlbumImage[]>([]);

  useAPIGetChatAlbumImages(
    {
      roomId: selectedAlbum?.chatGroup?.id.toString() || '',
      albumId: selectedAlbum?.id.toString() || '0',
    },
    {
      onSuccess: (data) => {
        setAlbumImage(data.images);
      },
    },
  );
  const imagesInDetailViewer = useMemo((): ImageDecorator[] => {
    return (
      albumImages?.map((i) => ({
        src: i.imageURL || '',
        downloadUrl: i.imageURL || '',
      })) || []
    );
  }, [albumImages]);

  const activeIndex = useMemo(() => {
    if (selectedImage) {
      const isNowUri = (element: ImageDecorator) =>
        element.src === selectedImage?.imageURL;
      return imagesInDetailViewer.findIndex(isNowUri);
    }
  }, [imagesInDetailViewer, selectedImage]);
  return (
    <>
      <Viewer
        customToolbar={(config) => {
          return config.concat([
            {
              key: 'donwload',
              render: (
                <i
                  className={`react-viewer-icon react-viewer-icon-download`}></i>
              ),
              onClick: ({ src }) => {
                if (selectedImage?.name) saveAs(src, selectedImage.name);
              },
            },
          ]);
        }}
        images={imagesInDetailViewer}
        visible={!!selectedImage}
        onClose={() => setSelectedImage(undefined)}
        activeIndex={activeIndex !== -1 ? activeIndex : 0}
      />
      {!selectedImage && (
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
            <ModalBody>
              <Box>
                <Box
                  flexDir="row"
                  justifyContent="space-between"
                  alignItems="center"
                  display="flex">
                  <Button
                    size="sm"
                    flexDir="row"
                    onClick={navigateToList}
                    mb="8px"
                    alignItems="center">
                    <AiOutlineLeft size={24} style={{ display: 'inline' }} />
                    <Text display="inline">一覧へ戻る</Text>
                  </Button>
                  <Box display="flex" flexDir="row" alignItems="center">
                    <Button
                      size="xs"
                      flexDir="row"
                      mr="4px"
                      onClick={onClickEdit}
                      mb="8px"
                      colorScheme="blue"
                      alignItems="center">
                      <Text display="inline">アルバムを編集</Text>
                    </Button>
                  </Box>
                </Box>
                <SimpleGrid spacing="8px" columns={2}>
                  {albumImages?.map((i) => (
                    <Box position="relative" key={i.id}>
                      <Link key={i.id} onClick={() => setSelectedImage(i)}>
                        <Image
                          loading="lazy"
                          src={i.imageURL}
                          alt="アルバム画像"
                          w="100%"
                        />
                      </Link>
                    </Box>
                  ))}
                </SimpleGrid>
              </Box>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default AlbumDetail;
