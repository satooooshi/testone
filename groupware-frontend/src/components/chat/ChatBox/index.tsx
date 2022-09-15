import {
  Avatar,
  Box,
  useMediaQuery,
  Text,
  Link,
  Input,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import { darkFontColor } from 'src/utils/colors';
import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu';
import { HiOutlineDotsCircleHorizontal } from 'react-icons/hi';
import {
  AiFillCloseCircle,
  AiOutlineDown,
  AiOutlinePicture,
  AiOutlineSearch,
  AiOutlineUp,
} from 'react-icons/ai';
import {
  ChatGroup,
  ChatMessage,
  ChatMessageType,
  RoomType,
  User,
} from 'src/types';
import { MenuValue } from '@/hooks/chat/useModalReducer';
import React, {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import ChatMessageItem from '../ChatMessageItem';
import Sticker from '../Sticker';
import { IoCloseSharp } from 'react-icons/io5';
import { FiFileText } from 'react-icons/fi';
import createMentionPlugin from '@draft-js-plugins/mention';
import { useDropzone } from 'react-dropzone';
import { userNameFactory } from 'src/utils/factory/userNameFactory';
import { useAPIGetMessages } from '@/hooks/api/chat/useAPIGetMessages';
import { useAPISendChatMessage } from '@/hooks/api/chat/useAPISendChatMessage';
import { useAPIUploadStorage } from '@/hooks/api/storage/useAPIUploadStorage';
import { isImage, isVideo } from 'src/utils/indecateChatMessageType';
import { mentionTransform } from 'src/utils/mentionTransform';
import { ImageDecorator } from 'react-viewer/lib/ViewerProps';
import dynamic from 'next/dynamic';
const Viewer = dynamic(() => import('react-viewer'), { ssr: false });
import '@draft-js-plugins/mention/lib/plugin.css';
import '@draft-js-plugins/image/lib/plugin.css';
import UserAvatar from '@/components/common/UserAvatar';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import AlbumModal from '../AlbumModal';
import NoteModal from '../NoteModal';
import { saveAs } from 'file-saver';
import { useAPISearchMessages } from '@/hooks/api/chat/useAPISearchMessages';
import { removeHalfWidthSpace } from 'src/utils/replaceWidthSpace';
import { useChatSocket } from './socket';
import ChatEditor from '../ChatEditor';
import { nameOfEmptyNameGroup } from 'src/utils/chat/nameOfEmptyNameGroup';

type ChatBoxProps = {
  room: ChatGroup;
  onMenuClicked: (menuValue: MenuValue) => void;
};

const ChatBox: React.FC<ChatBoxProps> = ({ room, onMenuClicked }) => {
  const { user } = useAuthenticate();
  const [visibleAlbumModal, setVisibleAlbumModal] = useState(false);
  const [visibleNoteModal, setVisibleNoteModal] = useState(false);
  const [visibleSearchForm, setVisibleSearchForm] = useState(false);
  const [inputtedSearchWord, setInputtedSearchWord] = useState('');
  const [confirmedSearchWord, setConfirmedSearchWord] = useState('');
  const [after, setAfter] = useState<number>();
  const [before, setBefore] = useState<number>();
  const [minBefore, setMinBefore] = useState<number>();
  const [focusedMessageID, setFocusedMessageID] = useState<number>();
  const [searchedResults, setSearchedResults] = useState<
    Partial<ChatMessage>[]
  >([]);
  const [include, setInclude] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newChatMessage, setNewChatMessage] = useState<Partial<ChatMessage>>({
    content: '',
    type: ChatMessageType.TEXT,
    replyParentMessage: undefined,
    chatGroup: room,
  });
  const socket = useChatSocket(room, setMessages);

  const imagesForViewing: ImageDecorator[] = useMemo(() => {
    return messages
      .filter((m) => m.type === ChatMessageType.IMAGE)
      .map((m) => ({
        src: m.content,
        downloadUrl: m.fileName,
      }))
      .reverse();
  }, [messages]);

  const [selectedImageURL, setSelectedImageURL] = useState<string>();
  const { data: fetchedPastMessages, remove } = useAPIGetMessages({
    group: room.id,
    after,
    before,
    include,
    limit: '20',
  });

  const { refetch: searchMessages } = useAPISearchMessages(
    {
      group: room.id,
      word: inputtedSearchWord,
    },
    {
      enabled: false,
      onSuccess: (result) => {
        setSearchedResults(result);
        if (result.length && result[0].id) {
          setFocusedMessageID(result[0].id);
          refetchDoesntExistMessages(result[0].id);
        }
      },
    },
  );

  const { mutate: sendChatMessage, isLoading: loadingSend } =
    useAPISendChatMessage({
      onSuccess: (data) => {
        setMessages([data, ...messages]);
        socket.send({ chatMessage: data, type: 'send' });
        setNewChatMessage((m) => ({
          ...m,
          content: '',
          replyParentMessage: undefined,
        }));
        // editorStateRef.current = EditorState.createEmpty();
        messageWrapperDivRef.current &&
          messageWrapperDivRef.current.scrollTo({ top: 0 });
      },
      onError: (err) => {
        alert('メッセージを送信できませんでした。');
        console.log(err);
      },
    });

  const { mutate: uploadFiles, isLoading: loadingUplaod } = useAPIUploadStorage(
    {
      onSuccess: async (fileURLs, requestFileURLs) => {
        for (let i = 0; i < fileURLs.length; i++) {
          const type = isImage(requestFileURLs[i].name)
            ? ChatMessageType.IMAGE
            : isVideo(requestFileURLs[i].name)
            ? ChatMessageType.VIDEO
            : ChatMessageType.OTHER_FILE;
          sendChatMessage({
            content: fileURLs[i],
            fileName: requestFileURLs[i].name,
            chatGroup: newChatMessage.chatGroup,
            type,
          });
          await new Promise((r) => setTimeout(r, 100));
        }
        messageWrapperDivRef.current &&
          messageWrapperDivRef.current.scrollTo({ top: 0 });
      },
    },
  );

  const onSend = (content: string) => {
    sendChatMessage({
      ...newChatMessage,
      content: content,
    });
  };

  const messageWrapperDivRef = useRef<HTMLDivElement | null>(null);

  const [isSmallerThan768] = useMediaQuery('(max-width: 768px)');
  const countOfSearchWord = useMemo(() => {
    if (searchedResults && focusedMessageID) {
      const index = searchedResults?.findIndex((result) => {
        return result?.id === focusedMessageID;
      });
      return Math.abs(searchedResults.length - index);
    }
    return 0;
  }, [focusedMessageID, searchedResults]);
  const {
    getRootProps: noClickRootDropzone,
    getInputProps: noClickInputDropzone,
  } = useDropzone({
    noClick: true,
    onDrop: (f) => uploadFiles(f),
  });

  const handleStickerSelected = useCallback(
    (sticker?: string) => {
      sendChatMessage({
        content: sticker,
        chatGroup: newChatMessage.chatGroup,
        type: ChatMessageType.STICKER,
      });
    },
    [sendChatMessage, newChatMessage.chatGroup],
  );

  // const isRecent = (created: ChatMessage, target: ChatMessage): boolean => {
  //   if (new Date(created.createdAt) > new Date(target.createdAt)) {
  //     return true;
  //   }
  //   return false;
  // };

  const { MentionSuggestions, plugins } = useMemo(() => {
    const mentionPlugin = createMentionPlugin();
    const { MentionSuggestions } = mentionPlugin;
    const plugins = [mentionPlugin];
    return {
      MentionSuggestions,
      plugins,
    };
  }, []);

  const onScrollTopOnChat = (e: any) => {
    if (
      e.target.clientHeight - e.target.scrollTop >=
      (e.target.scrollHeight * 2) / 3
    ) {
      if (fetchedPastMessages?.length) {
        const target = messages[messages.length - 1].id;
        if (minBefore && minBefore <= target) return;
        setMinBefore(target);
        setBefore(target);
      }
    }
  };

  useEffect(() => {
    if (fetchedPastMessages?.length && room.members?.length) {
      setMessages((m) => {
        const refreshedMessage = refreshMessage(fetchedPastMessages, m);
        return refreshedMessage;
      });

      if (after && refetchDoesntExistMessages(fetchedPastMessages[0].id)) {
        refetchDoesntExistMessages(fetchedPastMessages[0].id + 20);
      }
      if (before && !refetchDoesntExistMessages(fetchedPastMessages[0].id)) {
        setInclude(false);
        setBefore(undefined);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchedPastMessages]);

  useEffect(() => {
    if (focusedMessageID) {
      refetchDoesntExistMessages(focusedMessageID);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedMessageID]);

  useEffect(() => {
    if (room.members?.length) {
      socket.joinRoom();
    }
    setNewChatMessage({
      content: '',
      type: ChatMessageType.TEXT,
      replyParentMessage: undefined,
      chatGroup: room,
    });
    if (messageWrapperDivRef.current) {
      messageWrapperDivRef.current.scrollTo({ top: 0 });
    }
    return () => {
      remove();
      socket.leaveRoom();
      setMessages([]);
      setBefore(undefined);
      setAfter(undefined);
      setMinBefore(undefined);
      setInclude(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.id]);

  const isLoading = loadingSend || loadingUplaod;
  const activeIndex = useMemo(() => {
    if (selectedImageURL) {
      const isNowUri = (element: ImageDecorator) =>
        element.src === selectedImageURL;
      return imagesForViewing.findIndex(isNowUri);
    }
  }, [imagesForViewing, selectedImageURL]);

  const replyTargetContent = (replyTarget: ChatMessage) => {
    switch (replyTarget.type) {
      case ChatMessageType.TEXT:
        return mentionTransform(replyTarget.content);
      case ChatMessageType.IMAGE:
        return '写真';
      case ChatMessageType.VIDEO:
        return '動画';
      case ChatMessageType.STICKER:
        return 'スタンプ';
      case ChatMessageType.OTHER_FILE:
        return 'ファイル';
    }
  };
  const refetchDoesntExistMessages = (focused: number) => {
    const isExist = messages.filter((m) => m.id === focused)?.length;

    if (!isExist) {
      setAfter(focused);
      setInclude(true);
      return true;
    } else {
      setInclude(false);
      return false;
    }
  };

  const nextFocusIndex = (sequence: 'prev' | 'next') => {
    if (searchedResults) {
      if (focusedMessageID !== undefined) {
        const index = searchedResults?.findIndex(
          (e) => e.id === focusedMessageID,
        );
        if (sequence === 'next') {
          return searchedResults?.[index - 1]
            ? searchedResults[index - 1]?.id
            : searchedResults[searchedResults.length - 1]?.id;
        } else {
          return searchedResults?.[index + 1]
            ? searchedResults[index + 1]?.id
            : searchedResults[0]?.id;
        }
      }
      return searchedResults[0]?.id;
    }
  };

  const refreshMessage = (
    targetMessages: ChatMessage[],
    messagesState: ChatMessage[],
  ): ChatMessage[] => {
    const filterCurrentGroup = (messages: ChatMessage[]) => {
      return messages.filter((m) => {
        return room.id === m.chatGroup?.id;
      });
    };

    const arrayIncludesDuplicate = [...messagesState, ...targetMessages];
    return filterCurrentGroup(arrayIncludesDuplicate)
      .filter((value, index, self) => {
        return index === self.findIndex((m) => m.id === value.id);
      })
      .sort((a, b) => b.id - a.id);
  };

  const scrollToTarget = useCallback((topOffset: number) => {
    messageWrapperDivRef.current?.scrollTo({
      top: topOffset,
    });
  }, []);

  const onClickReply = useCallback(
    (m: ChatMessage) => {
      setNewChatMessage((pre) => ({
        ...pre,
        replyParentMessage: m,
      }));
    },
    [setNewChatMessage],
  );
  const onClickImage = useCallback((m: ChatMessage) => {
    if (m.type === ChatMessageType.IMAGE) {
      setSelectedImageURL(m.content);
    }
  }, []);

  const searchedResultIds = useMemo(() => {
    return searchedResults?.map((s) => s.id);
  }, [searchedResults]);

  const isPersonal = room.roomType === RoomType.PERSONAL;

  return (
    <Box
      {...noClickRootDropzone()}
      w={isSmallerThan768 ? '100%' : '60vw'}
      h="100%"
      bg="white"
      position="relative"
      borderRadius="md"
      boxShadow="md">
      <AlbumModal
        room={room}
        isOpen={visibleAlbumModal}
        onClose={() => {
          setVisibleAlbumModal(false);
          // refetchLatest();
        }}
      />
      <NoteModal
        room={room}
        isOpen={visibleNoteModal}
        onClose={() => {
          setVisibleNoteModal(false);
          // refetchLatest();
        }}
      />
      <input {...noClickInputDropzone()} />
      <Viewer
        customToolbar={(config) => {
          return config.concat([
            {
              key: 'donwload',
              render: (
                <i
                  className={`react-viewer-icon react-viewer-icon-download`}></i>
              ),
              onClick: ({ src, downloadUrl }) => {
                saveAs(src, downloadUrl ? downloadUrl : 'image.png');
              },
            },
          ]);
        }}
        images={imagesForViewing}
        visible={!!selectedImageURL}
        onClose={() => setSelectedImageURL(undefined)}
        activeIndex={activeIndex !== -1 ? activeIndex : 0}
      />
      {/*
       * Header
       */}
      <Box
        h="40px"
        bg="white"
        borderBottomColor="#b0b0b0"
        borderWidth={'0.5px'}
        display="flex"
        flexDir="row"
        justifyContent="space-between"
        py="8px"
        px="16px">
        <Box display="flex" flexDir="row" alignItems="center">
          <Box mr="8px">
            <Avatar size="sm" src={room.imageURL} />
          </Box>
          <Box display="flex" flexDir="row">
            <Text
              mr={'4px'}
              fontWeight="bold"
              fontSize="18px"
              color={darkFontColor}
              noOfLines={1}>
              {nameOfEmptyNameGroup(room)}
            </Text>
            <Text
              fontWeight="bold"
              fontSize="18px"
              color={darkFontColor}
              noOfLines={1}>
              {`(${room?.members?.length || 0})`}
            </Text>
          </Box>
        </Box>
        <Box display="flex" flexDir="row" alignItems="center">
          <Link onClick={() => setVisibleSearchForm((v) => !v)}>
            <AiOutlineSearch size={24} />
          </Link>
          <Link mr="4px" onClick={() => setVisibleNoteModal(true)}>
            <FiFileText size={24} />
          </Link>
          <Link mr="4px" onClick={() => setVisibleAlbumModal(true)}>
            <AiOutlinePicture size={24} />
          </Link>
          <Menu
            direction="left"
            onItemClick={(e) => onMenuClicked(e.value as MenuValue)}
            menuButton={
              <MenuButton>
                <HiOutlineDotsCircleHorizontal size={24} />
              </MenuButton>
            }
            transition>
            {!isPersonal && (
              <>
                <MenuItem value={'editGroup'}>ルームの情報を編集</MenuItem>
                <MenuItem value={'editMembers'}>メンバーを編集</MenuItem>
              </>
            )}
            <MenuItem value={'leaveRoom'}>ルームを退室</MenuItem>
          </Menu>
        </Box>
      </Box>
      {visibleSearchForm && (
        <InputGroup size="md">
          <Input
            autoFocus={visibleSearchForm}
            value={inputtedSearchWord}
            placeholder="メッセージを検索"
            onChange={(e) => setInputtedSearchWord(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (
                  removeHalfWidthSpace(inputtedSearchWord) !== '' &&
                  inputtedSearchWord !== confirmedSearchWord
                ) {
                  searchMessages();
                  setConfirmedSearchWord(inputtedSearchWord);
                }
                setFocusedMessageID(nextFocusIndex('next'));
              }
            }}
          />
          <InputRightElement width="rem">
            {searchedResults.length !== 0 && (
              <Box display="flex">
                <Text>{`${countOfSearchWord} / ${searchedResults.length}`}</Text>
                <Link
                  onClick={() => setFocusedMessageID(nextFocusIndex('prev'))}
                  style={{ marginRight: 5 }}>
                  <AiOutlineUp size={20} />
                </Link>
                <Link
                  onClick={() => setFocusedMessageID(nextFocusIndex('next'))}
                  style={{ marginRight: 5 }}>
                  <AiOutlineDown size={20} />
                </Link>
              </Box>
            )}

            <Link onClick={() => setInputtedSearchWord('')}>
              <AiFillCloseCircle style={{ marginRight: 5 }} size={20} />
            </Link>
          </InputRightElement>
        </InputGroup>
      )}
      {/*
       * Messages
       */}
      <Box
        ref={messageWrapperDivRef}
        h={!newChatMessage.replyParentMessage ? '73%' : '60%'}
        bg="white"
        display="flex"
        flexDir="column-reverse"
        overflowY="auto"
        borderBottom="1px #ececec solid"
        p="8px"
        whiteSpace="pre-wrap"
        onScroll={onScrollTopOnChat}>
        {messages ? (
          <>
            {messages.map((m) => (
              <ChatMessageItem
                isScrollTarget={focusedMessageID === m.id}
                scrollToTarget={scrollToTarget}
                usersInRoom={room.members || []}
                key={m.id}
                message={m}
                confirmedSearchWord={confirmedSearchWord}
                searchedResultIds={searchedResultIds}
                lastReadChatTime={socket.lastReadChatTime}
                // readUsers={readUsers[i] ? readUsers[i] : []}
                onClickReply={onClickReply}
                onClickImage={onClickImage}
              />
            ))}
          </>
        ) : (
          <Box
            h="80%"
            bg="white"
            display="flex"
            flexDir="column"
            justifyContent="center"
            alignItems="center"
            borderBottom="1px #ececec solid"
            px="8px">
            <Text color={darkFontColor} mb="60px">
              このルームは存在しないか権限がありません
            </Text>
          </Box>
        )}
      </Box>
      {newChatMessage.replyParentMessage && (
        <Box
          display="flex"
          flexDir="row"
          alignItems="center"
          h="13%"
          borderBottomWidth={1}
          px="8px"
          position="relative"
          borderBottomColor="gray">
          <Link
            onClick={() =>
              setNewChatMessage((pre) => ({
                ...pre,
                replyParentMessage: undefined,
              }))
            }
            position="absolute"
            bg="transparent"
            rounded="full"
            size="sm"
            top={0}
            right={0}>
            <IoCloseSharp size={24} color={darkFontColor} />
          </Link>
          <UserAvatar
            mr="8px"
            src={newChatMessage.replyParentMessage.sender?.avatarUrl}
            size="md"
            user={newChatMessage.replyParentMessage.sender}
          />
          <Box display="flex" justifyContent="center" flexDir="column" w="100%">
            <Text fontWeight="bold">
              {userNameFactory(newChatMessage.replyParentMessage.sender)}
            </Text>
            <Text isTruncated w="90%" noOfLines={1}>
              {replyTargetContent(newChatMessage.replyParentMessage)}
            </Text>
          </Box>
        </Box>
      )}
      <ChatEditor
        room={room}
        onSend={onSend}
        isLoading={isLoading}
        uploadFiles={uploadFiles}
      />
      <Sticker handleStickerSelected={handleStickerSelected} />
    </Box>
  );
};

export default ChatBox;
