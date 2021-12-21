import {
  Avatar,
  Box,
  Button,
  IconButton,
  Image,
  Link,
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
  Spinner,
  Text,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChatGroup, ChatNote, ChatNoteImage } from 'src/types';
import { AiOutlineLeft } from 'react-icons/ai';
import { userNameFactory } from 'src/utils/factory/userNameFactory';
import { dateTimeFormatterFromJSDDate } from 'src/utils/dateTimeFormatter';
import { FiMenu } from 'react-icons/fi';
import { useFormik } from 'formik';
import { ImageDecorator } from 'react-viewer/lib/ViewerProps';
import dynamic from 'next/dynamic';
import { useAPIUploadStorage } from '@/hooks/api/storage/useAPIUploadStorage';
import { useAPICreateChatNote } from '@/hooks/api/chat/note/useAPICreateChatNote';
import { useAPIGetChatNotes } from '@/hooks/api/chat/note/useAPIGetNotes';
import { useAPIDeleteChatNote } from '@/hooks/api/chat/note/useAPIDeleteChatNote';
import { useAPISaveNoteImage } from '@/hooks/api/chat/note/useAPISaveChatNoteImages';
import { useAPIUpdateNote } from '@/hooks/api/chat/note/useAPIUpdateChatNote';

const Viewer = dynamic(() => import('react-viewer'), { ssr: false });

type NoteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  room: ChatGroup;
};

const NoteModal: React.FC<NoteModalProps> = ({ isOpen, onClose, room }) => {
  const toast = useToast();
  const modalRef = useRef<HTMLDivElement | null>(null);
  const headerName = 'ノート一覧';
  const [noteListPage, setNoteListPage] = useState(1);
  const [edittedNote, setEdittedNote] = useState<ChatNote>();
  const {
    data: notes,
    refetch: refetchNotes,
    isLoading,
  } = useAPIGetChatNotes({
    roomId: room.id.toString(),
    page: noteListPage.toString(),
  });
  const [notesForInfiniteScroll, setNotesForInfiniteScroll] = useState<
    ChatNote[]
  >([]);
  const { mutate: deleteNote } = useAPIDeleteChatNote();
  const { mutate: saveNoteImage } = useAPISaveNoteImage();
  const { mutate: updateNote } = useAPIUpdateNote({
    onSuccess: () => {
      setEdittedNote(undefined);
      toast({
        title: 'ノートを更新しました',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const handleNoteDelete = (note: ChatNote) => {
    if (confirm('ノートを削除します。よろしいですa?')) {
      deleteNote(
        { roomId: room.id.toString(), noteId: note.id.toString() },
        {
          onSuccess: () => {
            toast({
              description: 'ノートを削除しました。',
              status: 'success',
              duration: 3000,
              isClosable: true,
            });
            setNoteListPage(1);
            refetchNotes();
          },
        },
      );
    }
  };

  const onUploadImage = (files: File[]) => {
    uploadImage(files, {
      onSuccess: (imageURLs) => {
        const noteImages: Partial<ChatNoteImage>[] = imageURLs.map((i) => ({
          imageURL: i,
          chatNote: edittedNote,
        }));
        saveNoteImage(noteImages, {
          onSuccess: (savedImages) => {
            if (edittedNote) {
              setEdittedNote({
                ...edittedNote,
                images: edittedNote.images?.length
                  ? [...savedImages, ...edittedNote.images]
                  : [...savedImages],
              });
            }
          },
        });
      },
    });
  };
  const initialValues: Partial<ChatNote> = {
    content: '',
    chatGroup: room,
    editors: [],
    images: [],
  };
  const { values, setValues, handleChange, handleSubmit, resetForm } =
    useFormik<ChatNote | Partial<ChatNote>>({
      initialValues: initialValues,
      onSubmit: (submittedValues) => {
        if (mode === 'new') {
          createNote(submittedValues);
        } else {
          updateNote(submittedValues as ChatNote);
        }
      },
    });
  const imageUploaderRef = useRef<HTMLInputElement | null>(null);
  const [selectedImage, setSelectedImage] = useState<Partial<ChatNoteImage>>();
  const { mutate: uploadImage } = useAPIUploadStorage();
  const { mutate: createNote } = useAPICreateChatNote({
    onSuccess: () => {
      resetForm();
      setMode('edit');
    },
  });
  const [mode, setMode] = useState<'new' | 'edit'>('edit');
  const imagesInNewNoteViewer = useMemo((): ImageDecorator[] => {
    return (
      values.images?.map((i) => ({
        src: i.imageURL || '',
        alt: 'アルバム画像',
        downloadUrl: i.imageURL || '',
      })) || []
    );
  }, [values.images]);

  const imagesInViewer = useMemo((): ImageDecorator[] => {
    if (edittedNote) {
      return (
        edittedNote.images?.map((i) => ({
          src: i.imageURL || '',
          alt: 'アルバム画像',
          downloadUrl: i.imageURL || '',
        })) || []
      );
    } else if (selectedImage) {
      return [
        {
          src: selectedImage.imageURL || '',
          alt: 'アルバム画像',
          downloadUrl: selectedImage.imageURL || '',
        },
      ];
    } else {
      return [];
    }
  }, [edittedNote, selectedImage]);

  const isNowUri = (element: ImageDecorator) =>
    element.src === selectedImage?.imageURL;
  const activeIndex = imagesInViewer.findIndex(isNowUri);

  useEffect(() => {
    const refreshNotes = () => {
      setNoteListPage(1);
      setNotesForInfiniteScroll([]);
      refetchNotes();
    };
    if (!edittedNote) {
      refreshNotes();
    }
  }, [edittedNote, refetchNotes]);

  useEffect(() => {
    if (notes?.notes?.length) {
      setNotesForInfiniteScroll((n) => {
        if (
          n.length &&
          new Date(n[n.length - 1].createdAt) >
            new Date(notes.notes[0].createdAt)
        ) {
          return [...n, ...notes?.notes];
        }
        return notes?.notes;
      });
    }
  }, [notes?.notes]);

  const postNote = (
    <Box>
      <Box mb="8px">
        <Box flexDir="row" justifyContent="space-between" display="flex">
          <Button
            size="sm"
            flexDir="row"
            onClick={() => setMode('edit')}
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
              uploadImage(fileArr, {
                onSuccess: (imageURLs) => {
                  const images: Partial<ChatNoteImage>[] = imageURLs.map(
                    (i) => ({ imageURL: i }),
                  );
                  setValues((v) => ({
                    ...v,
                    images: v.images?.length
                      ? [...v.images, ...images]
                      : [...images],
                  }));
                },
              });
            }}
          />
        </Box>
        <SimpleGrid mb="8px" spacing="4px" columns={3} w="100%">
          {values.images?.map((i) => (
            <Link key={i.id} onClick={() => setSelectedImage(i)}>
              <Image src={i.imageURL} alt="関連画像" />
            </Link>
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
  );

  const noteList = (
    <>
      {!edittedNote && notesForInfiniteScroll ? (
        <Box mb={!isLoading ? '24px' : undefined}>
          {notesForInfiniteScroll.map((n) => (
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
                    src={n.editors?.length ? n.editors[0].avatarUrl : undefined}
                    size="md"
                    mr="4px"
                  />
                  <Box justifyContent="center" display="flex" flexDir="column">
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
                    <MenuItem onClick={() => setEdittedNote(n)}>編集</MenuItem>
                    <MenuItem onClick={() => handleNoteDelete(n)}>
                      削除
                    </MenuItem>
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
          ))}
          {isLoading && <Spinner />}
        </Box>
      ) : (
        <Box>
          <Box mb="8px">
            <Box flexDir="row" justifyContent="space-between" display="flex">
              <Button
                size="sm"
                flexDir="row"
                onClick={() => setEdittedNote(undefined)}
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
            <SimpleGrid mb="8px" spacing="4px" columns={3} w="100%">
              {values.images?.map((i) => (
                <Link key={i.id} onClick={() => setSelectedImage(i)}>
                  <Image src={i.imageURL} alt="関連画像" />
                </Link>
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
    </>
  );

  const onScroll = (e: any) => {
    if (e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight) {
      setNoteListPage((p) => p + 1);
    }
  };

  useEffect(() => {
    if (edittedNote) {
      setValues(edittedNote);
    }
  }, [edittedNote, setValues]);

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
        images={mode === 'edit' ? imagesInViewer : imagesInNewNoteViewer}
        visible={!!selectedImage}
        onClose={() => setSelectedImage(undefined)}
        activeIndex={activeIndex}
      />
      <Modal
        onClose={onClose}
        isOpen={isOpen && !selectedImage}
        scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent h="90vh" bg={'#f9fafb'}>
          <ModalHeader
            flexDir="row"
            justifyContent="space-between"
            display="flex"
            mr="24px">
            <Text>{headerName}</Text>
            <Button
              size="sm"
              flexDir="row"
              onClick={() => setMode('new')}
              mb="8px"
              colorScheme="green"
              alignItems="center">
              <Text display="inline">ノートを作成</Text>
            </Button>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody ref={modalRef} onScroll={onScroll}>
            {mode === 'edit' ? noteList : postNote}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default NoteModal;
