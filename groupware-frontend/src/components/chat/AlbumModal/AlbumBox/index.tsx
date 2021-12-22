import React from 'react';
import { Box, Image, Link, LinkBox, Text } from '@chakra-ui/react';
import NextImage from 'next/image';
import { ChatAlbum } from 'src/types';
import noImage from '@/public/no-image.jpg';
import { RiDeleteBin6Line } from 'react-icons/ri';

type AlbumBoxProps = {
  album: ChatAlbum;
  onClick: () => void;
  onClickDeleteButton: () => void;
};

const AlbumBox: React.FC<AlbumBoxProps> = ({
  album,
  onClick,
  onClickDeleteButton,
}) => {
  return (
    <LinkBox
      bg="white"
      borderColor="gray.300"
      borderWidth={1}
      borderRadius="md"
      w={'100%'}
      maxWidth={'400px'}
      display="flex"
      flexDir="column"
      cursor="pointer"
      onClick={onClick}
      alignItems="center">
      <Box
        p="8px"
        display="flex"
        flexDir="row"
        w={'100%'}
        justifyContent="space-between">
        <Text maxW="80%" noOfLines={1} mr="4px" display="inline">
          {album.title}
        </Text>
        <Link
          onClick={(e) => {
            e.stopPropagation();
            onClickDeleteButton();
          }}>
          <RiDeleteBin6Line fontSize={24} color="red" />
        </Link>
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
    </LinkBox>
  );
};

export default AlbumBox;
