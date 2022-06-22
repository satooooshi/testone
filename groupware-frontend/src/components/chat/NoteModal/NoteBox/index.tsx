import UserAvatar from '@/components/common/UserAvatar';
import {
  Box,
  Menu,
  MenuButton,
  IconButton,
  MenuList,
  SimpleGrid,
  Link,
  MenuItem,
  Text,
  Image,
} from '@chakra-ui/react';
import React from 'react';
import { FiMenu } from 'react-icons/fi';
import { ChatNote, ChatNoteImage } from 'src/types';
import { dateTimeFormatterFromJSDDate } from 'src/utils/dateTimeFormatter';
import { userNameFactory } from 'src/utils/factory/userNameFactory';
import Linkify from 'react-linkify';
import { blueColor } from 'src/utils/colors';
import { componentDecorator } from 'src/utils/componentDecorator';

type NoteBoxProps = {
  note: ChatNote;
  onClickEdit: (note: ChatNote) => void;
  onClickDelete: (note: ChatNote) => void;
  onClickImage: (note: ChatNote, selectedImage: Partial<ChatNoteImage>) => void;
};

const NoteBox: React.FC<NoteBoxProps> = ({
  note: n,
  onClickEdit,
  onClickDelete,
  onClickImage,
}) => {
  return (
    <>
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
            <Link onClick={() => onClickImage(n, i)} key={i.id}>
              <Image loading="lazy" src={i.imageURL} alt="関連画像" />
            </Link>
          ))}
        </SimpleGrid>
        <Linkify componentDecorator={componentDecorator}>
          <Text alignSelf="flex-start" whiteSpace="pre-wrap" w={'100%'}>
            {n.content}
          </Text>
        </Linkify>
      </Box>
    </>
  );
};

export default NoteBox;
