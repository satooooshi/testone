import {
  Box,
  Button,
  Image,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
import React, { useRef } from 'react';
import { ChatAlbum, ChatAlbumImage } from 'src/types';
import noImage from '@/public/no-image.jpg';
import NextImage from 'next/image';
import { AiOutlineLeft } from 'react-icons/ai';

type AlbumModalProps = {
  isOpen: boolean;
  onClose: () => void;
  headerName: string;
  albums: ChatAlbum[];
  images: ChatAlbumImage[];
  selectedAlbum?: ChatAlbum;
  onClickAlbum: (album: ChatAlbum) => void;
  onClickBackButton: () => void;
  onUploadImage: (files: File[]) => void;
};

const AlbumModal: React.FC<AlbumModalProps> = ({
  isOpen,
  onClose,
  headerName,
  albums,
  images,
  selectedAlbum,
  onClickAlbum,
  onClickBackButton,
  onUploadImage,
}) => {
  const imageUploaderRef = useRef<HTMLInputElement | null>(null);
  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <ModalOverlay />
      <ModalContent h="80vh" bg={'#f9fafb'}>
        <ModalHeader>{headerName}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {!selectedAlbum ? (
            albums.map((a) => (
              <Box mb="sm" key={a.id}>
                <Link
                  bg="white"
                  borderColor="gray.300"
                  borderWidth={1}
                  borderRadius="md"
                  w={'100%'}
                  maxWidth={'400px'}
                  display="flex"
                  flexDir="column"
                  onClick={() => onClickAlbum(a)}
                  alignItems="center">
                  <Box
                    p="8px"
                    flexDir="row"
                    w={'100%'}
                    justifyContent="flex-start">
                    <Text noOfLines={1} mr="4px" display="inline">
                      {a.title}
                    </Text>
                  </Box>
                  {a.images?.length ? (
                    <Image
                      src={a.images[0].imageURL}
                      alt="アルバム画像"
                      w={'100%'}
                      h={'200px'}
                    />
                  ) : (
                    <NextImage src={noImage} alt="アルバム画像" />
                  )}
                </Link>
              </Box>
            ))
          ) : (
            <Box>
              <Box flexDir="row" justifyContent="space-between" display="flex">
                <Button
                  size="sm"
                  flexDir="row"
                  onClick={onClickBackButton}
                  mb="8px"
                  alignItems="center">
                  <AiOutlineLeft size={24} style={{ display: 'inline' }} />
                  <Text display="inline">一覧へ戻る</Text>
                </Button>
                <Button
                  size="sm"
                  flexDir="row"
                  onClick={() => imageUploaderRef.current?.click()}
                  mb="8px"
                  colorScheme="green"
                  alignItems="center">
                  <Text display="inline">写真を追加</Text>
                </Button>
                <input
                  multiple
                  ref={imageUploaderRef}
                  accept="image/*"
                  type="file"
                  hidden
                  name="imageUploadToAlbum"
                  onChange={() => {
                    const files = imageUploaderRef.current?.files;
                    const fileArr: File[] = [];
                    if (!files) {
                      return;
                    }
                    for (let i = 0; i < files.length; i++) {
                      const renamedFile = new File([files[i]], files[i].name, {
                        type: files[i].type,
                        lastModified: files[i].lastModified,
                      });
                      fileArr.push(renamedFile);
                    }
                    onUploadImage(fileArr);
                  }}
                />
              </Box>
              <SimpleGrid spacing="8px" columns={2}>
                {selectedAlbum?.images?.map((i) => (
                  <Image
                    key={i.id}
                    src={i.imageURL}
                    alt="アルバム画像"
                    w="100%"
                  />
                ))}
              </SimpleGrid>
            </Box>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default AlbumModal;
