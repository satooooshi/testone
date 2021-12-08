import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
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
  Image,
  Overlay,
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
import TextMessage from '../../components/chat/ChatMessage/TextMessage';
import ImageMessage from '../../components/chat/ChatMessage/ImageMessage';
import VideoMessage from '../../components/chat/ChatMessage/VideoMessage';
import ChatFooter from '../../components/chat/ChatFooter';
import {userNameFactory} from '../../utils/factory/userNameFactory';
import {Suggestion} from 'react-native-controlled-mentions';
import FileMessage from '../../components/chat/ChatMessage/FileMessage';
import RNFetchBlob from 'rn-fetch-blob';
const {fs, config} = RNFetchBlob;
import FileViewer from 'react-native-file-viewer';
import {KeyboardAwareFlatList} from 'react-native-keyboard-aware-scroll-view';
import {useNavigation, useRoute} from '@react-navigation/native';
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
import EmojiSelector from 'react-native-emoji-selector';
import {useAPISaveReaction} from '../../hooks/api/chat/useAPISaveReaction';
import {useAPIDeleteReaction} from '../../hooks/api/chat/useAPIDeleteReaction';
import ReactionToMessage from '../../components/chat/ChatMessage/ReactionToMessage';
import ReactionsModal from '../../components/chat/ReactionsModal';
import {numbersOfSameValueInKeyOfObjArr} from '../../utils/numbersOfSameValueInKeyOfObjArr';
import {saveToCameraRoll} from '../../utils/storage/saveToCameraRoll';
import VideoPlayer from 'react-native-video-player';

const Chat: React.FC = () => {
  const typeDropdownRef = useRef<any | null>(null);
  const navigation = useNavigation<ChatNavigationProps>();
  const {height: windowHeight} = useWindowDimensions();
  const route = useRoute<ChatRouteProps>();
  const {room} = route.params;
  const [page, setPage] = useState(1);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [imageModal, setImageModal] = useState(false);
  const [images, setImages] = useState<ImageSource[]>([]);
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
  const [selectedMessageForCheckLastRead, setSelectedMessageForCheckLastRead] =
    useState<ChatMessage>();
  const {values, handleSubmit, setValues} = useFormik<Partial<ChatMessage>>({
    initialValues: {
      content: '',
      type: ChatMessageType.TEXT,
      replyParentMessage: null,
      chatGroup: room,
    },
    enableReinitialize: true,
    onSubmit: submittedValues => {
      Keyboard.dismiss();
      sendChatMessage(submittedValues);
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
      name: userNameFactory(m),
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
      },
    });
  const {mutate: uploadFile, isLoading: loadingUploadFile} =
    useAPIUploadStorage();

  const showImageOnModal = (url: string) => {
    const isNowUri = (element: ImageSource) => element.uri === url;
    setNowImageIndex(images.findIndex(isNowUri));
    setImageModal(true);
  };
  const isLoading = loadingMessages || loadingSendMessage || loadingUploadFile;
  const headerRightIcon = (
    <TouchableOpacity
      style={tailwind('flex flex-row items-center')}
      onPress={() =>
        navigation.navigate('ChatStack', {screen: 'ChatMenu', params: {room}})
      }>
      <Icon
        name="pencil"
        fontFamily="Entypo"
        fontSize={24}
        color={darkFontColor}
      />
    </TouchableOpacity>
  );

  const handleDeleteReaction = (reaction: ChatMessageReaction) => {
    deleteReaction(reaction, {
      onSuccess: reactionId => {
        setDeletedReactionIds(r => [...r, reactionId]);
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

  const downloadFile = async (message: ChatMessage) => {
    const date = new Date();
    let PictureDir = fs.dirs.DocumentDir;
    let options = {
      fileCache: true,
      addAndroidDownloads: {
        useDownloadManager: true, // setting it to true will use the device's native download manager and will be shown in the notification bar.
        notification: true,
        description: 'ファイルをダウンロードします',
        path:
          PictureDir +
          '/me_' +
          Math.floor(date.getTime() + date.getSeconds() / 2), // this is the path where your downloaded file will live in
      },
      path:
        PictureDir +
        '/me_' +
        Math.floor(date.getTime() + date.getSeconds() / 2), // this is the path where your downloaded file will live in
    };
    const {path} = await config(options).fetch('GET', message.content);
    FileViewer.open(path());
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
    if (latestMessage?.length && messages?.length) {
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
        setImages(fetchedImages);
      };
      if (
        messages?.length &&
        isRecent(
          messages[messages.length - 1],
          fetchedPastMessages[fetchedPastMessages.length - 1],
        )
      ) {
        setMessages(m => {
          return [...m, ...fetchedPastMessages];
        });
        handleImages();
      } else if (!messages?.length) {
        setMessages(fetchedPastMessages);
        handleImages();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchedPastMessages]);

  const reactionRemovedDuplicates = (reactions: ChatMessageReaction[]) => {
    const reactionsNoDuplicates: ChatMessageReaction[] = [];
    for (const r of reactions) {
      if (
        reactionsNoDuplicates.filter(
          duplicated => duplicated.isSender || duplicated.emoji !== r.emoji,
        )
      ) {
        reactionsNoDuplicates.push(r);
      }
    }
    return reactionsNoDuplicates;
  };

  const renderMessage = (message: ChatMessage) => (
    <Div mb={'sm'}>
      <Div
        flexDir="row"
        mb={'xs'}
        alignSelf={message?.isSender ? 'flex-end' : 'flex-start'}
        alignItems="flex-end">
        {readUsers.length ? (
          <TouchableOpacity
            onPress={() => setSelectedMessageForCheckLastRead(message)}>
            <Text mb="sm" mr={message?.isSender ? 'sm' : undefined}>
              {`既読\n${numbersOfRead(message)}人`}
            </Text>
          </TouchableOpacity>
        ) : null}
        {message.type === ChatMessageType.TEXT ? (
          <TextMessage
            message={message}
            onLongPress={() => setLongPressedMgg(message)}
          />
        ) : message.type === ChatMessageType.IMAGE ? (
          <ImageMessage
            onPress={() => showImageOnModal(message.content)}
            message={message}
            onLongPress={() => setLongPressedMgg(message)}
          />
        ) : message.type === ChatMessageType.VIDEO ? (
          <VideoMessage
            message={message}
            onPress={() => playVideoOnModal(message.content)}
            onLongPress={() => setLongPressedMgg(message)}
          />
        ) : message.type === ChatMessageType.OTHER_FILE ? (
          <FileMessage
            message={message}
            onPress={() => downloadFile(message)}
            onLongPress={() => setLongPressedMgg(message)}
          />
        ) : null}
      </Div>
      <Div
        maxW={windowWidth * 0.6}
        flexDir="row"
        flexWrap="wrap"
        alignSelf={message?.isSender ? 'flex-end' : 'flex-start'}>
        {message.reactions?.length
          ? reactionRemovedDuplicates(message.reactions)
              .filter(r => !deletedReactionIds.includes(r.id))
              .map(r => (
                <Div mr="xs" mb="xs">
                  <ReactionToMessage
                    onPress={() => {
                      r.isSender
                        ? handleDeleteReaction(r)
                        : handleSaveReaction(r.emoji, message);
                    }}
                    onLongPress={() =>
                      message.reactions?.length &&
                      setSelectedReactions(message.reactions)
                    }
                    reaction={r}
                    numbersOfReaction={numbersOfSameValueInKeyOfObjArr(
                      message.reactions as ChatMessageReaction[],
                      r,
                      'emoji',
                    )}
                  />
                </Div>
              ))
          : null}
      </Div>
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
          <FlatList
            style={chatStyles.flatlist}
            contentContainerStyle={chatStyles.flatlistContent}
            inverted
            data={messages}
            {...{onEndReached}}
            renderItem={({item: message}) => renderMessage(message)}
          />
          {reactionTarget ? (
            <Div h={'50%'}>
              <EmojiSelector
                onEmojiSelected={emoji => handleSaveReaction(emoji)}
                showHistory={false}
                showSearchBar={false}
                placeholder="検索"
                showSectionTitles={false}
              />
            </Div>
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
            <Div h={'50%'}>
              <EmojiSelector
                onEmojiSelected={emoji => handleSaveReaction(emoji)}
                showHistory={false}
                showSearchBar={false}
                placeholder="検索"
                showSectionTitles={false}
              />
            </Div>
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
              />
            </>
          )}
        </>
      )}
    </>
  );
  const readUsers =
    selectedMessageForCheckLastRead && lastReadChatTime
      ? lastReadChatTime
          .filter(t => t.readTime >= selectedMessageForCheckLastRead.createdAt)
          .map(t => t.user)
      : [];

  return (
    <WholeContainer>
      <Overlay visible={isLoading} p="xl">
        <ActivityIndicator />
      </Overlay>
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
        <FlatList
          data={readUsers}
          renderItem={({item}) => (
            <View style={tailwind('flex-row bg-white items-center px-4 mb-2')}>
              <>
                <Image
                  mr={'sm'}
                  rounded="circle"
                  h={64}
                  w={64}
                  source={
                    item.avatarUrl
                      ? {uri: item.avatarUrl}
                      : require('../../../assets/no-image-avatar.png')
                  }
                />
                <Text fontSize={18}>{userNameFactory(item)}</Text>
              </>
            </View>
          )}
        />
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
        images={images}
        imageIndex={nowImageIndex}
        visible={imageModal}
        onRequestClose={() => setImageModal(false)}
        swipeToCloseEnabled={false}
        doubleTapToZoomEnabled={true}
        FooterComponent={({imageIndex}) => (
          <TouchableOpacity
            style={tailwind('absolute bottom-5 right-5')}
            onPress={() =>
              saveToCameraRoll({url: images[imageIndex].uri, type: 'image'})
            }>
            <Icon color="white" name="download" fontSize={24} />
          </TouchableOpacity>
        )}
      />
      <HeaderWithIconButton
        title="チャット"
        enableBackButton={true}
        screenForBack={'RoomList'}
        icon={headerRightIcon}
      />
      {messageListAvoidngKeyboardDisturb}
    </WholeContainer>
  );
};

export default Chat;
