import { SidebarScreenName } from '@/components/layout/Sidebar';
import { MenuValue, useModalReducer } from '@/hooks/chat/useModalReducer';
import React, { useEffect, useMemo, useState } from 'react';
import { useAPIGetUsers } from '@/hooks/api/user/useAPIGetUsers';
import {
  ChatAlbum,
  ChatAlbumImage,
  ChatGroup,
  ChatMessage,
  ChatNote,
  ChatNoteImage,
} from 'src/types';
import { useAPIGetChatGroupList } from '@/hooks/api/chat/useAPIGetChatGroupList';
import CreateChatGroupModal from '@/components/chat/CreateChatGroupModal';
import {
  useMediaQuery,
  useToast,
  Box,
  Link,
  Modal,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalContent,
  ModalOverlay,
} from '@chakra-ui/react';
import '@draft-js-plugins/mention/lib/plugin.css';
import '@draft-js-plugins/image/lib/plugin.css';
import ChatGroupCard from '@/components/chat/ChatGroupCard';
import LayoutWithTab from '@/components/layout/LayoutWithTab';
import { Tab } from 'src/types/header/tab/types';
import { useAPIUploadStorage } from '@/hooks/api/storage/useAPIUploadStorage';
import SelectChatGroupModal from '@/components/chat/SelectChatGroupModal';
import Head from 'next/head';
import { useRouter } from 'next/router';
import EditChatGroupModal from '@/components/chat/EditChatGroupModal';
import EditChatGroupMembersModal from '@/components/chat/EditChatGroupMembersModal';
import { useAPISaveChatGroup } from '@/hooks/api/chat/useAPISaveChatGroup';
import { useAPISaveLastReadChatTime } from '@/hooks/api/chat/useAPISaveLastReadChatTime';
import { useHeaderTab } from '@/hooks/headerTab/useHeaderTab';
import { useAPILeaveChatRoom } from '@/hooks/api/chat/useAPILeaveChatRoomURL';
import ChatBox from '@/components/chat/ChatBox';
import { useAPIGetChatAlbums } from '@/hooks/api/chat/album/useAPIGetAlbums';
import AlbumModal from '@/components/chat/AlbumModal';
import { useAPIGetChatAlbumImages } from '@/hooks/api/chat/album/useAPIGetChatAlbumImages';
import { useAPISaveAlbumImage } from '@/hooks/api/chat/album/useAPISaveChatImages';
import NoteModal from '@/components/chat/NoteModal';
import { useAPIGetChatNotes } from '@/hooks/api/chat/note/useAPIGetNotes';
import { useAPIUpdateNote } from '@/hooks/api/chat/note/useAPIUpdateChatNote';
import { useAPISaveNoteImage } from '@/hooks/api/chat/note/useAPISaveChatNoteImages';
import { useAPIDeleteChatNote } from '@/hooks/api/chat/note/useAPIDeleteChatNote';
import 'emoji-mart/css/emoji-mart.css';
import { Picker } from 'emoji-mart';
import { useAPISaveReaction } from '@/hooks/api/chat/useAPISaveReaction';

const ChatDetail = () => {
  const toast = useToast();
  const router = useRouter();
  const { id } = router.query as { id: string };
  const { mutate: saveReaction } = useAPISaveReaction();
  const [selectedMsgForReaction, setSelectedMsgForReaction] =
    useState<ChatMessage>();
  const [room, setCurrentRoom] = useState<ChatGroup>();
  const [albumListPage, setAlbumListPage] = useState(1);
  const [noteListPage, setNoteListPage] = useState(1);
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
  const { mutate: deleteNote } = useAPIDeleteChatNote();
  const { mutate: saveNoteImage } = useAPISaveNoteImage();
  const [edittedNote, setEdittedNote] = useState<ChatNote>();
  const { data: notes, refetch: refetchNotes } = useAPIGetChatNotes({
    roomId: id,
    page: noteListPage.toString(),
  });
  const [
    {
      editChatGroupModalVisible,
      createGroupWindow,
      selectChatGroupWindow,
      editMembersModalVisible,
    },
    dispatchModal,
  ] = useModalReducer();
  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');
  const [albumImageListPage, setAlbumImageListPage] = useState(1);
  const { data: albums } = useAPIGetChatAlbums({
    roomId: id,
    page: albumListPage.toString(),
  });
  const [selectedAlbum, setSelectedAlbum] = useState<ChatAlbum>();
  const [albumImages, setAlbumImages] = useState<ChatAlbumImage[]>([]);

  useAPIGetChatAlbumImages(
    {
      roomId: id,
      albumId: selectedAlbum?.id.toString() || '0',
      page: albumImageListPage.toString(),
    },
    {
      onSuccess: (data) => {
        setAlbumImages((existImage) => {
          if (existImage.length) {
            return [...existImage, ...data.images];
          }
          return data?.images || [];
        });
      },
    },
  );

  const [visibleAlbumModal, setVisibleAlbumModal] = useState(false);
  const [visibleNoteModal, setVisibleNoteModal] = useState(false);
  const [resetFormTrigger, setResetFormTrigger] = useState(false);
  const [groupImageURL, setGroupImageURL] = useState('');
  const { data: chatGroups, refetch: refetchGroups } = useAPIGetChatGroupList();
  const { data: users } = useAPIGetUsers();
  const [isLargerTahn1024] = useMediaQuery('(min-width: 1024px)');
  const { mutate: createGroup } = useAPISaveChatGroup({
    onSuccess: (data) => {
      dispatchModal({ type: 'createGroupWindow', value: false });
      setResetFormTrigger(true);
      groupImageURL && setGroupImageURL('');
      refetchGroups();
      toast({
        description: 'チャットルームの作成が完了しました。',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      router.push(`/chat/${data.id.toString()}`, undefined, {
        shallow: true,
      });
    },
  });

  const { mutate: saveGroup } = useAPISaveChatGroup({
    onSuccess: (newInfo) => {
      dispatchModal({ type: 'editChatGroupModalVisible', value: false });
      setCurrentRoom(newInfo);
      refetchGroups();
    },
  });

  const { mutate: saveLastReadChatTime } = useAPISaveLastReadChatTime();
  const { mutate: leaveChatGroup } = useAPILeaveChatRoom({
    onSuccess: () => {
      router.push('/chat');
    },
  });

  const { mutate: uploadImage } = useAPIUploadStorage();
  const { mutate: saveAlbumImage } = useAPISaveAlbumImage();

  const tabs: Tab[] = useHeaderTab({
    headerTabType: 'chatDetail',
    router,
    isSmallerThan768,
  });
  const focusedGroup = useMemo(() => {
    if (id) {
      return chatGroups?.filter((g) => g.id.toString() === id);
    }
  }, [id, chatGroups]);

  useEffect(() => {
    if (focusedGroup?.length) {
      setCurrentRoom(focusedGroup[0]);
      saveLastReadChatTime(focusedGroup[0].id);
    }
  }, [focusedGroup, saveLastReadChatTime]);

  const toggleChatGroups = (selectGroup: ChatGroup) => {
    setCurrentRoom(selectGroup);
    dispatchModal({ type: 'selectChatGroupWindow', value: false });
  };

  const handleMenuSelected = (menuValue: MenuValue) => {
    if (menuValue === 'editMembers') {
      dispatchModal({
        type: 'editMembersModalVisible',
        value: true,
      });
      return;
    }
    if (menuValue === 'editGroup') {
      dispatchModal({
        type: 'editChatGroupModalVisible',
        value: true,
      });
      return;
    }
    if (menuValue === 'leaveRoom') {
      if (confirm('このルームを退室してよろしいですか？')) {
        leaveChatGroup({ id: Number(id) });
      }
      return;
    }
  };

  const handleUploadImageToExisNote = (files: File[]) => {
    uploadImage(files, {
      onSuccess: (imageURLs) => {
        const noteImages: Partial<ChatNoteImage>[] = imageURLs.map((i) => ({
          imageURL: i,
          chatAlbum: selectedAlbum,
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

  const handleUploadImageToExistAlbum = (files: File[]) => {
    uploadImage(files, {
      onSuccess: (imageURLs) => {
        if (selectedAlbum) {
          const albumImages: Partial<ChatAlbumImage>[] = imageURLs.map((i) => ({
            imageURL: i,
            chatAlbum: selectedAlbum,
          }));
          saveAlbumImage(albumImages, {
            onSuccess: (savedImages) => {
              setAlbumImages((i) => [...savedImages, ...i]);
            },
          });
        }
      },
    });
  };

  const handleNoteDelete = (note: ChatNote) => {
    if (confirm('ノートを削除します。よろしいですa?')) {
      deleteNote(
        { roomId: id, noteId: note.id.toString() },
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
      setNoteListPage(1);
      refetchNotes();
    };
    if (!edittedNote && visibleNoteModal) {
      refreshNotes();
    }
  }, [edittedNote, refetchNotes, visibleNoteModal]);

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: SidebarScreenName.CHAT }}
      header={{
        title: 'Chat',
        tabs: tabs,
        rightButtonName: 'ルームを作成',
        onClickRightButton: () =>
          dispatchModal({ type: 'createGroupWindow', value: true }),
      }}>
      <Head>
        <title>ボールド | Chat</title>
      </Head>
      <Modal
        isOpen={!!selectedMsgForReaction}
        onClose={() => setSelectedMsgForReaction(undefined)}>
        <ModalOverlay />
        <ModalContent h="90vh" bg={'#f9fafb'}>
          <ModalHeader>emoji</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Picker
              title=""
              emoji="point_up"
              skin={1}
              defaultSkin={1}
              onSelect={(emoji) => {
                saveReaction({
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  //@ts-ignore
                  emoji: emoji?.native,
                  chatMessage: selectedMsgForReaction,
                });
                setSelectedMsgForReaction(undefined);
              }}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {room && (
        <NoteModal
          room={room}
          onClickBackButton={() => setEdittedNote(undefined)}
          onClickEdit={(note) => setEdittedNote(note)}
          edittedNote={edittedNote}
          isOpen={visibleNoteModal}
          onClose={() => setVisibleNoteModal(false)}
          headerName={'ノート一覧'}
          notes={notes?.notes || []}
          onUploadImage={handleUploadImageToExisNote}
          onSubmitEdittedNote={(note) => updateNote(note)}
          onClickDelete={handleNoteDelete}
        />
      )}

      {room && (
        <AlbumModal
          room={room}
          isOpen={visibleAlbumModal}
          onClose={() => setVisibleAlbumModal(false)}
          headerName="アルバム一覧"
          albums={albums?.albums || []}
          images={albumImages}
          selectedAlbum={selectedAlbum}
          onClickAlbum={(album) => setSelectedAlbum(album)}
          onClickBackButton={() => {
            setSelectedAlbum(undefined);
            setAlbumImages([]);
          }}
          onUploadImage={handleUploadImageToExistAlbum}
        />
      )}
      {users && (
        <CreateChatGroupModal
          isOpen={createGroupWindow}
          users={users}
          resetFormTrigger={resetFormTrigger}
          groupImageURL={groupImageURL}
          setResetFormTrigger={setResetFormTrigger}
          closeModal={() => {
            dispatchModal({ type: 'createGroupWindow', value: false });
          }}
          createGroup={(g) => createGroup({ ...g, imageURL: groupImageURL })}
          uploadImage={(r) =>
            uploadImage(r, {
              onSuccess: async (fileURLs) => {
                setGroupImageURL(fileURLs[0]);
              },
            })
          }
        />
      )}
      {chatGroups && room ? (
        <SelectChatGroupModal
          isOpen={selectChatGroupWindow}
          chatGroups={chatGroups}
          onClose={() =>
            dispatchModal({ type: 'selectChatGroupWindow', value: false })
          }
          selectedChatGroup={room}
          toggleChatGroups={(group) => toggleChatGroups(group)}
        />
      ) : null}
      {room ? (
        <>
          <EditChatGroupModal
            isOpen={editChatGroupModalVisible}
            chatGroup={room}
            saveGroup={saveGroup}
            closeModal={() =>
              dispatchModal({
                type: 'editChatGroupModalVisible',
                value: false,
              })
            }
          />
          <EditChatGroupMembersModal
            isOpen={editMembersModalVisible}
            users={users || []}
            previousUsers={room.members || []}
            onCancel={() =>
              dispatchModal({
                type: 'editMembersModalVisible',
                value: false,
              })
            }
            onComplete={(newMembers) => {
              saveGroup({
                ...room,
                members: newMembers,
              });
              dispatchModal({
                type: 'editMembersModalVisible',
                value: false,
              });
            }}
          />
        </>
      ) : null}
      <Box
        w="100%"
        display="flex"
        flexDir="row"
        h="83vh"
        justifyContent="center">
        {chatGroups && chatGroups.length ? (
          <>
            <Box
              display={'flex'}
              flexDir="column"
              alignItems="center"
              h="100%"
              overflow="scroll"
              w={isLargerTahn1024 ? '30%' : '40%'}>
              {chatGroups ? (
                chatGroups.map((g) => (
                  <Link
                    onClick={() =>
                      router.push(`/chat/${g.id.toString()}`, undefined, {
                        shallow: true,
                      })
                    }
                    key={g.id}
                    mb={'8px'}>
                    <ChatGroupCard
                      isSelected={room?.id === g.id}
                      chatGroup={g}
                      key={g.id}
                    />
                  </Link>
                ))
              ) : (
                <p>ルームを作成するか、招待をお待ちください</p>
              )}
            </Box>
            {room && (
              <ChatBox
                onClickMessageForReaction={(message) =>
                  setSelectedMsgForReaction(message)
                }
                onClickNoteIcon={() => setVisibleNoteModal(true)}
                onClickAlbumIcon={() => setVisibleAlbumModal(true)}
                room={room}
                onMenuClicked={handleMenuSelected}
              />
            )}
          </>
        ) : (
          <Box position="absolute" top="auto" bottom="auto">
            ルームを作成するか、招待をお待ちください
          </Box>
        )}
      </Box>
    </LayoutWithTab>
  );
};

export default ChatDetail;
