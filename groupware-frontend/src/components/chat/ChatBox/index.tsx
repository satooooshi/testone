import {
  Avatar,
  Box,
  useMediaQuery,
  Text,
  Link,
  Spinner,
  Input,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import { MentionData } from '@draft-js-plugins/mention';
import { blueColor, darkFontColor } from 'src/utils/colors';
import { Menu, MenuItem, MenuButton } from '@szhsin/react-menu';
import { HiOutlineDotsCircleHorizontal } from 'react-icons/hi';
import Editor from '@draft-js-plugins/editor';
import { convertToRaw, EditorState } from 'draft-js';
import {
  AiFillCloseCircle,
  AiOutlineDown,
  AiOutlinePaperClip,
  AiOutlinePicture,
  AiOutlineSearch,
  AiOutlineUp,
} from 'react-icons/ai';
import { ChatGroup, ChatMessage, ChatMessageType, User } from 'src/types';
import { MenuValue } from '@/hooks/chat/useModalReducer';
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from 'react';
import ChatMessageItem from '../ChatMessageItem';
import { IoCloseSharp, IoSend } from 'react-icons/io5';
import { FiFileText } from 'react-icons/fi';
import createMentionPlugin from '@draft-js-plugins/mention';
import { useDropzone } from 'react-dropzone';
import { userNameFactory } from 'src/utils/factory/userNameFactory';
import { draftToMarkdown } from 'markdown-draft-js';
import { useAPIGetLastReadChatTime } from '@/hooks/api/chat/useAPIGetLastReadChatTime';
import { useAPIGetMessages } from '@/hooks/api/chat/useAPIGetMessages';
import { useAPISendChatMessage } from '@/hooks/api/chat/useAPISendChatMessage';
import { useFormik } from 'formik';
import { useAPIUploadStorage } from '@/hooks/api/storage/useAPIUploadStorage';
import { isImage, isVideo } from 'src/utils/indecateChatMessageType';
import { mentionTransform } from 'src/utils/mentionTransform';
import { useAPISaveLastReadChatTime } from '@/hooks/api/chat/useAPISaveLastReadChatTime';
import { ImageDecorator } from 'react-viewer/lib/ViewerProps';
import dynamic from 'next/dynamic';
const Viewer = dynamic(() => import('react-viewer'), { ssr: false });
import '@draft-js-plugins/mention/lib/plugin.css';
import '@draft-js-plugins/image/lib/plugin.css';
import UserAvatar from '@/components/common/UserAvatar';
import io from 'socket.io-client';
import { baseURL } from 'src/utils/url';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import AlbumModal from '../AlbumModal';
import NoteModal from '../NoteModal';
import { useRoomRefetch } from 'src/contexts/chat/useRoomRefetch';
import { fileNameTransformer } from 'src/utils/factory/fileNameTransformer';
import { saveAs } from 'file-saver';
import { EntryComponentProps } from '@draft-js-plugins/mention/lib/MentionSuggestions/Entry/Entry';
import suggestionStyles from '@/styles/components/Suggestion.module.scss';
import { useAPISearchMessages } from '@/hooks/api/chat/useAPISearchMessages';
import { removeHalfWidthSpace } from 'src/utils/replaceWidthSpace';
import { valueScaleCorrection } from 'framer-motion/types/render/dom/projection/scale-correction';

export const Entry: React.FC<EntryComponentProps> = ({
  mention,
  isFocused,
  id,
  onMouseUp,
  onMouseDown,
  onMouseEnter,
}) => {
  const entryRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isFocused) {
      if ('scrollIntoViewIfNeeded' in document.body) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        entryRef.current?.scrollIntoViewIfNeeded(false);
      } else {
        entryRef.current?.scrollIntoView(false);
      }
    }
  }, [isFocused]);

  return (
    <div
      ref={entryRef}
      style={
        isFocused
          ? {
              padding: '5px',
              backgroundColor: 'cornsilk',
            }
          : {
              padding: '5px',
            }
      }
      role="option"
      aria-selected={isFocused ? 'true' : 'false'}
      id={id}
      onMouseUp={onMouseUp}
      onMouseEnter={onMouseEnter}
      onMouseDown={onMouseDown}>
      {mention.name}
    </div>
  );
};

const socket = io(baseURL, {
  transports: ['websocket'],
});

type ChatBoxProps = {
  room: ChatGroup;
  onMenuClicked: (menuValue: MenuValue) => void;
};

const ChatBox: React.FC<ChatBoxProps> = ({ room, onMenuClicked }) => {
  const { needRefetch } = useRoomRefetch();
  const { user } = useAuthenticate();
  const [visibleAlbumModal, setVisibleAlbumModal] = useState(false);
  const [visibleNoteModal, setVisibleNoteModal] = useState(false);
  const [visibleSearchForm, setVisibleSearchForm] = useState(false);
  const [inputtedSearchWord, setInputtedSearchWord] = useState('');
  const [confirmedSearchWord, setConfirmedSearchWord] = useState('');
  const [after, setAfter] = useState<number>();
  const [before, setBefore] = useState<number>();
  const { user: myself } = useAuthenticate();
  const [focusedMessageID, setFocusedMessageID] = useState<number>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [searchedResults, setSearchedResults] = useState<
    Partial<ChatMessage>[]
  >([]);
  const [include, setInclude] = useState(false);

  const {
    values: newChatMessage,
    setValues: setNewChatMessage,
    handleSubmit,
  } = useFormik<Partial<ChatMessage>>({
    initialValues: {
      content: '',
      type: ChatMessageType.TEXT,
      chatGroup: room,
    },
    enableReinitialize: true,
    onSubmit: () => onSend(),
  });
  const imagesForViewing: ImageDecorator[] = useMemo(() => {
    return messages
      .filter((m) => m.type === ChatMessageType.IMAGE)
      .map((m) => ({
        src: m.content,
        downloadUrl: m.content,
      }))
      .reverse();
  }, [messages]);
  const { mutate: saveLastReadChatTime } = useAPISaveLastReadChatTime();
  const [selectedImageURL, setSelectedImageURL] = useState<string>();
  const { data: lastReadChatTime } = useAPIGetLastReadChatTime(room.id, {
    refetchInterval: 1000,
  });
  const userDataForMention: MentionData[] = useMemo(() => {
    const users =
      room?.members
        ?.filter((u) => u.id !== user?.id)
        .map((u) => ({
          id: u.id,
          name: userNameFactory(u) + 'さん',
          avatar: u.avatarUrl,
        })) || [];
    const allTag = { id: 0, name: 'all', avatar: '' };
    users.unshift(allTag);
    return users;
  }, [room?.members, user?.id]);

  const [suggestions, setSuggestions] =
    useState<MentionData[]>(userDataForMention);
  const [mentionOpened, setMentionOpened] = useState(false);
  const [mentionedUserData, setMentionedUserData] = useState<MentionData[]>([]);
  const { data: fetchedPastMessages } = useAPIGetMessages({
    group: room.id,
    after,
    before,
    include,
  });

  const { refetch: refetchLatest } = useAPIGetMessages(
    {
      group: room.id,
    },
    {
      enabled: false,
      onSuccess: (latestData) => {
        if (latestData?.length) {
          const msgToAppend: ChatMessage[] = [];
          for (const latest of latestData) {
            if (!messages?.length || isRecent(latest, messages?.[0])) {
              msgToAppend.push(latest);
            }
          }
          if (msgToAppend.length) {
            setMessages((m) => [...msgToAppend, ...m]);
            needRefetch();
          }
        }
      },
    },
  );

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
        socket.emit('message', { ...data, isSender: false });
        setNewChatMessage((m) => ({
          ...m,
          content: '',
          replyParentMessage: undefined,
        }));
        setEditorState(EditorState.createEmpty());
        messageWrapperDivRef.current &&
          messageWrapperDivRef.current.scrollTo({ top: 0 });
      },
    });

  const { mutate: uploadFiles, isLoading: loadingUplaod } = useAPIUploadStorage(
    {
      onSuccess: (fileURLs, requestFileURLs) => {
        const type = isImage(requestFileURLs[0].name)
          ? ChatMessageType.IMAGE
          : isVideo(requestFileURLs[0].name)
          ? ChatMessageType.VIDEO
          : ChatMessageType.OTHER_FILE;
        sendChatMessage({
          content: fileURLs[0],
          chatGroup: newChatMessage.chatGroup,
          type,
        });
        messageWrapperDivRef.current &&
          messageWrapperDivRef.current.scrollTo({ top: 0 });
      },
    },
  );

  const onSend = () => {
    if (newChatMessage.content) {
      let parsedMessage = newChatMessage.content;
      for (const m of mentionedUserData) {
        const regexp = new RegExp(`\\s${m.name}|^${m.name}`, 'g');
        parsedMessage = parsedMessage.replace(regexp, `@${m.name}`);
      }
      sendChatMessage({
        ...newChatMessage,
        content: parsedMessage,
      });
    }
  };

  const onSuggestionOpenChange = (_open: boolean) => {
    setMentionOpened(_open);
  };

  const onSuggestionSearchChange = ({ value }: { value: string }) => {
    setSuggestions(
      userDataForMention.filter((m) => {
        return m.name.toLowerCase().includes(value.toLowerCase());
      }),
    );
  };

  useEffect(() => {
    setSuggestions(userDataForMention);
  }, [userDataForMention]);

  const onAddMention = (newMention: MentionData) => {
    setMentionedUserData((m) => [...m, newMention]);
  };
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const messageWrapperDivRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<Editor>(null);
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
  const { getRootProps: getRootProps, getInputProps } = useDropzone({
    onDrop: (f) => uploadFiles(f),
  });

  const onEditorChange = (newState: EditorState) => {
    setEditorState(newState);
    const content = newState.getCurrentContent();
    const rawObject = convertToRaw(content);
    const markdownString = draftToMarkdown(rawObject);
    setNewChatMessage((v) => ({ ...v, content: markdownString }));
  };

  const nameOfEmptyNameGroup = (members?: User[]): string => {
    if (!members?.length) {
      return 'メンバーがいません';
    }
    const strMembers = members?.map((m) => m.lastName + m.firstName).join();
    return strMembers.toString();
  };

  const isRecent = (created: ChatMessage, target: ChatMessage): boolean => {
    if (new Date(created.createdAt) > new Date(target.createdAt)) {
      return true;
    }
    return false;
  };

  const { MentionSuggestions, plugins } = useMemo(() => {
    const mentionPlugin = createMentionPlugin();
    const { MentionSuggestions } = mentionPlugin;
    const plugins = [mentionPlugin];
    return { plugins, MentionSuggestions };
  }, []);

  const onScrollTopOnChat = (e: any) => {
    if (
      e.target.clientHeight - e.target.scrollTop >=
      (e.target.scrollHeight * 2) / 3
    ) {
      if (fetchedPastMessages?.length) {
        setBefore(messages[messages.length - 1].id);
      }
    }
  };

  useEffect(() => {
    setMessages([]);
    setBefore(undefined);
    setAfter(undefined);
    refetchLatest();
  }, [refetchLatest, room]);

  useEffect(() => {
    if (fetchedPastMessages?.length) {
      const refreshedMessage = refreshMessage(fetchedPastMessages);
      setMessages(refreshedMessage);

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
    socket.emit('joinRoom', room.id.toString());
    socket.on('msgToClient', async (sentMsgByOtherUsers: ChatMessage) => {
      // console.log('sent by other users', sentMsgByOtherUsers.content);
      if (sentMsgByOtherUsers.content) {
        sentMsgByOtherUsers.createdAt = new Date(sentMsgByOtherUsers.createdAt);
        sentMsgByOtherUsers.updatedAt = new Date(sentMsgByOtherUsers.updatedAt);
        if (sentMsgByOtherUsers.sender?.id === myself?.id) {
          sentMsgByOtherUsers.isSender = true;
        }
        setMessages((msgs) => {
          if (
            msgs.length &&
            msgs[0].id !== sentMsgByOtherUsers.id &&
            sentMsgByOtherUsers.chatGroup?.id === room.id
          ) {
            return [sentMsgByOtherUsers, ...msgs];
          } else if (sentMsgByOtherUsers.chatGroup?.id !== room.id) {
            return msgs.filter((m) => m.id !== sentMsgByOtherUsers.id);
          }
          return msgs;
        });
        needRefetch();
      }
    });

    // socket.on('joinedRoom', (r: any) => {
    //   console.log('joinedRoom', r);
    // });
    //
    // socket.on('leftRoom', (r: any) => {
    //   console.log('leftRoom', r);
    // });
    return () => {
      socket.emit('leaveRoom', room.id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.id]);

  useEffect(() => {
    messages[0]?.chatGroup?.id === room.id && saveLastReadChatTime(room.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, room.id]);

  useEffect(() => {
    saveLastReadChatTime(room.id);
    return () => saveLastReadChatTime(room.id);
  }, [room.id, saveLastReadChatTime]);

  const readUsers = (targetMsg: ChatMessage) => {
    return lastReadChatTime
      ? lastReadChatTime
          .filter((t) => t.readTime >= targetMsg.createdAt)
          .map((t) => t.user)
      : [];
  };

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

  const refreshMessage = (targetMessages: ChatMessage[]): ChatMessage[] => {
    const arrayIncludesDuplicate = [...messages, ...targetMessages];
    return filterCurrentGroup(arrayIncludesDuplicate)
      .filter((value, index, self) => {
        return index === self.findIndex((m) => m.id === value.id);
      })
      .sort((a, b) => b.id - a.id);
  };

  const filterCurrentGroup = (messages: ChatMessage[]) => {
    return messages.filter((m) => {
      return room.id === m.chatGroup?.id;
    });
  };

  const scrollToTarget = useCallback((topOffset: number) => {
    messageWrapperDivRef.current?.scrollTo({
      top: topOffset,
    });
  }, []);

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
          refetchLatest();
        }}
      />
      <NoteModal
        room={room}
        isOpen={visibleNoteModal}
        onClose={() => {
          setVisibleNoteModal(false);
          refetchLatest();
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
              onClick: ({ src }) => {
                saveAs(src, fileNameTransformer(src));
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
              {room?.name ? room.name : nameOfEmptyNameGroup(room?.members)}
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
            <MenuItem value={'editGroup'}>ルームの情報を編集</MenuItem>
            <MenuItem value={'editMembers'}>メンバーを編集</MenuItem>
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
                key={m.id + m.content}
                message={m}
                confirmedSearchWord={confirmedSearchWord}
                searchedResultIds={searchedResults?.map((s) => s.id)}
                readUsers={readUsers(m)}
                onClickReply={() =>
                  setNewChatMessage((pre) => ({
                    ...pre,
                    replyParentMessage: m,
                  }))
                }
                onClickImage={() => {
                  if (m.type === ChatMessageType.IMAGE) {
                    setSelectedImageURL(m.content);
                  }
                }}
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
      <Box
        boxSizing="border-box"
        cursor="text"
        p="16px"
        bg="#fefefe"
        h="20%"
        onClick={() => {
          editorRef.current?.focus();
        }}>
        <Editor
          editorKey={'editor'}
          placeholder="メッセージを入力"
          editorState={editorState}
          onChange={onEditorChange}
          plugins={plugins}
          ref={editorRef}
        />
        <div className={suggestionStyles.suggestion_wrapper}>
          <MentionSuggestions
            open={mentionOpened}
            onOpenChange={onSuggestionOpenChange}
            suggestions={suggestions}
            onSearchChange={onSuggestionSearchChange}
            onAddMention={onAddMention}
            entryComponent={Entry}
          />
        </div>
      </Box>
      <Link
        {...getRootProps()}
        color={darkFontColor}
        position="absolute"
        zIndex={1}
        bottom={'8px'}
        cursor="pointer"
        right="50px">
        <input {...getInputProps()} onClick={getInputProps().onDrag} />
        <AiOutlinePaperClip size={20} color={darkFontColor} />
      </Link>

      <Link
        color={darkFontColor}
        position="absolute"
        zIndex={1}
        bottom={'8px'}
        cursor="pointer"
        right="8px">
        {isLoading ? (
          <Spinner />
        ) : (
          <IoSend
            size={20}
            onClick={() => handleSubmit()}
            color={newChatMessage.content ? blueColor : darkFontColor}
          />
        )}
      </Link>
    </Box>
  );
};

export default ChatBox;
