import { FC, useState } from 'react';
import LayoutWithTab from '@/components/layout/LayoutWithTab';
import Head from 'next/head';
import { useHeaderTab } from '@/hooks/headerTab/useHeaderTab';
import { Tab } from 'src/types/header/tab/types';
import { SidebarScreenName } from '@/components/layout/Sidebar';
import EditChatGroupMembersModal from '@/components/chat/EditChatGroupMembersModal';
import CreateChatGroupModal from '@/components/chat/CreateChatGroupModal';
import { useMediaQuery, useToast } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useAPISaveChatGroup } from '@/hooks/api/chat/useAPISaveChatGroup';
import { useHandleBadge } from 'src/contexts/badge/useHandleBadge';
import type { ChatGroup, User } from 'src/types';
import {
  ModalAction,
  ModalState,
  useModalReducer,
} from '@/hooks/chat/useModalReducer';
import EditChatGroupModal from '@/components/chat/EditChatGroupModal';
import { useAPIUpdateChatGroup } from '@/hooks/api/chat/useAPIUpdateChatGroup';
import { socket } from '../ChatBox/socket';

type Props = {
  currentRoom?: ChatGroup;
  setCurrentRoom?: (room: ChatGroup) => void;
  modalStates?: ModalState;
  dispatchModal?: React.Dispatch<ModalAction>;
};

const ChatLayout: FC<Props> = ({
  currentRoom,
  setCurrentRoom,
  children,
  modalStates,
  dispatchModal,
}) => {
  const router = useRouter();
  const toast = useToast();
  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');
  const { editChatGroup } = useHandleBadge();

  const [isTalkRoom, setIsTalkRoom] = useState<boolean>(false);
  const [membersModal, setMembersModal] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<User[]>();

  const { mutate: createGroup } = useAPISaveChatGroup({
    onSuccess: (createdData) => {
      editChatGroup(createdData);
      router.push(`/chat/${createdData.id.toString()}`, undefined, {
        shallow: true,
      });
    },
  });

  const { mutate: updateGroup } = useAPIUpdateChatGroup({
    onSuccess: (data) => {
      editChatGroup(data.room);
      for (const msg of data.systemMessage) {
        socket.emit('message', { type: 'send', chatMessage: msg });
      }
    },
    onError: () => {
      alert('?????????????????????????????????????????????????????????');
    },
  });

  const tabs: Tab[] = useHeaderTab({
    headerTabType: 'chatDetail',
    router,
    isSmallerThan768,
  });

  const isOwner = modalStates?.editOwnersModalVisible;

  return (
    <LayoutWithTab
      sidebar={{ activeScreenName: SidebarScreenName.CHAT }}
      header={{
        title: 'Chat',
        tabs: tabs,
        rightMenuName: '??????????????????',
        setIsTalkRoom: setIsTalkRoom,
        setMembersModal: setMembersModal,
      }}>
      <Head>
        <title>???????????? | Chat</title>
      </Head>

      {modalStates && dispatchModal ? (
        <>
          <EditChatGroupMembersModal
            isOpen={membersModal}
            onClose={() => setMembersModal(false)}
            onComplete={(selected) => {
              if (isTalkRoom) {
                createGroup({ name: '', members: selected });
                setMembersModal(false);
              } else {
                setSelectedMembers(selected);
                dispatchModal({ type: 'createGroupWindow', value: true });
              }
            }}
            isTalkRoom={isTalkRoom}
            category={'????????????'}
          />

          <CreateChatGroupModal
            isOpen={modalStates.createGroupWindow}
            closeModal={() => {
              dispatchModal({ type: 'createGroupWindow', value: false });
            }}
            onComplete={() => {
              setMembersModal(false);
            }}
            selectedMembers={selectedMembers || []}
          />
          {currentRoom && setCurrentRoom && (
            <>
              <EditChatGroupModal
                isOpen={modalStates.editChatGroupModalVisible}
                chatGroup={currentRoom}
                onComplete={(newInfo) => {
                  editChatGroup(newInfo);
                  setCurrentRoom(newInfo);
                }}
                closeModal={() =>
                  dispatchModal({
                    type: 'editChatGroupModalVisible',
                    value: false,
                  })
                }
              />
              <EditChatGroupMembersModal
                isOpen={isOwner || modalStates.editMembersModalVisible}
                room={currentRoom}
                onComplete={(selectedUsersInModal) => {
                  updateGroup(
                    !isOwner
                      ? {
                          ...currentRoom,
                          members: selectedUsersInModal,
                        }
                      : { ...currentRoom, owner: selectedUsersInModal },
                    {
                      onSuccess: (newGroupInfo) => {
                        dispatchModal({
                          type: 'editMembersModalVisible',
                          value: false,
                        });
                        toast({
                          title: `${
                            isOwner ? '????????????' : '????????????'
                          }?????????????????????`,
                          status: 'success',
                          duration: 3000,
                          isClosable: true,
                        });
                        setCurrentRoom(
                          !isOwner
                            ? {
                                ...newGroupInfo.room,
                                members: selectedUsersInModal,
                              }
                            : {
                                ...newGroupInfo.room,
                                owner: selectedUsersInModal,
                              },
                        );
                      },
                      onError: () => {
                        toast({
                          title: `??????????????????????????????`,
                          status: 'error',
                          duration: 3000,
                          isClosable: true,
                        });
                      },
                    },
                  );
                }}
                onClose={() =>
                  dispatchModal(
                    isOwner
                      ? {
                          type: 'editOwnersModalVisible',
                          value: false,
                        }
                      : {
                          type: 'editMembersModalVisible',
                          value: false,
                        },
                  )
                }
                category={isOwner ? '????????????' : '????????????'}
              />
            </>
          )}
        </>
      ) : (
        <></>
      )}
      {children}
    </LayoutWithTab>
  );
};

export default ChatLayout;
