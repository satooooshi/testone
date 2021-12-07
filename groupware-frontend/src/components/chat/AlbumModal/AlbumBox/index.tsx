import React from 'react';
import { Box, Image, Link, Text } from '@chakra-ui/react';
import NextImage from 'next/image';
import { ChatAlbum } from 'src/types';
import noImage from '@/public/no-image.jpg';

type AlbumBoxProps = {
  album: ChatAlbum;
  onClick: (album: ChatAlbum) => void;
};

const AlbumBox: React.FC<AlbumBoxProps> = ({ album, onClick }) => {
  return (
    <Link
      bg="white"
      borderColor="gray.300"
      borderWidth={1}
      borderRadius="md"
      w={'100%'}
      maxWidth={'400px'}
      display="flex"
      flexDir="column"
      onClick={() => onClick(album)}
      alignItems="center">
      <Box p="8px" flexDir="row" w={'100%'} justifyContent="flex-start">
        <Text noOfLines={1} mr="4px" display="inline">
          {album.title}
        </Text>
      </Box>
      {album.images?.length ? (
        <Image
          src={album.images[0].imageURL}
          alt="アルバム画像"
          w={'100%'}
          h={'200px'}
        />
      ) : (
        <NextImage src={noImage} alt="アルバム画像" />
      )}
    </Link>
  );
};

export default AlbumBox;
