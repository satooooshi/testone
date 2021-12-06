import {
  Box,
  Image,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import React from 'react';
import { ChatAlbum } from 'src/types';
import noImage from '@/public/no-image.jpg';
import NextImage from 'next/image';

type AlbumModalProps = {
  isOpen: boolean;
  onClose: () => void;
  headerName: string;
  albums: ChatAlbum[];
};

const AlbumModal: React.FC<AlbumModalProps> = ({
  isOpen,
  onClose,
  headerName,
  albums,
}) => {
  return (
    <Modal onClose={onClose} isOpen={isOpen}>
      <ModalOverlay />
      <ModalContent bg={'#f9fafb'}>
        <ModalHeader>{headerName}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {albums.map((a) => (
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
          ))}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default AlbumModal;
