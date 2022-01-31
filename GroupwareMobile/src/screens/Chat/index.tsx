import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Alert,
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
} from 'react-native-magnus';
import WholeContainer from '../../components/WholeContainer';
import {useAPIGetMessages} from '../../hooks/api/chat/useAPIGetMessages';
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
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {
  ChatNavigationProps,
  ChatRouteProps,
} from '../../types/navigator/drawerScreenProps';
import {useFormik} from 'formik';
import ReplyTarget from '../../components/chat/ChatFooter/ReplyTarget';
import HeaderWithIconButton from '../../components/Header/HeaderWithIconButton';
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
import {useAPIGetRoomDetail} from '../../hooks/api/chat/useAPIGetRoomDetail';
import {chatMessageSchema} from '../../utils/validation/schema';
import {reactionEmojis} from '../../utils/factory/reactionEmojis';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import io from 'socket.io-client';
import {baseURL} from '../../utils/url';
import {getThumbnailOfVideo} from '../../utils/getThumbnailOfVideo';
import {useAuthenticate} from '../../contexts/useAuthenticate';

const socket = io(baseURL, {
  transports: ['websocket'],
});

const TopTab = createMaterialTopTabNavigator();

const Chat: React.FC = () => {
  const {user: myself} = useAuthenticate();
  const typeDropdownRef = useRef<any | null>(null);
  const navigation = useNavigation<ChatNavigationProps>();
  const route = useRoute<ChatRouteProps>();
  const {room} = route.params;
  const {data: roomDetail, refetch: refetchRoomDetail} = useAPIGetRoomDetail(
    room.id,
  );
  const [page, setPage] = useState(1);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [imageModal, setImageModal] = useState(false);
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
  const {data: lastReadChatTime} = useAPIGetLastReadChatTime(room.id);
  const [longPressedMsg, setLongPressedMgg] = useState<ChatMessage>();
  const [reactionTarget, setReactionTarget] = useState<ChatMessage>();
  const {mutate: saveReaction} = useAPISaveReaction();
  const {width: windowWidth, height: windowHeight} = useWindowDimensions();
  const {mutate: deleteReaction} = useAPIDeleteReaction();
  const [selectedReactions, setSelectedReactions] = useState<
    ChatMessageReaction[] | undefined
  >();
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
    data: fetchedPastMessages,
    isLoading: loadingMessages,
    isFetching: fetchingMessages,
  } = useAPIGetMessages({
    group: room.id,
    page: page.toString(),
  });
  const suggestions = (): Suggestion[] => {
    if (!room.members) {
      return [];
    }
    return room.members
      ?.filter(member => member.id !== myself?.id)
      .map(m => ({
        id: m.id.toString(),
        name: userNameFactory(m) + 'さん',
      }));
  };
  const {refetch: refetchLatest} = useAPIGetMessages(
    {
      group: room.id,
      page: '1',
    },
    {
      enabled: false,
      onSuccess: latestData => {
        if (latestData?.length) {
          const msgToAppend: ChatMessage[] = [];
          const imagesToApped: ImageSource[] = [];
          for (const latest of latestData) {
            if (!messages?.length || isRecent(latest, messages?.[0])) {
              msgToAppend.push(latest);
              if (latest.type === ChatMessageType.IMAGE) {
                imagesToApped.unshift({uri: latest.content});
              }
            }
          }
          setMessages(m => [...msgToAppend, ...m]);
          // setImagesForViewing(i => [...i, ...imagesToApped]);
        }
      },
    },
  );
  const {mutate: sendChatMessage, isLoading: loadingSendMessage} =
    useAPISendChatMessage({
      onSuccess: sentMsg => {
        socket.emit('message', {...sentMsg, isSender: false});
        setMessages([sentMsg, ...messages]);
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
  const headerRightIcon = (
    <TouchableOpacity
      style={tailwind('flex flex-row items-center')}
      onPress={() =>
        navigation.navigate('ChatStack', {screen: 'ChatMenu', params: {room}})
      }>
      <Icon
        name="dots-horizontal-circle-outline"
        fontFamily="MaterialCommunityIcons"
        fontSize={26}
        color={darkFontColor}
      />
    </TouchableOpacity>
  );

  const handleDeleteReaction = (
    reaction: ChatMessageReaction,
    target: ChatMessage,
  ) => {
    deleteReaction(reaction, {
      onSuccess: reactionId => {
        setMessages(m => {
          return m.map(eachMessage => {
            if (eachMessage.id === target.id) {
              return {
                ...eachMessage,
                reactions: eachMessage.reactions?.filter(
                  r => r.id !== reactionId,
                ),
              };
            }
            return eachMessage;
          });
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
        setMessages(m => {
          return m.map(eachMessage => {
            if (eachMessage.id === savedReaction.chatMessage?.id) {
              return {
                ...eachMessage,
                reactions: eachMessage.reactions?.length
                  ? [...eachMessage.reactions, reactionAdded]
                  : [reactionAdded],
              };
            }
            return eachMessage;
          });
        });
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
    console.log(res);
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

  const playVideoOnModal = (url: string) => {
    setVideo(url);
  };

  const onEndReached = () => {
    if (fetchedPastMessages?.length) {
      setPage(p => p + 1);
    }
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
    </Dropdown>
  );

  useEffect(() => {
    if (longPressedMsg) {
      typeDropdownRef.current?.open();
    }
  }, [longPressedMsg]);

  useEffect(() => {
    socket.emit('joinRoom', room.id.toString());
    socket.on('msgToClient', async (sentMsgByOtherUsers: ChatMessage) => {
      if (sentMsgByOtherUsers.content) {
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
        setMessages(m => {
          if (m[0].id !== sentMsgByOtherUsers.id) {
            return [sentMsgByOtherUsers, ...m];
          }
          return m;
        });
      }
    });

    socket.on('joinedRoom', (r: any) => {
      console.log('joinedRoom', r);
    });

    socket.on('leftRoom', (r: any) => {
      console.log('leftRoom', r);
    });
    return () => {
      socket.emit('leaveRoom', room.id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.id]);

  useEffect(() => {
    if (fetchedPastMessages?.length) {
      if (
        messages?.length &&
        isRecent(
          messages[messages.length - 1],
          fetchedPastMessages[fetchedPastMessages.length - 1],
        )
      ) {
        const msgToAppend: ChatMessage[] = [];
        for (const sentMsg of fetchedPastMessages) {
          if (isRecent(messages[messages.length - 1], sentMsg)) {
            msgToAppend.push(sentMsg);
          }
        }
        setMessages(m => {
          return [...m, ...msgToAppend];
        });
      } else if (!messages?.length) {
        setMessages(fetchedPastMessages);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchedPastMessages]);
  const readUsers = (targetMsg: ChatMessage) => {
    return lastReadChatTime
      ? lastReadChatTime
          .filter(t => t.readTime >= targetMsg.createdAt)
          .map(t => t.user)
      : [];
  };

  const renderMessage = (message: ChatMessage) => (
    <Div mb={'sm'} mx="md">
      <ChatMessageItem
        message={message}
        readUsers={readUsers(message)}
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

  const messageListAvoidngKeyboardDisturb = (
    <>
      {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView
          keyboardVerticalOffset={windowHeight * 0.08}
          style={chatStyles.keyboardAvoidingViewIOS}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {loadingMessages && fetchingMessages ? <ActivityIndicator /> : null}
          <FlatList
            style={chatStyles.flatlist}
            inverted
            data={messages}
            {...{onEndReached}}
            renderItem={({item: message}) => renderMessage(message)}
          />
          {reactionTarget ? (
            reactionSelector
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
            {...{onEndReached}}
            keyExtractor={item => item.id.toString()}
            renderItem={({item: message}) => renderMessage(message)}
          />
          {reactionTarget ? (
            reactionSelector
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
      refetchLatest();
      refetchRoomDetail();
    }, [refetchLatest, refetchRoomDetail]),
  );

  useEffect(() => {
    saveLastReadChatTime(room.id);
    return () => saveLastReadChatTime(room.id);
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
      <HeaderWithIconButton
        title={roomDetail ? nameOfRoom(roomDetail) : nameOfRoom(room)}
        enableBackButton={true}
        screenForBack={'RoomList'}
        icon={headerRightIcon}
      />
      {messageListAvoidngKeyboardDisturb}
    </WholeContainer>
  );
};

export default Chat;
