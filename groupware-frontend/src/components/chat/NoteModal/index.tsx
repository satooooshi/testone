import {
  Box,
  Button,
  FormLabel,
  Image,
  Link,
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
import { AiFillCloseCircle, AiOutlineLeft } from 'react-icons/ai';
import { useFormik } from 'formik';
import { ImageDecorator } from 'react-viewer/lib/ViewerProps';
import dynamic from 'next/dynamic';
import { useAPIUploadStorage } from '@/hooks/api/storage/useAPIUploadStorage';
import { useAPICreateChatNote } from '@/hooks/api/chat/note/useAPICreateChatNote';
import { useAPIGetChatNotes } from '@/hooks/api/chat/note/useAPIGetNotes';
import { useAPIDeleteChatNote } from '@/hooks/api/chat/note/useAPIDeleteChatNote';
import { useAPISaveNoteImage } from '@/hooks/api/chat/note/useAPISaveChatNoteImages';
import { useAPIUpdateNote } from '@/hooks/api/chat/note/useAPIUpdateChatNote';
import NoteBox from './NoteBox';
import { noteSchema } from 'src/utils/validation/schema';

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
              setValues((v) => ({
                ...v,
                images: v.images?.length
                  ? [...v.images, ...savedImages]
                  : [...savedImages],
              }));
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
  const {
    values,
    setValues,
    handleChange,
    handleSubmit,
    resetForm,
    errors,
    touched,
  } = useFormik<ChatNote | Partial<ChatNote>>({
    initialValues: initialValues,
    validationSchema: noteSchema,
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
      setMode('list');
      setNotesForInfiniteScroll([]);
      setNoteListPage(1);
      refetchNotes();
    },
  });
  const [mode, setMode] = useState<'new' | 'edit' | 'list'>('list');
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

  const removeImage = (image: Partial<ChatNoteImage>) => {
    if (!image.imageURL) {
      return;
    }
    if (confirm('画像をノートから削除してよろしいですか？')) {
      setValues((v) => ({
        ...v,
        images: v.images?.filter((i) => i.imageURL !== image.imageURL) || [],
      }));
    }
  };

  useEffect(() => {
    const refreshNotes = () => {
      setNoteListPage(1);
      refetchNotes();
    };
    if (!edittedNote && room) {
      refreshNotes();
    }
  }, [edittedNote, refetchNotes, room]);

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
            onClick={() => setMode('list')}
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
        {errors.content && touched.content ? (
          <FormLabel color="tomato">{errors.content}</FormLabel>
        ) : null}
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
          作成
        </Button>
      </Box>
    </Box>
  );
  const noteList = (
    <>
      <Box mb={!isLoading ? '24px' : undefined}>
        {notesForInfiniteScroll.map((n) => (
          <Box mb="16px" key={n.id}>
            <NoteBox
              note={n}
              onClickEdit={() => {
                setMode('edit');
                setEdittedNote(n);
              }}
              onClickDelete={() => handleNoteDelete(n)}
            />
          </Box>
        ))}
        {isLoading && <Spinner />}
      </Box>
    </>
  );

  const edit = (
    <Box>
      <Box mb="8px">
        <Box flexDir="row" justifyContent="space-between" display="flex">
          <Button
            size="sm"
            flexDir="row"
            onClick={() => {
              setMode('list');
              setEdittedNote(undefined);
            }}
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
            <Box position="relative" key={i.id}>
              <AiFillCloseCircle
                onClick={() => removeImage(i)}
                size={24}
                style={{
                  color: 'white',
                  top: 0,
                  right: 0,
                  background: 'black',
                  borderRadius: '100%',
                  position: 'absolute',
                  cursor: 'pointer',
                }}
              />
              <Link key={i.id} onClick={() => setSelectedImage(i)}>
                <Image src={i.imageURL} alt="関連画像" />
              </Link>
            </Box>
          ))}
        </SimpleGrid>
        {errors.content && touched.content ? (
          <FormLabel color="tomato">{errors.content}</FormLabel>
        ) : null}
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

  useEffect(() => {
    if (mode === 'new') {
      resetForm();
    }
  }, [mode, resetForm]);

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
        activeIndex={activeIndex !== -1 ? activeIndex : 0}
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
            {mode === 'edit' ? edit : mode === 'new' ? postNote : noteList}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default NoteModal;
