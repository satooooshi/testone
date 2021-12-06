import {
  Avatar,
  Box,
  Button,
  IconButton,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  SimpleGrid,
  Text,
  Textarea,
} from '@chakra-ui/react';
import React, { useEffect, useRef } from 'react';
import { ChatNote } from 'src/types';
import { AiOutlineLeft } from 'react-icons/ai';
import { userNameFactory } from 'src/utils/factory/userNameFactory';
import { dateTimeFormatterFromJSDDate } from 'src/utils/dateTimeFormatter';
import { FiMenu } from 'react-icons/fi';
import { useFormik } from 'formik';

type NoteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  headerName: string;
  notes: ChatNote[];
  edittedNote?: ChatNote;
  onClickEdit: (note: ChatNote) => void;
  onClickBackButton: () => void;
  onClickDelete: (note: ChatNote) => void;
  onUploadImage: (files: File[]) => void;
  onSubmitEdittedNote: (note: ChatNote) => void;
};

const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  onClose,
  headerName,
  notes,
  edittedNote,
  onClickEdit,
  onClickBackButton,
  onClickDelete,
  onUploadImage,
  onSubmitEdittedNote,
}) => {
  const imageUploaderRef = useRef<HTMLInputElement | null>(null);

  const initialValues: Partial<ChatNote> = {
    content: '',
    editors: [],
    images: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const { values, setValues, handleChange, handleSubmit } = useFormik<
    ChatNote | Partial<ChatNote>
  >({
    initialValues: initialValues,
    onSubmit: (submittedValues) =>
      onSubmitEdittedNote(submittedValues as ChatNote),
  });

  useEffect(() => {
    if (edittedNote) {
      setValues(edittedNote);
    }
  }, [edittedNote, setValues]);

  return (
    <Modal onClose={onClose} isOpen={isOpen} scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent h="90vh" bg={'#f9fafb'}>
        <ModalHeader>{headerName}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {!edittedNote ? (
            notes.map((n) => (
              <Box
                mb="16px"
                p={'4px'}
                key={n.id}
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
                    <Avatar
                      src={
                        n.editors?.length ? n.editors[0].avatarUrl : undefined
                      }
                      size="md"
                      mr="4px"
                    />
                    <Box
                      justifyContent="center"
                      display="flex"
                      flexDir="column">
                      <Text mb="4px">
                        {userNameFactory(
                          n.editors?.length ? n.editors[0] : undefined,
                        )}
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
                  </Menu>{' '}
                </Box>
                <SimpleGrid spacing="4px" columns={3} w="100%">
                  {n.images?.map((i) => (
                    <Image key={i.id} src={i.imageURL} alt="関連画像" />
                  ))}
                </SimpleGrid>
                <Text alignSelf="flex-start">{n.content}</Text>
              </Box>
            ))
          ) : (
            <Box>
              <Box mb="8px">
                <Box
                  flexDir="row"
                  justifyContent="space-between"
                  display="flex">
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
                        const renamedFile = new File(
                          [files[i]],
                          files[i].name,
                          {
                            type: files[i].type,
                            lastModified: files[i].lastModified,
                          },
                        );
                        fileArr.push(renamedFile);
                      }
                      onUploadImage(fileArr);
                    }}
                  />
                </Box>
                <SimpleGrid mb="8px" spacing="4px" columns={3} w="100%">
                  {values.images?.map((i) => (
                    <Image key={i.id} src={i.imageURL} alt="関連画像" />
                  ))}
                </SimpleGrid>
                <Textarea
                  value={values.content}
                  name="content"
                  onChange={handleChange}
                  placeholder="今なにしてる？"
                  bg="white"
                  minH={'300px'}
                />
              </Box>
              <Box display="flex" justifyContent="center" alignItems="center">
                <Button colorScheme="pink" onClick={() => handleSubmit()}>
                  更新
                </Button>
              </Box>
            </Box>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default NoteModal;
