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
  Box,
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
  FIleSource,
  RoomType,
  SocketMessage,
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
import {baseURL, storage} from '../../utils/url';
import {useAuthenticate} from '../../contexts/useAuthenticate';
import {useInviteCall} from '../../contexts/call/useInviteCall';
import {reactionStickers} from '../../utils/factory/reactionStickers';
import Video from 'react-native-video';
import {ScrollView} from 'react-native-gesture-handler';
import ChatShareIcon from '../../components/common/ChatShareIcon';
import {getFileUrl} from '../../utils/storage/getFileUrl';
import {useHandleBadge} from '../../contexts/badge/useHandleBadge';
import {useIsTabBarVisible} from '../../contexts/bottomTab/useIsTabBarVisible';
import Clipboard from '@react-native-community/clipboard';
import {dateTimeFormatterFromJSDDate} from '../../utils/dateTimeFormatterFromJSDate';
import {useAPIGetUpdatedMessages} from '../../hooks/api/chat/useAPIGetUpdatedMessages';
import {useAPIGetExpiredUrlMessages} from '../../hooks/api/chat/useAPIGetExpiredUrlMessages';
import {useChatSocket} from '../../utils/socket';
import {useAPIUpdateChatMessage} from '../../hooks/api/chat/useAPIUpdateChatMessage';
import {useAPIDeleteChatMessage} from '../../hooks/api/chat/useAPIDeleteChatMessage';
import uuid from 'react-native-uuid';
import {useAPIGetReactions} from '../../hooks/api/chat/useAPIGetReactions';

const TopTab = createMaterialTopTabNavigator();

const Chat: React.FC = () => {
  const {user: myself} = useAuthenticate();
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
    Number(room.id),
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
  const imagesForViewing: FIleSource[] = useMemo(() => {
    return messages
      .filter(m => m.type === ChatMessageType.IMAGE)
      .map(m => ({
        uri: m.content,
        fileName: m.fileName,
      }))
      .reverse();
  }, [messages]);
  const [nowImageIndex, setNowImageIndex] = useState<number>(0);
  const [video, setVideo] = useState<FIleSource>();
  const [longPressedMsg, setLongPressedMgg] = useState<ChatMessage>();
  const [reactionTarget, setReactionTarget] = useState<ChatMessage>();
  const [visibleStickerSelctor, setVisibleStickerSelector] = useState(false);
  const [editMessage, setEditMessage] = useState(false);
  const {mutate: saveReaction} = useAPISaveReaction();
  const {width: windowWidth, height: windowHeight} = useWindowDimensions();
  const [footerHeight, setFooterHeight] = useState(0);
  const {mutate: deleteReaction} = useAPIDeleteReaction();
  const [selectedReactions, setSelectedReactions] = useState<
    ChatMessageReaction[] | undefined
  >();
  const {handleEnterRoom, refetchRoomCard} = useHandleBadge();
  const [selectedEmoji, setSelectedEmoji] = useState<string>();
  const [selectedMessageForCheckLastRead, setSelectedMessageForCheckLastRead] =
    useState<ChatMessage>();
  const [appState, setAppState] = useState<AppStateStatus>('active');

  const refreshMessage = (targetMessages: ChatMessage[]): ChatMessage[] => {
    const arrayIncludesDuplicate = [...messages, ...targetMessages];
    return arrayIncludesDuplicate
      .filter((value, index, self) => {
        return index === self.findIndex(m => m.id === value.id);
      })
      .sort((a, b) => b.id - a.id);
  };
  const socket = useChatSocket(
    roomDetail ? roomDetail : {...room, id: Number(room.id)},
    refreshMessage,
    setMessages,
  );
  const messageContentRef = useRef('');

  const {values, handleSubmit, setValues, resetForm} = useFormik<
    Partial<ChatMessage>
  >({
    initialValues: {
      content: '',
      type: ChatMessageType.TEXT,
      replyParentMessage: null,
      chatGroup: roomDetail ? roomDetail : {...room, id: Number(room.id)},
    },
    enableReinitialize: true,
    onSubmit: submittedValues => {
      setValues(v => ({...v, content: messageContentRef.current}));
      if (messageContentRef.current) {
        if (editMessage) {
          updateChatMessage({
            ...submittedValues,
            content: messageContentRef.current,
          });
        } else {
          sendChatMessage({
            ...submittedValues,
            content: messageContentRef.current,
          });
        }
        // Keyboard.dismiss();
      }
    },
  });
  const {
    isLoading: loadingMessages,
    isFetching: fetchingMessages,
    refetch: refetchFetchedPastMessages,
  } = useAPIGetMessages(
    {
      group: Number(room.id),
      limit: 20,
      after,
      before,
      include,
    },
    {
      enabled: false,
      onSuccess: res => {
        console.log('refetchFetchedPastMessages called', res?.length);
        if (res?.length) {
          const refreshedMessage = refreshMessage(res);
          // if (refreshedMessage.length) {
          //   saveMessages(refreshedMessage.slice(0, 20));
          // }
          // console.log('refreshMessage =============', refreshedMessage.length);
          setMessages(refreshedMessage);
          if (!messages.filter(m => m.id === res[0].id)?.length) {
            refetchDoesntExistMessages(res[res.length - 1].id);
          } else {
            setAfter(undefined);
            setInclude(false);
            setBefore(undefined);
          }
        }
      },
    },
  );

  const {refetch: getExpiredUrlMessages} = useAPIGetExpiredUrlMessages(
    Number(room.id),
    {
      onSuccess: data => {
        setMessages(mgs => {
          return mgs.map(m => {
            for (const d of data) {
              if (d.id === m.id) {
                m.content = d.content;
              }
            }
            return m;
          });
        });
      },
    },
  );

  const {data: searchedResults, refetch: searchMessages} = useAPISearchMessages(
    {
      group: Number(room.id),
      word: inputtedSearchWord,
    },
  );
  const suggestions = (): Suggestion[] => {
    if (!roomDetail?.members) {
      return [];
    }
    const users =
      roomDetail?.members
        ?.filter(u => u.id !== myself?.id)
        .map(u => ({
          id: `${u.id}`,
          name: userNameFactory(u) + 'さん',
        })) || [];
    const allTag = {id: '0', name: 'all'};
    users.unshift(allTag);
    return users;
  };

  const {mutate: refetchUpdatedMessages} = useAPIGetUpdatedMessages({
    onSuccess: latestData => {
      if (appState === 'active') {
        if (latestData?.length) {
          // const msgToAppend: ChatMessage[] = [];
          // const imagesToApped: FIleSource[] = [];
          // for (const latest of latestData) {
          //   if (!messages?.length || isRecent(latest, messages?.[0])) {
          //     msgToAppend.push(latest);
          //     if (latest.type === ChatMessageType.IMAGE) {
          //       imagesToApped.unshift({
          //         uri: latest.content,
          //         fileName: latest.fileName,
          //       });
          //     }
          //   }
          // }
          // setMessages(m => refreshMessage([...msgToAppend, ...m]));
          const now = dateTimeFormatterFromJSDDate({
            dateTime: new Date(),
            format: 'yyyy-LL-dd HH:mm:ss',
          });
          storage.set(
            `dateRefetchLatestInRoom${room.id}user${myself?.id}`,
            now,
          );
          socket.saveLastReadTimeAndReport();
          setMessages(m => {
            const updatedMessages = refreshMessage([...latestData, ...m]);
            return updatedMessages;
          });
        }
      }
    },
  });

  const {mutate: getReactions} = useAPIGetReactions({
    onSuccess: res => {
      setSelectedReactions(res);
    },
  });

  const {mutate: sendChatMessage, isLoading: loadingSendMessage} =
    useAPISendChatMessage({
      onSuccess: sentMsg => {
        socket.send({chatMessage: sentMsg, type: 'send'});
        setMessages(msg => refreshMessage([sentMsg, ...msg]));
        if (sentMsg?.chatGroup?.id) {
          refetchRoomCard({id: sentMsg.chatGroup.id, type: ''});
        }
        if (sentMsg.type === ChatMessageType.TEXT) {
          // setValues(v => ({...v, content: ''}));
          resetForm();
        }
      },
      onError: () => {
        Alert.alert(
          'チャットの送信中にエラーが発生しました。\n時間をおいて再度実行してください。',
        );
      },
    });

  const {mutate: updateChatMessage} = useAPIUpdateChatMessage({
    onSuccess: sentMsg => {
      socket.send({
        type: 'edit',
        chatMessage: {...sentMsg, isSender: false},
      });
      resetForm();
      setLongPressedMgg(undefined);
      setEditMessage(false);
    },
    onError: () => {
      Alert.alert(
        'チャットの更新中にエラーが発生しました。\n時間をおいて再度実行してください。',
      );
    },
  });

  const {mutate: deleteMessage} = useAPIDeleteChatMessage();

  const {mutate: uploadFile, isLoading: loadingUploadFile} =
    useAPIUploadStorage();
  const isLoadingSending = loadingSendMessage || loadingUploadFile;

  const showImageOnModal = (url: string) => {
    const isNowUri = (element: FIleSource) => element.uri === url;
    setNowImageIndex(imagesForViewing.findIndex(isNowUri));
    setImageModal(true);
  };

  const handleDeleteReaction = (
    reaction: ChatMessageReaction,
    target: ChatMessage,
  ) => {
    const reactionSentMyself = target.reactions?.filter(
      r => r.emoji === reaction.emoji && r.isSender,
    )[0];
    deleteReaction(reactionSentMyself || reaction, {
      onSuccess: reactionId => {
        setMessages(m => {
          return refreshMessage(
            m.map(eachMessage => {
              if (eachMessage.id === target.id) {
                const message = {
                  ...eachMessage,
                  reactions: eachMessage.reactions?.filter(
                    r => r.id !== reactionId,
                  ),
                };
                socket.send({type: 'edit', chatMessage: message});
                return message;
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
              const message = {
                ...eachMessage,
                reactions: eachMessage.reactions?.length
                  ? [...eachMessage.reactions, reactionAdded]
                  : [reactionAdded],
              };
              socket.send({type: 'edit', chatMessage: message});
              return message;
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

  const handleUploadImage = async (useCamera: boolean) => {
    const {formData, fileName} = await uploadImageFromGallery(
      {
        mediaType: 'photo',
        cropping: false,
        multiple: true,
      },
      useCamera,
    );
    if (formData) {
      uploadFile(formData, {
        onSuccess: async imageURLs => {
          for (let i = 0; i < imageURLs.length; i++) {
            sendChatMessage({
              content: imageURLs[i],
              fileName: fileName?.[i] ? fileName[i] : uuid.v4() + '.png',
              type: ChatMessageType.IMAGE,
              chatGroup: roomDetail
                ? roomDetail
                : {...room, id: Number(room.id)},
            });
            await new Promise(r => setTimeout(r, 100));
          }
        },
      });
    }
  };

  const handleUploadVideo = async () => {
    const {formData, fileName} = await uploadImageFromGallery({
      mediaType: 'video',
      multiple: true,
    });
    if (formData) {
      uploadFile(formData, {
        onSuccess: imageURLs => {
          for (let i = 0; i < imageURLs.length; i++) {
            sendChatMessage({
              content: imageURLs[i],
              fileName: fileName?.[i] ? fileName[i] : uuid.v4() + '.mp4',
              type: ChatMessageType.VIDEO,
              chatGroup: roomDetail
                ? roomDetail
                : {...room, id: Number(room.id)},
            });
          }
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
    ('content://com.android.providers.media.documents/document/image%3A77');
    const res = await DocumentPicker.pickSingle({
      type: [DocumentPicker.types.allFiles],
    });
    const formData = new FormData();

    formData.append('files', {
      name: res.name,
      uri: Platform.OS === 'ios' ? normalizeURL(res.uri) : res.uri,
      type: res.type,
    });
    if (formData) {
      uploadFile(formData, {
        onSuccess: imageURL => {
          Alert.alert('', `『${res.name}』を送信しますか？`, [
            {
              text: 'キャンセル',
              style: 'cancel',
            },
            {
              text: '送信',
              onPress: () => {
                sendChatMessage({
                  content: imageURL[0],
                  fileName: res.name,
                  type: ChatMessageType.OTHER_FILE,
                  chatGroup: roomDetail
                    ? roomDetail
                    : {...room, id: Number(room.id)},
                });
              },
            },
          ]);
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
      chatGroup: roomDetail ? roomDetail : {...room, id: Number(room.id)},
    });
    setVisibleStickerSelector(false);
  };

  const playVideoOnModal = async (data: FIleSource) => {
    if (!data.createdUrl) {
      const url = await getFileUrl(data.fileName.replace(/\s+/g, ''), data.uri);
      if (url) {
        data.createdUrl = url;
      }
    }
    setVideo(data);
  };

  const onScrollTopOnChat = () => {
    if (messages.length >= 20) {
      setBefore(messages[messages.length - 1].id);
    }
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
    if (!messages?.length) {
      return;
    }
    const isExist = messages.filter(m => m.id === focused)?.length;

    if (!isExist) {
      setAfter(focused ? focused : 0);
      setInclude(true);
      return true;
    } else {
      setInclude(false);
      return false;
    }
  };

  const saveMessages = (msg: ChatMessage[]) => {
    const jsonMessages = JSON.stringify(msg);
    storage.set(`messagesIntRoom${room.id}user${myself?.id}`, jsonMessages);
  };

  // useEffect(() => {
  //   setBefore(undefined);
  //   setAfter(undefined);
  // }, [room]);

  useEffect(() => {
    if (before || after) {
      refetchFetchedPastMessages();
    }
  }, [before, after, refetchFetchedPastMessages]);

  useEffect(() => {
    if (messages.length) {
      saveMessages(messages.slice(0, 20));
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
      refetchDoesntExistMessages(focusedMessageID);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedMessageID]);

  const handleDeleteMessage = () => {
    if (longPressedMsg) {
      Alert.alert(
        'メッセージを削除してよろしいですか？',
        '',
        [
          {text: 'キャンセル', style: 'cancel'},
          {
            text: '削除する',
            style: 'destructive',
            onPress: () =>
              deleteMessage(longPressedMsg, {
                onSuccess: () => {
                  socket.send({
                    type: 'delete',
                    chatMessage: longPressedMsg,
                  });
                  setLongPressedMgg(undefined);
                },
              }),
          },
        ],
        {cancelable: false},
      );
    }
  };

  const isBeforeTwelveHours = (createdAt: Date | undefined) => {
    if (!createdAt) {
      return false;
    }
    const date = new Date();
    date.setHours(date.getHours() - 12);

    return new Date(createdAt) > date;
  };

  const senderAvatars = useMemo(() => {
    return roomDetail?.members?.map(m => ({
      id: m.id,
      avatar: <UserAvatar h={40} w={40} user={m} />,
    }));
  }, [roomDetail?.members]);

  const typeDropdown = (
    <Dropdown
      {...defaultDropdownProps}
      title="アクションを選択"
      onBackdropPress={() => {
        typeDropdownRef.current?.close();
        setLongPressedMgg(undefined);
      }}
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
      {longPressedMsg?.sender?.id === myself?.id &&
      longPressedMsg?.type === ChatMessageType.TEXT &&
      isBeforeTwelveHours(longPressedMsg.createdAt) ? (
        <Dropdown.Option
          {...defaultDropdownOptionProps}
          value="edit"
          onPress={() => {
            setEditMessage(true);
            if (longPressedMsg) {
              console.log('edit message', longPressedMsg);

              setValues(longPressedMsg);
              messageContentRef.current = longPressedMsg.content;
            }
          }}>
          メッセージを編集
        </Dropdown.Option>
      ) : (
        <></>
      )}
      {longPressedMsg?.sender?.id === myself?.id &&
      isBeforeTwelveHours(longPressedMsg?.createdAt) ? (
        <Dropdown.Option
          {...defaultDropdownOptionProps}
          value="edit"
          color="red"
          onPress={() => handleDeleteMessage()}>
          メッセージを削除
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
    socket.joinRoom();
    refetchFetchedPastMessages();
    return () => {
      // saveMessages();
      socket.leaveRoom();
      setBefore(undefined);
      setAfter(undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.id]);

  const handleRefetchUpdatedMessages = useCallback(
    (messagesInStorageLength?: number) => {
      const dateRefetchLatest = storage.getString(
        `dateRefetchLatestInRoom${room.id}user${myself?.id}`,
      );
      refetchUpdatedMessages({
        group: Number(room.id),
        limit: messagesInStorageLength ? undefined : 20,
        dateRefetchLatest: dateRefetchLatest,
      });
    },
    [room.id, myself?.id, refetchUpdatedMessages],
  );

  useEffect(() => {
    if (!messages.length) {
      const jsonMessagesInStorage = storage.getString(
        `messagesIntRoom${room.id}user${myself?.id}`,
      );

      let messagesInStorageLength;
      if (jsonMessagesInStorage) {
        const messagesInStorage = JSON.parse(jsonMessagesInStorage);
        if (messagesInStorage?.length) {
          setMessages(messagesInStorage);
        }
        messagesInStorageLength = messagesInStorage?.length;
        getExpiredUrlMessages();
      }
      const now = dateTimeFormatterFromJSDDate({
        dateTime: new Date(),
        format: 'yyyy-LL-dd HH:mm:ss',
      });
      storage.set(`dateRefetchLatestInRoom${room.id}`, now);
      handleRefetchUpdatedMessages(messagesInStorageLength);
      handleEnterRoom(Number(room.id));
      // refetchLatest();
      refetchRoomDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const readUsers = useCallback(
    (targetMsg: ChatMessage) => {
      return socket.lastReadChatTime
        ? socket.lastReadChatTime
            .filter(
              t =>
                new Date(t.readTime) >= new Date(targetMsg.createdAt) &&
                t.user.id !== targetMsg?.sender?.id,
            )
            .map(t => t.user)
        : [];
    },
    [socket.lastReadChatTime],
  );
  const unReadUsers = useCallback(
    (targetMsg: ChatMessage) => {
      const unreadUsers = roomDetail?.members?.filter(
        existMembers =>
          !readUsers(targetMsg)
            .map(u => u.id)
            .includes(existMembers.id),
      );
      return unreadUsers?.filter(u => u.id !== targetMsg?.sender?.id);
    },
    [readUsers, roomDetail?.members],
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
        senderAvatar={
          senderAvatars?.find(s => s.id === message.sender?.id)?.avatar
        }
        message={message}
        readUsers={readUsers(message)}
        inputtedSearchWord={inputtedSearchWord}
        searchedResultIds={searchedResults?.map(s => s.id)}
        messageIndex={messageIndex}
        scrollToTarget={scrollToTarget}
        isScrollTarget={focusedMessageID === message.id}
        onCheckLastRead={() => setSelectedMessageForCheckLastRead(message)}
        // numbersOfRead={numbersOfRead(message)}
        onLongPress={() => setLongPressedMgg(message)}
        onPressImage={() => showImageOnModal(message.content)}
        onPressVideo={() => {
          console.log(message.fileName);
          playVideoOnModal({
            uri: message.content,
            fileName: message.fileName,
          });
        }}
        onPressReaction={(r, isSender) =>
          isSender
            ? handleDeleteReaction(r, message)
            : handleSaveReaction(r.emoji, message)
        }
        onLongPressReation={() => {
          if (message.reactions?.length && message.isSender) {
            getReactions(message.id);
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
        <View style={tailwind('h-52 flex flex-wrap')}>
          {reactionStickers.map(e => (
            <TouchableOpacity
              key={e.name}
              onPress={() => handleStickerSelected(e.name)}>
              <Image
                source={e.src}
                style={tailwind('overflow-visible h-20 w-20 m-2.5')}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </Div>
  );

  const renderItem = ({item, index}: {item: ChatMessage; index: number}) => {
    return renderMessage(item, index);
  };
  const keyExtractor = useCallback(item => {
    if (item.id) {
      return item.id.toString();
    }
  }, []);

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
            windowSize={20}
            onEndReached={onScrollTopOnChat}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
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
              <Div
                onLayout={({nativeEvent}) => {
                  setFooterHeight(nativeEvent.layout.y);
                }}
              />
              {editMessage ? (
                <Box flexDir="row" alignItems="center" bg="gray">
                  <Button
                    bg="transparent"
                    onPress={() => {
                      setEditMessage(false);
                      resetForm();
                    }}>
                    <Icon color="black" name="close" />
                  </Button>
                  <Text>メッセージ編集中</Text>
                </Box>
              ) : null}
              <ChatFooter
                onUploadFile={handleUploadFile}
                onUploadVideo={handleUploadVideo}
                onUploadImage={handleUploadImage}
                setVisibleStickerSelector={setVisibleStickerSelector}
                text={values.content}
                footerHeight={footerHeight}
                onChangeText={t => (messageContentRef.current = t)}
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
            windowSize={20}
            onEndReached={onScrollTopOnChat}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
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
              <Div
                onLayout={({nativeEvent}) => {
                  setFooterHeight(nativeEvent.layout.y);
                }}
              />
              {editMessage ? (
                <Box flexDir="row" alignItems="center" bg="gray">
                  <Button
                    bg="transparent"
                    onPress={() => {
                      setEditMessage(false);
                      resetForm();
                    }}>
                    <Icon color="black" name="close" />
                  </Button>
                  <Text>メッセージ編集中</Text>
                </Box>
              ) : null}
              <ChatFooter
                onUploadFile={handleUploadFile}
                onUploadVideo={handleUploadVideo}
                onUploadImage={handleUploadImage}
                setVisibleStickerSelector={setVisibleStickerSelector}
                text={values.content}
                footerHeight={footerHeight}
                onChangeText={t => (messageContentRef.current = t)}
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

  useEffect(() => {
    const unsubscribeAppState = () => {
      AppState.addEventListener('change', state => {
        if (appState !== 'active' && state === 'active') {
          handleRefetchUpdatedMessages();
        }
        setAppState(state);
      });
    };
    return () => {
      unsubscribeAppState();
    };
  });

  useEffect(() => {
    if (
      appState === 'active' &&
      messages.length &&
      messages[0]?.sender?.id !== myself?.id
    ) {
      socket.saveLastReadTimeAndReport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appState, messages?.[0]]);

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
    storage.delete(`messagesIntRoom${room.id}user${myself?.id}`);
    setMessages([]);
    refetchFetchedPastMessages();
  };

  return (
    <WholeContainer>
      {typeDropdown}
      <Div h="100%" bg="blue300">
        <ReactionsModal
          isVisible={!!selectedReactions}
          selectedReactions={selectedReactions}
          selectedEmoji={selectedEmoji}
          onPressCloseButton={() => {
            setSelectedReactions(undefined);
          }}
          onPressEmoji={emoji => setSelectedEmoji(emoji)}
        />
        {video?.fileName && video.uri ? (
          <MagnusModal isVisible={!!video} bg="black">
            <TouchableOpacity
              style={chatStyles.cancelIcon}
              onPress={() => {
                setVideo(undefined);
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
                uri: video?.createdUrl,
              }}
              autoplay
              videoWidth={windowWidth}
              videoHeight={windowHeight * 0.9}
            />
            <TouchableOpacity
              style={tailwind('absolute bottom-5 right-5')}
              onPress={async () =>
                await saveToCameraRoll({url: video.uri, type: 'video'})
              }>
              <Icon color="white" name="download" fontSize={24} />
            </TouchableOpacity>
            <ChatShareIcon image={video} isVideo />
          </MagnusModal>
        ) : null}

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
                    data={unReadUsers(selectedMessageForCheckLastRead)}
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
          images={imagesForViewing.map(i => {
            return {uri: i.uri};
          })}
          imageIndex={nowImageIndex === -1 ? 0 : nowImageIndex}
          visible={imageModal}
          onRequestClose={() => setImageModal(false)}
          swipeToCloseEnabled={false}
          doubleTapToZoomEnabled={true}
          FooterComponent={({imageIndex}) => (
            <Div>
              <DownloadIcon url={imagesForViewing[imageIndex].uri} />
              <ChatShareIcon image={imagesForViewing[imageIndex]} />
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

            {roomDetail?.members &&
            roomDetail.members.length === 2 &&
            roomDetail.roomType !== RoomType.GROUP ? (
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
                  params: {room: roomDetail ? roomDetail : room, removeCache},
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
                  <Icon
                    name="arrow-up"
                    fontFamily="FontAwesome"
                    fontSize={25}
                  />
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
      </Div>
    </WholeContainer>
  );
};

export default Chat;
