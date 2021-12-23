import React, {useCallback, useEffect, useRef, useState} from 'react';
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

const Chat: React.FC = () => {
  const typeDropdownRef = useRef<any | null>(null);
  const navigation = useNavigation<ChatNavigationProps>();
  const {height: windowHeight} = useWindowDimensions();
  const route = useRoute<ChatRouteProps>();
  const {room} = route.params;
  const {data: roomDetail, refetch: refetchRoomDetail} = useAPIGetRoomDetail(
    room.id,
  );
  const [page, setPage] = useState(1);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [imageModal, setImageModal] = useState(false);
  const [imagesForViewing, setImagesForViewing] = useState<ImageSource[]>([]);
  const [nowImageIndex, setNowImageIndex] = useState<number>(0);
  const [video, setVideo] = useState('');
  const {data: lastReadChatTime} = useAPIGetLastReadChatTime(room.id);
  const [longPressedMsg, setLongPressedMgg] = useState<ChatMessage>();
  const [reactionTarget, setReactionTarget] = useState<ChatMessage>();
  const {mutate: saveReaction} = useAPISaveReaction();
  const {width: windowWidth} = useWindowDimensions();
  const {mutate: deleteReaction} = useAPIDeleteReaction();
  const [deletedReactionIds, setDeletedReactionIds] = useState<number[]>([]);
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
  const {data: fetchedPastMessages, isLoading: loadingMessages} =
    useAPIGetMessages({
      group: room.id,
      page: page.toString(),
    });
  const {data: latestMessage} = useAPIGetMessages(
    {
      group: room.id,
      page: '1',
    },
    {refetchInterval: 3000},
  );
  const suggestions = (): Suggestion[] => {
    if (!room.members) {
      return [];
    }
    return room.members.map(m => ({
      id: m.id.toString(),
      name: userNameFactory(m) + 'さん',
    }));
  };
  const {mutate: sendChatMessage, isLoading: loadingSendMessage} =
    useAPISendChatMessage({
      onSuccess: sentMsg => {
        setMessages(m => {
          return [sentMsg, ...m];
        });
        setValues(v => ({
          ...v,
          content: '',
          type: ChatMessageType.TEXT,
          replyParentMessage: undefined,
        }));
        if (sentMsg.type === ChatMessageType.IMAGE) {
          setImagesForViewing(i => [...i, {uri: sentMsg.content}]);
        }
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

  const handleDeleteReaction = (reaction: ChatMessageReaction) => {
    deleteReaction(reaction, {
      onSuccess: reactionId => {
        setDeletedReactionIds(r => [...r, reactionId]);
      },
      onError: () => {
        Alert.alert(
          'リアクションの更新中にエラーが発生しました。\n時間をおいて再実行してください。',
        );
      },
    });
  };

  const handleSaveReaction = async (emoji: string, target?: ChatMessage) => {
    if (reactionTarget) {
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
    }
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
        onError: () => {
          Alert.alert(
            'アップロード中にエラーが発生しました。\n時間をおいて再実行してください。',
          );
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
        onError: () => {
          Alert.alert(
            'アップロード中にエラーが発生しました。\n時間をおいて再実行してください。',
          );
        },
      });
    }
  };

  const handleUploadFile = async () => {
    const res = await DocumentPicker.pickSingle({
      type: [DocumentPicker.types.allFiles],
    });
    const formData = new FormData();
    formData.append('files', {
      name: res.name,
      uri: res.uri,
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
    setPage(p => p + 1);
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
    if (
      latestMessage?.length &&
      messages?.length &&
      latestMessage[0].chatGroup?.id === messages[0].chatGroup?.id
    ) {
      const msgToAppend: ChatMessage[] = [];
      for (const sentMsg of latestMessage) {
        if (isRecent(sentMsg, messages[0])) {
          msgToAppend.unshift(sentMsg);
        }
      }
      setMessages(m => {
        return [...msgToAppend, ...m];
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestMessage]);

  useEffect(() => {
    if (fetchedPastMessages?.length) {
      const handleImages = () => {
        const fetchedImages: ImageSource[] = fetchedPastMessages
          .filter(m => m.type === ChatMessageType.IMAGE)
          .map(m => ({uri: m.content}))
          .reverse();
        setImagesForViewing(fetchedImages);
      };
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
        handleImages();
      } else if (!messages?.length) {
        setMessages(fetchedPastMessages);
        handleImages();
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
            ? handleDeleteReaction(r)
            : handleSaveReaction(r.emoji, message)
        }
        onLongPressReation={() =>
          message.reactions?.length && setSelectedReactions(message.reactions)
        }
        deletedReactionIds={deletedReactionIds}
      />
    </Div>
  );

  const reactionSelector = (
    <Div
      bg="white"
      flexDir="row"
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
          keyboardVerticalOffset={
            Platform.OS === 'ios' ? windowHeight * 0.16 : windowHeight * 0.03
          }
          style={[
            chatStyles.keyboardAvoidingView,
            Platform.OS === 'ios'
              ? chatStyles.keyboardAvoidingViewIOS
              : chatStyles.keyboardAvoidingViewAndroid,
          ]}
          behavior={Platform.OS === 'ios' ? 'height' : undefined}>
          {loadingMessages && <ActivityIndicator />}
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
      refetchRoomDetail();
    }, [refetchRoomDetail]),
  );

  useEffect(() => {
    saveLastReadChatTime(room.id, {
      onError: () => {
        Alert.alert('エラーが発生しました。\n時間をおいて再実行してください。');
      },
    });
  }, [room.id, saveLastReadChatTime]);

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
        deletedReactionIds={deletedReactionIds}
        onPressEmoji={emoji => setSelectedEmoji(emoji)}
      />

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
        {selectedMessageForCheckLastRead ? (
          <FlatList
            data={readUsers(selectedMessageForCheckLastRead)}
            renderItem={({item}) => (
              <View
                style={tailwind('flex-row bg-white items-center px-4 mb-2')}>
                <>
                  <Div mr={'sm'}>
                    <UserAvatar user={item} h={64} w={64} />
                  </Div>
                  <Text fontSize={18}>{userNameFactory(item)}</Text>
                </>
              </View>
            )}
          />
        ) : (
          <></>
        )}
      </MagnusModal>
      {/* @TODO add seeking bar */}
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
      <ImageView
        animationType="slide"
        images={imagesForViewing}
        imageIndex={nowImageIndex}
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
