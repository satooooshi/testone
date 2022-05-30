import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Alert,
  AppState,
  AppStateStatus,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  Div,
  Icon,
  Text,
  Modal as MagnusModal,
  Button,
  Dropdown,
  Input,
  Image,
} from 'react-native-magnus';
import WholeContainer from '../../components/WholeContainer';
import {useAPIGetMessages} from '../../hooks/api/chat/useAPIGetMessages';
import {useAPISearchMessages} from '../../hooks/api/chat/useAPISearchMessages';
import {useAPISendChatMessage} from '../../hooks/api/chat/useAPISendChatMessage';
import {useAPIUploadStorage} from '../../hooks/api/storage/useAPIUploadStorage';
import {chatStyles} from '../../styles/screen/chat/chat.style';
import {
  ChatMessage,
  ChatMessageReaction,
  ChatMessageType,
  ImageSource,
  User,
} from '../../types';
import {uploadImageFromGallery} from '../../utils/cropImage/uploadImageFromGallery';
import DocumentPicker from 'react-native-document-picker';
import ImageView from 'react-native-image-viewing';
import ChatFooter from '../../components/chat/ChatFooter';
import {userNameFactory} from '../../utils/factory/userNameFactory';
import {Suggestion} from 'react-native-controlled-mentions';
import {KeyboardAwareFlatList} from 'react-native-keyboard-aware-scroll-view';
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {
  ChatNavigationProps,
  ChatRouteProps,
} from '../../types/navigator/drawerScreenProps';
import {useFormik} from 'formik';
import ReplyTarget from '../../components/chat/ChatFooter/ReplyTarget';
import {darkFontColor} from '../../utils/colors';
import tailwind from 'tailwind-rn';
import {useAPIGetLastReadChatTime} from '../../hooks/api/chat/useAPIGetLastReadChatTime';
import {
  defaultDropdownOptionProps,
  defaultDropdownProps,
} from '../../utils/dropdown/helper';
import {useAPISaveReaction} from '../../hooks/api/chat/useAPISaveReaction';
import {useAPIDeleteReaction} from '../../hooks/api/chat/useAPIDeleteReaction';
import ReactionsModal from '../../components/chat/ReactionsModal';
import {saveToCameraRoll} from '../../utils/storage/saveToCameraRoll';
import VideoPlayer from 'react-native-video-player';
import ChatMessageItem from '../../components/chat/ChatMessage';
import {ActivityIndicator} from 'react-native-paper';
import {useAPISaveLastReadChatTime} from '../../hooks/api/chat/useAPISaveLastReadChatTime';
import DownloadIcon from '../../components/common/DownLoadIcon';
import UserAvatar from '../../components/common/UserAvatar';
import {nameOfRoom} from '../../utils/factory/chat/nameOfRoom';
import HeaderTemplate from '../../components/Header/HeaderTemplate';
import {useAPIGetRoomDetail} from '../../hooks/api/chat/useAPIGetRoomDetail';
import {chatMessageSchema} from '../../utils/validation/schema';
import {reactionEmojis} from '../../utils/factory/reactionEmojis';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import io from 'socket.io-client';
import {baseURL, storage} from '../../utils/url';
import {getThumbnailOfVideo} from '../../utils/getThumbnailOfVideo';
import {useAuthenticate} from '../../contexts/useAuthenticate';
import {useInviteCall} from '../../contexts/call/useInviteCall';
import {reactionStickers} from '../../utils/factory/reactionStickers';
import {ScrollView} from 'react-native-gesture-handler';
import {useHandleBadge} from '../../contexts/badge/useHandleBadge';
import {useIsTabBarVisible} from '../../contexts/bottomTab/useIsTabBarVisible';
import {debounce} from 'lodash';
import Clipboard from '@react-native-community/clipboard';
import {dateTimeFormatterFromJSDDate} from '../../utils/dateTimeFormatterFromJSDate';
import {useAPIGetUpdatedMessages} from '../../hooks/api/chat/useAPIGetUpdatedMessages';

const socket = io(baseURL, {
  transports: ['websocket'],
});

const TopTab = createMaterialTopTabNavigator();

const Chat: React.FC = () => {
  const {user: myself, setCurrentChatRoomId} = useAuthenticate();
  const typeDropdownRef = useRef<any | null>(null);
  const messageIosRef = useRef<FlatList | null>(null);
  const messageAndroidRef = useRef<{flatListRef: Element | null}>({
    flatListRef: null,
  });
  const navigation = useNavigation<ChatNavigationProps>();
  const route = useRoute<ChatRouteProps>();
  const {room} = route.params;
  const {sendCallInvitation} = useInviteCall();
  const isFocused = useIsFocused();
  const {setIsTabBarVisible} = useIsTabBarVisible();
  const {data: roomDetail, refetch: refetchRoomDetail} = useAPIGetRoomDetail(
    room.id,
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [focusedMessageID, setFocusedMessageID] = useState<number>();
  const [after, setAfter] = useState<number>();
  const [before, setBefore] = useState<number>();
  const [include, setInclude] = useState<boolean>(false);
  const [renderMessageIndex, setRenderMessageIndex] = useState<
    number | undefined
  >();
  const [inputtedSearchWord, setInputtedSearchWord] = useState('');
  const [imageModal, setImageModal] = useState(false);
  const [visibleSearchInput, setVisibleSearchInput] = useState(false);
  const imagesForViewing: ImageSource[] = useMemo(() => {
    return messages
      .filter(m => m.type === ChatMessageType.IMAGE)
      .map(m => ({
        uri: m.content,
      }))
      .reverse();
  }, [messages]);
  const [nowImageIndex, setNowImageIndex] = useState<number>(0);
  const [video, setVideo] = useState('');
  const {data: lastReadChatTime, refetch: refetchLastReadChatTime} =
    useAPIGetLastReadChatTime(room.id);
  const [longPressedMsg, setLongPressedMgg] = useState<ChatMessage>();
  const [reactionTarget, setReactionTarget] = useState<ChatMessage>();
  const [visibleStickerSelctor, setVisibleStickerSelector] = useState(false);
  const {mutate: saveReaction} = useAPISaveReaction();
  const {width: windowWidth, height: windowHeight} = useWindowDimensions();
  const {mutate: deleteReaction} = useAPIDeleteReaction();
  const [selectedReactions, setSelectedReactions] = useState<
    ChatMessageReaction[] | undefined
  >();
  const {handleEnterRoom, refetchRoomCard} = useHandleBadge();
  const [selectedEmoji, setSelectedEmoji] = useState<string>();
  const {mutate: saveLastReadChatTime} = useAPISaveLastReadChatTime();
  const [selectedMessageForCheckLastRead, setSelectedMessageForCheckLastRead] =
    useState<ChatMessage>();

  const {values, handleSubmit, setValues} = useFormik<Partial<ChatMessage>>({
    initialValues: {
      content: '',
      type: ChatMessageType.TEXT,
      replyParentMessage: null,
      chatGroup: room,
    },
    validationSchema: chatMessageSchema,
    enableReinitialize: true,
    onSubmit: submittedValues => {
      Keyboard.dismiss();
      if (submittedValues.content) {
        sendChatMessage(submittedValues);
      }
    },
  });
  const {
    isLoading: loadingMessages,
    isFetching: fetchingMessages,
    refetch: refetchFetchedPastMessages,
  } = useAPIGetMessages(
    {
      group: room.id,
      limit: 20,
      after,
      before,
      include,
    },
    {
      enabled: false,
      onSuccess: res => {
        console.log('success =============================', res.length);
        if (res?.length) {
          const refreshedMessage = refreshMessage(res);
          console.log('refreshMessage =============', refreshedMessage.length);
          setMessages(refreshedMessage);
          if (refetchDoesntExistMessages(res[0].id)) {
            refetchDoesntExistMessages(res[0].id + 20);
          } else {
            setAfter(undefined);
            setInclude(false);
            setBefore(undefined);
          }
        }
      },
    },
  );

  const {data: searchedResults, refetch: searchMessages} = useAPISearchMessages(
    {
      group: room.id,
      word: inputtedSearchWord,
    },
  );
  const suggestions = (): Suggestion[] => {
    if (!room.members) {
      return [];
    }
    const users =
      room?.members
        ?.filter(u => u.id !== myself?.id)
        .map(u => ({
          id: `${u.id}`,
          name: userNameFactory(u) + 'さん',
        })) || [];
    const allTag = {id: '0', name: 'all'};
    users.unshift(allTag);
    return users;
  };

  // const {refetch: refetchLatest} = useAPIGetMessages(
  //   {
  //     group: room.id,
  //     limit: room.unreadCount || 0,
  //   },
  //   {
  //     enabled: false,
  //     onSuccess: latestData => {
  //       if (latestData?.length) {
  //         const msgToAppend: ChatMessage[] = [];
  //         const imagesToApped: ImageSource[] = [];
  //         for (const latest of latestData) {
  //           if (!messages?.length || isRecent(latest, messages?.[0])) {
  //             msgToAppend.push(latest);
  //             if (latest.type === ChatMessageType.IMAGE) {
  //               imagesToApped.unshift({uri: latest.content});
  //             }
  //           }
  //         }
  //         setMessages(m => refreshMessage([...msgToAppend, ...m]));
  //         // setImagesForViewing(i => [...i, ...imagesToApped]);
  //       }
  //       console.log('latest success ====================', latestData.length);
  //       const now = dateTimeFormatterFromJSDDate({
  //         dateTime: new Date(),
  //         format: 'yyyy-LL-dd HH:mm:ss',
  //       });

  //       storage.set(`dateRefetchLatestInRoom${room.id}`, now);
  //     },
  //   },
  // );

  const {mutate: refetchUpdatedMessages} = useAPIGetUpdatedMessages({
    onSuccess: latestData => {
      if (latestData?.length) {
        // const msgToAppend: ChatMessage[] = [];
        // const imagesToApped: ImageSource[] = [];
        // for (const latest of latestData) {
        //   if (!messages?.length || isRecent(latest, messages?.[0])) {
        //     msgToAppend.push(latest);
        //     if (latest.type === ChatMessageType.IMAGE) {
        //       imagesToApped.unshift({uri: latest.content});
        //     }
        //   }
        // }
        setMessages(m => refreshMessage([...latestData, ...m]));
        // setImagesForViewing(i => [...i, ...imagesToApped]);
      }
      console.log('latest success ====================', latestData.length);
      const now = dateTimeFormatterFromJSDDate({
        dateTime: new Date(),
        format: 'yyyy-LL-dd HH:mm:ss',
      });
      storage.set(`dateRefetchLatestInRoom${room.id}`, now);
    },
  });

  const {mutate: sendChatMessage, isLoading: loadingSendMessage} =
    useAPISendChatMessage({
      onSuccess: sentMsg => {
        socket.emit('message', {...sentMsg, isSender: false});
        setMessages(refreshMessage([sentMsg, ...messages]));
        if (sentMsg?.chatGroup?.id) {
          refetchRoomCard({id: sentMsg.chatGroup.id, type: ''});
        }
        setValues(v => ({
          ...v,
          content: '',
          type: ChatMessageType.TEXT,
          replyParentMessage: undefined,
        }));
      },
      onError: () => {
        Alert.alert(
          'チャットの送信中にエラーが発生しました。\n時間をおいて再度実行してください。',
        );
      },
    });

  const {mutate: uploadFile, isLoading: loadingUploadFile} =
    useAPIUploadStorage();
  const isLoadingSending = loadingSendMessage || loadingUploadFile;

  const showImageOnModal = (url: string) => {
    const isNowUri = (element: ImageSource) => element.uri === url;
    setNowImageIndex(imagesForViewing.findIndex(isNowUri));
    setImageModal(true);
  };

  const handleDeleteReaction = (
    reaction: ChatMessageReaction,
    target: ChatMessage,
  ) => {
    deleteReaction(reaction, {
      onSuccess: reactionId => {
        setMessages(m => {
          return refreshMessage(
            m.map(eachMessage => {
              if (eachMessage.id === target.id) {
                return {
                  ...eachMessage,
                  reactions: eachMessage.reactions?.filter(
                    r => r.id !== reactionId,
                  ),
                };
              }
              return eachMessage;
            }),
          );
        });
      },
      onError: () => {
        Alert.alert(
          'リアクションの更新中にエラーが発生しました。\n時間をおいて再実行してください。',
        );
      },
    });
  };

  const handleSaveReaction = async (emoji: string, target?: ChatMessage) => {
    const reaction: Partial<ChatMessageReaction> = {
      emoji,
      chatMessage: target || reactionTarget,
    };
    saveReaction(reaction, {
      onSettled: () => setReactionTarget(undefined),
      onSuccess: savedReaction => {
        const reactionAdded = {...savedReaction, isSender: true};
        setMessages(m =>
          m.map(eachMessage => {
            if (eachMessage.id === savedReaction.chatMessage?.id) {
              return {
                ...eachMessage,
                reactions: eachMessage.reactions?.length
                  ? [...eachMessage.reactions, reactionAdded]
                  : [reactionAdded],
              };
            }
            return eachMessage;
          }),
        );
      },
      onError: () => {
        Alert.alert(
          'リアクションの更新中にエラーが発生しました。\n時間をおいて再実行してください。',
        );
      },
    });
  };

  const handleUploadImage = async () => {
    const {formData} = await uploadImageFromGallery({
      mediaType: 'photo',
      cropping: false,
    });
    if (formData) {
      uploadFile(formData, {
        onSuccess: imageURL => {
          sendChatMessage({
            content: imageURL[0],
            fileName: imageURL[0] + '.png',
            type: ChatMessageType.IMAGE,
            chatGroup: room,
          });
        },
      });
    }
  };

  const handleUploadVideo = async () => {
    const {formData} = await uploadImageFromGallery({
      mediaType: 'video',
      multiple: false,
    });
    if (formData) {
      uploadFile(formData, {
        onSuccess: imageURL => {
          sendChatMessage({
            content: imageURL[0],
            fileName: imageURL[0] + '.mp4',
            type: ChatMessageType.VIDEO,
            chatGroup: room,
          });
        },
      });
    }
  };

  const handleUploadFile = async () => {
    const normalizeURL = (url: string) => {
      const filePrefix = 'file://';
      if (url.startsWith(filePrefix)) {
        url = url.substring(filePrefix.length);
        url = decodeURI(url);
        return url;
      }
    };
    const res = await DocumentPicker.pickSingle({
      type: [DocumentPicker.types.allFiles],
    });
    const formData = new FormData();
    formData.append('files', {
      name: res.name,
      uri: normalizeURL(res.uri),
      type: res.type,
    });
    uploadFile(formData);
    if (formData) {
      uploadFile(formData, {
        onSuccess: imageURL => {
          sendChatMessage({
            content: imageURL[0],
            fileName: res.name,
            type: ChatMessageType.OTHER_FILE,
            chatGroup: room,
          });
        },
        onError: () => {
          Alert.alert(
            'アップロード中にエラーが発生しました。\n時間をおいて再実行してください。',
          );
        },
      });
    }
  };

  const handleStickerSelected = (sticker: string) => {
    sendChatMessage({
      content: sticker,
      type: ChatMessageType.STICKER,
      chatGroup: room,
    });
    setVisibleStickerSelector(false);
  };

  const playVideoOnModal = (url: string) => {
    setVideo(url);
  };

  const isRecent = (created: ChatMessage, target: ChatMessage): boolean => {
    if (new Date(created.createdAt) > new Date(target.createdAt)) {
      return true;
    }
    return false;
  };

  const numbersOfRead = (message: ChatMessage) => {
    return (
      lastReadChatTime?.filter(time => time.readTime >= message.createdAt)
        .length || 0
    );
  };

  const onScrollTopOnChat = () => {
    setBefore(messages[messages.length - 1].id);
  };

  const scrollToRenderedMessage = () => {
    const wait = new Promise(resolve => setTimeout(resolve, 100));
    wait.then(() => {
      if (renderMessageIndex) {
        scrollToTarget(renderMessageIndex);
        setRenderMessageIndex(undefined);
      } else {
        Alert.alert(
          'メッセージの読み込みがうまくいきませんでした。\n再度検索してください。',
        );
      }
    });
  };

  const scrollToTarget = useCallback(
    (messageIndex: number) => {
      if (searchedResults?.length && inputtedSearchWord) {
        if (Platform.OS === 'ios') {
          messageIosRef.current?.scrollToIndex({index: messageIndex});
        } else {
          (messageAndroidRef.current?.flatListRef as any)?.scrollToIndex({
            index: messageIndex,
          });
        }
      }
    },
    [inputtedSearchWord, searchedResults?.length],
  );

  const countOfSearchWord = useMemo(() => {
    if (searchedResults?.length && focusedMessageID) {
      const index = searchedResults?.findIndex(result => {
        return result?.id === focusedMessageID;
      });
      return Math.abs(searchedResults.length - index);
    }
    return 0;
  }, [searchedResults, focusedMessageID]);

  const nextFocusIndex = (sequence: 'prev' | 'next') => {
    if (searchedResults?.length) {
      const index = searchedResults.findIndex(e => e.id === focusedMessageID);

      if (sequence === 'next') {
        return searchedResults?.[index].id === searchedResults?.[0].id
          ? searchedResults?.[searchedResults.length - 1].id
          : searchedResults[index - 1].id;
      } else if (sequence === 'prev') {
        return searchedResults?.[index].id ===
          searchedResults?.[searchedResults.length - 1].id
          ? searchedResults[0].id
          : searchedResults[index + 1].id;
      }
    }
  };

  const refetchDoesntExistMessages = (focused?: number) => {
    if (!messages.length) {
      return false;
    }
    const isExist = messages.filter(m => m.id === focused)?.length;

    if (!isExist) {
      setAfter(focused);
      setInclude(true);
      return true;
    } else {
      setInclude(false);
      return false;
    }
  };

  const refreshMessage = (targetMessages: ChatMessage[]): ChatMessage[] => {
    const arrayIncludesDuplicate = [...messages, ...targetMessages];
    return arrayIncludesDuplicate
      .filter((value, index, self) => {
        return index === self.findIndex(m => m.id === value.id);
      })
      .sort((a, b) => b.id - a.id);
  };

  const saveMessages = (msg: ChatMessage[]) => {
    const jsonMessages = JSON.stringify(msg);
    storage.set(`messagesIntRoom${room.id}`, jsonMessages);
  };

  useEffect(() => {
    setBefore(undefined);
    setAfter(undefined);
  }, [room]);

  useEffect(() => {
    console.log('call ==================== refetch past messages');
    refetchFetchedPastMessages();
  }, [before, after, include, refetchFetchedPastMessages]);

  useEffect(() => {
    if (messages.length) {
      saveMessages(messages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  useEffect(() => {
    // 検索する文字がアルファベットの場合、なぜかuseAPISearchMessagesのonSuccessが動作しない為、こちらで代わりとなる処理を記述しています。
    if (searchedResults?.length) {
      setFocusedMessageID(searchedResults[0].id);
      refetchDoesntExistMessages(searchedResults[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchedResults]);

  useEffect(() => {
    if (focusedMessageID) {
      console.log('focus change trigger ===================');
      refetchDoesntExistMessages(focusedMessageID);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedMessageID]);

  const typeDropdown = (
    <Dropdown
      {...defaultDropdownProps}
      title="アクションを選択"
      onBackdropPress={() => typeDropdownRef.current?.close()}
      ref={typeDropdownRef}>
      <Dropdown.Option
        {...defaultDropdownOptionProps}
        onPress={() => {
          setValues(v => ({...v, replyParentMessage: longPressedMsg}));
          setLongPressedMgg(undefined);
        }}
        value={'reply'}>
        返信する
      </Dropdown.Option>
      <Dropdown.Option
        {...defaultDropdownOptionProps}
        value="reaction"
        onPress={() => {
          setReactionTarget(longPressedMsg);
          setLongPressedMgg(undefined);
        }}>
        リアクション
      </Dropdown.Option>

      {longPressedMsg?.type === 'text' ? (
        <Dropdown.Option
          {...defaultDropdownOptionProps}
          value="copy"
          onPress={() => {
            Clipboard.setString(
              longPressedMsg?.content ? longPressedMsg?.content : '',
            );
            setLongPressedMgg(undefined);
          }}>
          コピー
        </Dropdown.Option>
      ) : (
        <></>
      )}
    </Dropdown>
  );

  useEffect(() => {
    if (longPressedMsg) {
      typeDropdownRef.current?.open();
    }
  }, [longPressedMsg]);

  useEffect(() => {
    if (isFocused) {
      setIsTabBarVisible(false);
    } else {
      setIsTabBarVisible(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused, setIsTabBarVisible]);

  useEffect(() => {
    let isMounted = true;
    socket.connect();
    socket.emit('joinRoom', room.id.toString());
    socket.on('readMessageClient', async (senderId: string) => {
      if (myself?.id && senderId && senderId !== `${myself?.id}`) {
        console.log('readMessageClient called', senderId, myself.id, room.id);
        refetchLastReadChatTime();
      }
    });
    socket.on('msgToClient', async (sentMsgByOtherUsers: ChatMessage) => {
      if (sentMsgByOtherUsers.content) {
        if (
          sentMsgByOtherUsers?.sender?.id !== myself?.id &&
          AppState.currentState === 'active'
        ) {
          saveLastReadChatTime(room.id, {
            onSuccess: () => {
              socket.emit('readReport', {
                room: room.id.toString(),
                senderId: myself?.id,
              });
              handleEnterRoom(room.id);
            },
          });
          refetchLastReadChatTime();
        }
        sentMsgByOtherUsers.createdAt = new Date(sentMsgByOtherUsers.createdAt);
        sentMsgByOtherUsers.updatedAt = new Date(sentMsgByOtherUsers.updatedAt);
        if (sentMsgByOtherUsers.sender?.id === myself?.id) {
          sentMsgByOtherUsers.isSender = true;
        }
        // setImagesForViewing(i => [...i, {uri: sentMsgByOtherUsers.content}]);
        if (sentMsgByOtherUsers.type === ChatMessageType.VIDEO) {
          sentMsgByOtherUsers.thumbnail = await getThumbnailOfVideo(
            sentMsgByOtherUsers.content,
          );
        }
        if (isMounted) {
          setMessages(msgs => {
            if (
              msgs.length &&
              msgs[0].id !== sentMsgByOtherUsers.id &&
              sentMsgByOtherUsers.chatGroup?.id === room.id
            ) {
              return refreshMessage([sentMsgByOtherUsers, ...msgs]);
            } else if (sentMsgByOtherUsers.chatGroup?.id !== room.id) {
              return refreshMessage(
                msgs.filter(m => m.id !== sentMsgByOtherUsers.id),
              );
            }
            return refreshMessage(msgs);
          });
        }
      }
    });
    setCurrentChatRoomId(room.id);

    socket.on('joinedRoom', (r: any) => {
      console.log('joinedRoom', r);
    });

    socket.on('leftRoom', (r: any) => {
      console.log('leftRoom', r);
    });
    return () => {
      socket.emit('leaveRoom', room.id);
      isMounted = false;
      setCurrentChatRoomId(undefined);
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.id]);

  // useEffect(() => {
  //   messages[0]?.chatGroup?.id === room.id && saveLastReadChatTime(room.id);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [messages, room.id]);

  const readUsers = useCallback(
    (targetMsg: ChatMessage) => {
      return lastReadChatTime
        ? lastReadChatTime
            .filter(t => new Date(t.readTime) >= new Date(targetMsg.createdAt))
            .map(t => t.user)
        : [];
    },
    [lastReadChatTime],
  );

  const renderMessage = (message: ChatMessage, messageIndex: number) => (
    <Div
      mb={'sm'}
      mx="md"
      onLayout={() =>
        message.id === focusedMessageID &&
        renderMessageIndex &&
        scrollToRenderedMessage()
      }>
      <ChatMessageItem
        message={message}
        readUsers={readUsers(message)}
        inputtedSearchWord={inputtedSearchWord}
        searchedResultIds={searchedResults?.map(s => s.id)}
        messageIndex={messageIndex}
        scrollToTarget={scrollToTarget}
        isScrollTarget={focusedMessageID === message.id}
        onCheckLastRead={() => setSelectedMessageForCheckLastRead(message)}
        numbersOfRead={numbersOfRead(message)}
        onLongPress={() => setLongPressedMgg(message)}
        onPressImage={() => showImageOnModal(message.content)}
        onPressVideo={() => playVideoOnModal(message.content)}
        onPressReaction={r =>
          r.isSender
            ? handleDeleteReaction(r, message)
            : handleSaveReaction(r.emoji, message)
        }
        onLongPressReation={() => {
          if (message.reactions?.length && message.isSender) {
            setSelectedReactions(message.reactions);
          }
        }}
      />
    </Div>
  );

  const reactionSelector = (
    <Div
      bg="white"
      flexDir="row"
      flexWrap="wrap"
      alignSelf="center"
      w={'100%'}
      py={32}
      justifyContent="space-around"
      px={'sm'}>
      <TouchableOpacity
        style={tailwind('absolute right-0 top-0')}
        onPress={() => setReactionTarget(undefined)}>
        <Icon name="close" fontSize={24} />
      </TouchableOpacity>
      {reactionEmojis.map(e => (
        <Text key={e} fontSize={26} onPress={() => handleSaveReaction(e)}>
          {e}
        </Text>
      ))}
    </Div>
  );
  const stickerSelector = (
    <Div
      bg="white"
      flexDir="row"
      flexWrap="wrap"
      alignSelf="center"
      w={'100%'}
      py={32}
      justifyContent="space-around"
      px={'sm'}>
      <TouchableOpacity
        style={tailwind('absolute right-0 top-0')}
        onPress={() => setVisibleStickerSelector(false)}>
        <Icon name="close" fontSize={24} />
      </TouchableOpacity>
      <ScrollView horizontal={true}>
        {reactionStickers.map(e => (
          <TouchableOpacity
            key={e.name}
            onPress={() => handleStickerSelected(e.name)}>
            <Image source={e.src} style={{height: 80, width: 80, margin: 10}} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Div>
  );

  const messageListAvoidngKeyboardDisturb = (
    <>
      {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView
          keyboardVerticalOffset={windowHeight * 0.08}
          style={chatStyles.keyboardAvoidingViewIOS}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {loadingMessages && fetchingMessages ? <ActivityIndicator /> : null}
          <FlatList
            ref={messageIosRef}
            style={chatStyles.flatlist}
            inverted
            data={messages}
            onScrollToIndexFailed={info => {
              setRenderMessageIndex(info.index);
            }}
            onEndReached={() => onScrollTopOnChat()}
            renderItem={({item: message, index}) =>
              renderMessage(message, index)
            }
          />
          {reactionTarget ? (
            reactionSelector
          ) : visibleStickerSelctor ? (
            stickerSelector
          ) : (
            <>
              {values.replyParentMessage && (
                <ReplyTarget
                  onPressCloseIcon={() =>
                    setValues(v => ({...v, replyParentMessage: undefined}))
                  }
                  replyParentMessage={values.replyParentMessage}
                />
              )}
              <ChatFooter
                onUploadFile={handleUploadFile}
                onUploadVideo={handleUploadVideo}
                onUploadImage={handleUploadImage}
                setVisibleStickerSelector={setVisibleStickerSelector}
                text={values.content || ''}
                onChangeText={t =>
                  setValues(v => ({
                    ...v,
                    type: ChatMessageType.TEXT,
                    content: t,
                  }))
                }
                onSend={handleSubmit}
                mentionSuggestions={suggestions()}
                isLoading={isLoadingSending}
              />
            </>
          )}
        </KeyboardAvoidingView>
      ) : (
        <>
          <KeyboardAwareFlatList
            innerRef={ref => (messageAndroidRef.current.flatListRef = ref)}
            refreshing={true}
            style={chatStyles.flatlist}
            ListHeaderComponent={
              <>
                {loadingMessages && fetchingMessages ? (
                  <ActivityIndicator />
                ) : null}
              </>
            }
            contentContainerStyle={chatStyles.flatlistContent}
            inverted
            data={messages}
            onScrollToIndexFailed={info => {
              setRenderMessageIndex(info.index);
            }}
            onEndReached={() => onScrollTopOnChat()}
            keyExtractor={item => item.id.toString()}
            renderItem={({item: message, index}) =>
              renderMessage(message, index)
            }
          />
          {reactionTarget ? (
            reactionSelector
          ) : visibleStickerSelctor ? (
            stickerSelector
          ) : (
            <>
              {values.replyParentMessage && (
                <ReplyTarget
                  onPressCloseIcon={() =>
                    setValues(v => ({...v, replyParentMessage: undefined}))
                  }
                  replyParentMessage={values.replyParentMessage}
                />
              )}
              <ChatFooter
                onUploadFile={handleUploadFile}
                onUploadVideo={handleUploadVideo}
                onUploadImage={handleUploadImage}
                setVisibleStickerSelector={setVisibleStickerSelector}
                text={values.content || ''}
                onChangeText={t =>
                  setValues(v => ({
                    ...v,
                    type: ChatMessageType.TEXT,
                    content: t,
                  }))
                }
                onSend={handleSubmit}
                mentionSuggestions={suggestions()}
                isLoading={isLoadingSending}
              />
            </>
          )}
        </>
      )}
    </>
  );

  useFocusEffect(
    useCallback(() => {
      console.log('----0000333-3-3-3-', room);

      const jsonMessagesInStorage = storage.getString(
        `messagesIntRoom${room.id}`,
      );
      const dateRefetchLatest = storage.getString(
        `dateRefetchLatestInRoom${room.id}`,
      );
      let messagesInStorageLength;
      if (jsonMessagesInStorage) {
        const messagesInStorage = JSON.parse(jsonMessagesInStorage);
        setMessages(messagesInStorage);
        messagesInStorageLength = messagesInStorage?.length;
        console.log(
          'refetch updated messages ========================',
          dateRefetchLatest,
        );
      }
      refetchUpdatedMessages({
        group: room.id,
        limit: messagesInStorageLength ? undefined : 20,
        dateRefetchLatest: dateRefetchLatest,
      });

      // refetchLatest();
      refetchRoomDetail();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refetchRoomDetail]),
  );

  const [appState, setAppState] = useState<AppStateStatus>();
  useEffect(() => {
    const unsubscribeAppState = () => {
      AppState.addEventListener('change', state => {
        setAppState(state);
      });
    };
    return () => {
      unsubscribeAppState();
    };
  });

  useEffect(() => {
    if (appState === 'active' && isFocused) {
      saveLastReadChatTime(room.id, {
        onSuccess: () => {
          socket.emit('readReport', {
            room: room.id.toString(),
            senderId: myself?.id,
          });
          handleEnterRoom(room.id);
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appState, isFocused]);

  useEffect(() => {
    saveLastReadChatTime(room.id, {
      onSuccess: () => {
        socket.emit('readReport', {
          room: room.id.toString(),
          senderId: myself?.id,
        });
        handleEnterRoom(room.id);
      },
    });
    return () => saveLastReadChatTime(room.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.id, saveLastReadChatTime]);

  const readUserBox = (user: User) => (
    <View style={tailwind('flex-row bg-white items-center px-4 py-2')}>
      <>
        <Div mr={'sm'}>
          <UserAvatar
            user={user}
            h={64}
            w={64}
            onPress={() => {
              setSelectedMessageForCheckLastRead(undefined);
              navigation.navigate('UsersStack', {
                screen: 'AccountDetail',
                params: {id: user?.id},
              });
            }}
          />
        </Div>
        <Text fontSize={18}>{userNameFactory(user)}</Text>
      </>
    </View>
  );

  const inviteCall = async () => {
    if (roomDetail?.members?.length === 2 && myself) {
      const callee =
        roomDetail.members[0].id === myself.id
          ? roomDetail.members[1]
          : roomDetail.members[0];
      //第一引数に通話を書ける人のユーザーオブジェクト、第二引数に通話をかけられるひとのユーザーオブジェクト
      await sendCallInvitation(myself, callee);
    }
  };

  const removeCache = () => {
    storage.delete(`messagesIntRoom${room.id}`);
    setMessages([]);
    refetchFetchedPastMessages();
  };

  return (
    <WholeContainer>
      {typeDropdown}
      <ReactionsModal
        isVisible={!!selectedReactions}
        selectedReactions={selectedReactions}
        selectedEmoji={selectedEmoji}
        onPressCloseButton={() => {
          setSelectedReactions(undefined);
        }}
        onPressEmoji={emoji => setSelectedEmoji(emoji)}
      />
      <MagnusModal isVisible={!!video} bg="black">
        <TouchableOpacity
          style={chatStyles.cancelIcon}
          onPress={() => {
            setVideo('');
          }}>
          <Icon
            position="absolute"
            name={'cancel'}
            fontFamily="MaterialIcons"
            fontSize={30}
            color="#fff"
          />
        </TouchableOpacity>
        <VideoPlayer
          video={{
            uri: video,
          }}
          autoplay
          videoWidth={windowWidth}
        />
        <TouchableOpacity
          style={tailwind('absolute bottom-5 right-5')}
          onPress={async () =>
            await saveToCameraRoll({url: video, type: 'video'})
          }>
          <Icon color="white" name="download" fontSize={24} />
        </TouchableOpacity>
      </MagnusModal>

      <MagnusModal isVisible={!!selectedMessageForCheckLastRead}>
        <Button
          bg="gray400"
          h={35}
          w={35}
          right={15}
          alignSelf="flex-end"
          rounded="circle"
          onPress={() => {
            setSelectedMessageForCheckLastRead(undefined);
          }}>
          <Icon color="black" name="close" />
        </Button>
        <TopTab.Navigator initialRouteName={'ReadUsers'}>
          <TopTab.Screen
            name="ReadUsers"
            children={() =>
              selectedMessageForCheckLastRead ? (
                <FlatList
                  data={readUsers(selectedMessageForCheckLastRead)}
                  keyExtractor={item => item.id.toString()}
                  renderItem={({item}) => readUserBox(item)}
                />
              ) : (
                <></>
              )
            }
            options={{title: '既読'}}
          />
          <TopTab.Screen
            name="UnReadUsers"
            children={() =>
              selectedMessageForCheckLastRead ? (
                <FlatList
                  data={roomDetail?.members?.filter(
                    existMembers =>
                      !readUsers(selectedMessageForCheckLastRead)
                        .map(u => u.id)
                        .includes(existMembers.id),
                  )}
                  keyExtractor={item => item.id.toString()}
                  renderItem={({item}) => readUserBox(item)}
                />
              ) : (
                <FlatList
                  data={roomDetail?.members}
                  keyExtractor={item => item.id.toString()}
                  renderItem={({item}) => readUserBox(item)}
                />
              )
            }
            options={{title: '未読'}}
          />
        </TopTab.Navigator>
      </MagnusModal>

      <ImageView
        animationType="slide"
        images={imagesForViewing}
        imageIndex={nowImageIndex === -1 ? 0 : nowImageIndex}
        visible={imageModal}
        onRequestClose={() => setImageModal(false)}
        swipeToCloseEnabled={false}
        doubleTapToZoomEnabled={true}
        FooterComponent={({imageIndex}) => (
          <Div position="absolute" bottom={5} right={5}>
            <DownloadIcon url={imagesForViewing[imageIndex].uri} />
          </Div>
        )}
      />
      <HeaderTemplate
        title={roomDetail ? nameOfRoom(roomDetail, myself) : nameOfRoom(room)}
        enableBackButton={true}
        screenForBack={'RoomList'}>
        <Div style={tailwind('flex flex-row')}>
          <TouchableOpacity
            style={tailwind('flex flex-row mr-1')}
            onPress={() => setVisibleSearchInput(true)}>
            <Icon
              name="search"
              fontFamily="Feather"
              fontSize={26}
              color={darkFontColor}
            />
          </TouchableOpacity>

          {roomDetail?.members && roomDetail.members.length < 3 ? (
            <Div mt={-4} mr={-4} style={tailwind('flex flex-row ')}>
              <Button
                bg="transparent"
                pb={-3}
                onPress={() => {
                  Alert.alert('通話しますか？', undefined, [
                    {
                      text: 'はい',
                      onPress: () => inviteCall(),
                    },
                    {
                      text: 'いいえ',
                      onPress: () => {},
                    },
                  ]);
                }}>
                <Icon
                  name="call-outline"
                  fontFamily="Ionicons"
                  fontSize={25}
                  color="gray700"
                />
              </Button>
            </Div>
          ) : null}

          <TouchableOpacity
            style={tailwind('flex flex-row')}
            onPress={() =>
              navigation.navigate('ChatStack', {
                screen: 'ChatMenu',
                params: {room, removeCache},
              })
            }>
            <Icon
              name="dots-horizontal-circle-outline"
              fontFamily="MaterialCommunityIcons"
              fontSize={26}
              color={darkFontColor}
            />
          </TouchableOpacity>
        </Div>
      </HeaderTemplate>

      {visibleSearchInput && (
        <Div>
          <Div style={tailwind('flex flex-row')}>
            <Input
              placeholder="メッセージを検索"
              w={'70%'}
              value={inputtedSearchWord}
              onChangeText={text => {
                setInputtedSearchWord(text);
                searchMessages();
              }}
            />
            <Div
              style={tailwind('flex flex-row justify-between m-1')}
              w={'25%'}>
              <TouchableOpacity
                style={tailwind('flex flex-row')}
                onPress={() => {
                  !renderMessageIndex &&
                    setFocusedMessageID(nextFocusIndex('prev'));
                }}>
                <Icon name="arrow-up" fontFamily="FontAwesome" fontSize={25} />
              </TouchableOpacity>
              <TouchableOpacity
                style={tailwind('flex flex-row')}
                onPress={() => {
                  !renderMessageIndex &&
                    setFocusedMessageID(nextFocusIndex('next'));
                }}>
                <Icon
                  name="arrow-down"
                  fontFamily="FontAwesome"
                  fontSize={25}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={tailwind('flex flex-row')}
                onPress={() => setVisibleSearchInput(false)}>
                <Icon name="close" fontFamily="FontAwesome" fontSize={25} />
              </TouchableOpacity>
            </Div>
          </Div>
          {inputtedSearchWord !== '' && (
            <Div h={40} alignItems={'center'} justifyContent={'center'}>
              {renderMessageIndex ? (
                <ActivityIndicator />
              ) : (
                <Text color="black">{`${countOfSearchWord} / ${
                  searchedResults?.length || 0
                }`}</Text>
              )}
            </Div>
          )}
        </Div>
      )}
      {messageListAvoidngKeyboardDisturb}
    </WholeContainer>
  );
};

export default Chat;
