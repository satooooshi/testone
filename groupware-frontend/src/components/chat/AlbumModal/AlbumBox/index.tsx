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
      py="8px"
      alignItems="center">
      <Box px="8px" display="flex" flexDir="row" w={'100%'}>
        <Text maxW="80%" noOfLines={1} mr="4px" display="inline" isTruncated>
          {album.title}
        </Text>
      </Box>
      <Box
        mb="4px"
        mr="4px"
        flexDir="row"
        display="flex"
        alignItems="center"
        fontSize="14px"
        alignSelf="flex-end"
        justifyContent="flex-end">
        <Text mr="4px" color="gray.500">
          {album.images?.length || 0}枚の画像
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
          loading="lazy"
          src={album.images[0].imageURL}
          alt="アルバム画像"
          maxW={'100%'}
          h={'200px'}
        />
      ) : (
        <NextImage src={noImage} alt="アルバム画像" />
      )}
    </LinkBox>
  );
};

export default AlbumBox;
