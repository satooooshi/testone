import { useAPIDeleteChatNote } from '@/hooks/api/chat/note/useAPIDeleteChatNote';
import { useAPIGetChatNotes } from '@/hooks/api/chat/note/useAPIGetNotes';
import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useToast,
  Text,
} from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import React, { useEffect, useMemo, useState } from 'react';
import { ChatGroup, ChatNote, ChatNoteImage } from 'src/types';
import NoteBox from '../NoteBox';
const Viewer = dynamic(() => import('react-viewer'), { ssr: false });
import { saveAs } from 'file-saver';
import { ImageDecorator } from 'react-viewer/lib/ViewerProps';
import { fileNameTransformer } from 'src/utils/factory/fileNameTransformer';

type NoteListProps = {
  room: ChatGroup;
  isOpen: boolean;
  onClickEdit: (note: ChatNote) => void;
  onClickPost: () => void;
  onClose: () => void;
};

const NoteList: React.FC<NoteListProps> = ({
  room,
  isOpen,
  onClickEdit,
  onClickPost,
  onClose,
}) => {
  const headerName = 'ノート一覧';
  const toast = useToast();
  const { mutate: deleteNote } = useAPIDeleteChatNote();
  const [noteListPage, setNoteListPage] = useState(1);
  const [selectedNoteForImageViewer, setSelectedNoteForImageViewer] =
    useState<Partial<ChatNote>>();
  const imagesInSelectedNote: ImageDecorator[] = useMemo(() => {
    return (
      selectedNoteForImageViewer?.images?.map((i) => ({
        src: i.imageURL || '',
        downloadUrl: i.imageURL || '',
      })) || []
    );
  }, [selectedNoteForImageViewer?.images]);
  const [selectedImage, setSelectedImage] = useState<Partial<ChatNoteImage>>();
  const [notesForInfiniteScroll, setNotesForInfiniteScroll] = useState<
    ChatNote[]
  >([]);
  const {
    data: notes,
    refetch: refetchNotes,
    isLoading,
  } = useAPIGetChatNotes({
    roomId: room.id.toString(),
    page: noteListPage.toString(),
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

  useEffect(() => {
    const refreshNotes = () => {
      setNotesForInfiniteScroll([]);
      setNoteListPage(1);
      refetchNotes();
    };
    refreshNotes();
  }, [refetchNotes, room]);

  useEffect(() => {
    if (notes?.notes?.length) {
      if (noteListPage === 1) {
        setNotesForInfiniteScroll(notes.notes);
      } else {
        setNotesForInfiniteScroll((n) => {
          if (
            n.length &&
            new Date(n[n.length - 1].createdAt) >
              new Date(notes.notes[0].createdAt)
          ) {
            return [...n, ...notes?.notes];
          }
          return n;
        });
      }
    }
  }, [notes?.notes, noteListPage]);

  const onScroll = (e: any) => {
    if (e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight) {
      setNoteListPage((p) => p + 1);
    }
  };
  const isNowUri = (element: ImageDecorator) =>
    element.src === selectedImage?.imageURL;
  const activeIndex = imagesInSelectedNote.findIndex(isNowUri);

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
                if (selectedImage?.name) saveAs(src, selectedImage.name);
              },
            },
          ]);
        }}
        images={imagesInSelectedNote}
        visible={!!selectedImage}
        onClose={() => setSelectedImage(undefined)}
        activeIndex={activeIndex !== -1 ? activeIndex : 0}
      />
      {!selectedImage && (
        <Modal onClose={onClose} isOpen={isOpen} scrollBehavior="inside">
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
                onClick={onClickPost}
                mb="8px"
                colorScheme="green"
                alignItems="center">
                <Text display="inline">ノートを作成</Text>
              </Button>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody onScroll={onScroll}>
              <Box mb={!isLoading ? '24px' : undefined}>
                {notesForInfiniteScroll.length ? (
                  notesForInfiniteScroll.map((n) => (
                    <Box mb="16px" key={n.id}>
                      <NoteBox
                        note={n}
                        onClickEdit={() => {
                          onClickEdit(n);
                        }}
                        onClickDelete={() => handleNoteDelete(n)}
                        onClickImage={(note, image) => {
                          setSelectedNoteForImageViewer(note);
                          setSelectedImage(image);
                        }}
                      />
                    </Box>
                  ))
                ) : isLoading ? (
                  <Spinner />
                ) : (
                  <Text textAlign="center">まだノートが投稿されていません</Text>
                )}
                {!setNotesForInfiniteScroll.length && isLoading ? (
                  <Spinner />
                ) : null}
              </Box>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default NoteList;
