import UserAvatar from '@/components/common/UserAvatar';
import {
  Box,
  Menu,
  MenuButton,
  IconButton,
  MenuList,
  SimpleGrid,
  Link,
  Avatar,
  MenuItem,
  Text,
  Image,
} from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import React, { useMemo, useState } from 'react';
import { FiMenu } from 'react-icons/fi';
import { ImageDecorator } from 'react-viewer/lib/ViewerProps';
import { ChatNote, ChatNoteImage } from 'src/types';
import { dateTimeFormatterFromJSDDate } from 'src/utils/dateTimeFormatter';
import { userNameFactory } from 'src/utils/factory/userNameFactory';
const Viewer = dynamic(() => import('react-viewer'), { ssr: false });

type NoteBoxProps = {
  note: ChatNote;
  onClickEdit: (note: ChatNote) => void;
  onClickDelete: (note: ChatNote) => void;
};

const NoteBox: React.FC<NoteBoxProps> = ({
  note: n,
  onClickEdit,
  onClickDelete,
}) => {
  const [selectedImage, setSelectedImage] = useState<Partial<ChatNoteImage>>();
  const imagesForViewer = useMemo<ImageDecorator>(() => {
    return {
      src: selectedImage?.imageURL || '',
      alt: 'ノート画像',
      downloadUrl: selectedImage?.imageURL || '',
    };
  }, [selectedImage?.imageURL]);

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
                saveAs(src);
              },
            },
          ]);
        }}
        images={[imagesForViewer]}
        visible={!!selectedImage}
        onClose={() => setSelectedImage(undefined)}
        activeIndex={0}
      />
      <Box
        p={'4px'}
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
          mb="8px"
          flexDir="row"
          display="flex"
          alignItems="center"
          w="100%"
          justifyContent="space-between">
          <Box flexDir="row" display="flex">
            <UserAvatar
              user={n.editors?.length ? n.editors[0] : undefined}
              size="md"
              mr="4px"
            />
            <Box justifyContent="center" display="flex" flexDir="column">
              <Text mb="4px">
                {userNameFactory(n.editors?.length ? n.editors[0] : undefined)}
              </Text>
              <Text color="gray">
                {dateTimeFormatterFromJSDDate({
                  dateTime: new Date(n.createdAt),
                })}
              </Text>
            </Box>
          </Box>
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="Options"
              icon={<FiMenu />}
              variant="outline"
            />
            <MenuList>
              <MenuItem onClick={() => onClickEdit(n)}>編集</MenuItem>
              <MenuItem onClick={() => onClickDelete(n)}>削除</MenuItem>
            </MenuList>
          </Menu>
        </Box>
        <SimpleGrid spacing="4px" columns={3} w="100%">
          {n.images?.map((i) => (
            <Link onClick={() => setSelectedImage(i)} key={i.id}>
              <Image src={i.imageURL} alt="関連画像" />
            </Link>
          ))}
        </SimpleGrid>
        <Text alignSelf="flex-start" whiteSpace="pre-wrap">
          {n.content}
        </Text>
      </Box>
    </>
  );
};

export default NoteBox;
