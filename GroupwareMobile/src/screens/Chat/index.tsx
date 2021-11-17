import React, {useEffect, useState} from 'react';
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import {Div, Icon} from 'react-native-magnus';
import AppHeader from '../../components/Header';
import WholeContainer from '../../components/WholeContainer';
import {useAPIGetMessages} from '../../hooks/api/chat/useAPIGetMessages';
import {useAPISendChatMessage} from '../../hooks/api/chat/useAPISendChatMessage';
import {useAPIUploadStorage} from '../../hooks/api/storage/useAPIUploadStorage';
import {chatStyles} from '../../styles/screen/chat/chat.style';
import {ChatMessage, ChatMessageType} from '../../types';
import {ChatProps} from '../../types/navigator/screenProps/Chat';
import {uploadImageFromGallery} from '../../utils/cropImage/uploadImageFromGallery';
import DocumentPicker from 'react-native-document-picker';
import ImageView from 'react-native-image-viewing';
import Video from 'react-native-video';
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

type ImageSource = {
  uri: string;
};

const Chat: React.FC<ChatProps> = ({route}) => {
  const {height: windowHeight} = useWindowDimensions();
  const {room} = route.params;
  const [page, setPage] = useState(1);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [imageModal, setImageModal] = useState(false);
  const [images, setImages] = useState<ImageSource[]>([]);
  const [nowImageIndex, setNowImageIndex] = useState<number>(0);
  const [video, setVideo] = useState('');
  const {data: fetchedMessage} = useAPIGetMessages({
    group: room.id,
    page: page.toString(),
  });
  const {data: latestMessage} = useAPIGetMessages(
    {
      group: room.id,
      page: '1',
    },
    {refetchInterval: 1000},
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
  const {mutate: sendChatMessage} = useAPISendChatMessage({
    onSuccess: () => {
      setNewMessage('');
    },
  });
  const {mutate: uploaFile} = useAPIUploadStorage();

  const showImageOnModal = (url: string) => {
    const isNowUri = (element: ImageSource) => element.uri === url;
    setNowImageIndex(images.findIndex(isNowUri));
    setImageModal(true);
  };

  const handleSend = () => {
    if (newMessage.length) {
      Keyboard.dismiss();
      sendChatMessage({
        content: newMessage,
        chatGroup: room,
      });
    }
  };

  const handleUploadImage = async () => {
    const {formData} = await uploadImageFromGallery({
      mediaType: 'photo',
      cropping: false,
    });
    if (formData) {
      uploaFile(formData, {
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
      uploaFile(formData, {
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
    uploaFile(formData);
    if (formData) {
      uploaFile(formData, {
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
    let PictureDir =
      Platform.OS === 'ios' ? fs.dirs.DocumentDir : fs.dirs.PictureDir;
    let options = {
      fileCache: true,
      addAndroidDownloads: {
        useDownloadManager: true, // setting it to true will use the device's native download manager and will be shown in the notification bar.
        notification: false,
        description: 'ファイルをダウンロードします',
      },
      path:
        PictureDir +
        '/me_' +
        Math.floor(date.getTime() + date.getSeconds() / 2), // this is the path where your downloaded file will live in
    };
    const {path} = await config(options).fetch('GET', message.content);
    FileViewer.open(path());
  };

  useEffect(() => {
    if (latestMessage && latestMessage.length) {
      setMessages(m => {
        if (
          m &&
          m.length &&
          isRecent(latestMessage[latestMessage.length - 1], m[0])
        ) {
          return [...latestMessage, ...m];
        } else {
          return m;
        }
      });
    }
  }, [latestMessage]);

  useEffect(() => {
    if (fetchedMessage?.length) {
      setMessages(m => {
        if (
          m.length &&
          isRecent(m[m.length - 1], fetchedMessage[fetchedMessage.length - 1])
        ) {
          return [...m, ...fetchedMessage];
        } else {
          return fetchedMessage;
        }
      });
      const fetchedImages: ImageSource[] = fetchedMessage
        .filter(m => m.type === ChatMessageType.IMAGE)
        .map(m => ({uri: m.content}))
        .reverse();
      setImages(fetchedImages);
    }
  }, [fetchedMessage]);

  return (
    <WholeContainer>
      {/* @TODO add seeking bar */}
      <Modal visible={!!video} animationType="slide">
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
        <Video source={{uri: video}} style={chatStyles.video} />
      </Modal>
      <ImageView
        animationType="slide"
        images={images}
        imageIndex={nowImageIndex}
        visible={imageModal}
        onRequestClose={() => setImageModal(false)}
        swipeToCloseEnabled={false}
        doubleTapToZoomEnabled={true}
      />
      <AppHeader
        title="チャット"
        enableBackButton={true}
        screenForBack={'RoomList'}
      />
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
          renderItem={({item: message}) => (
            <Div
              alignSelf={message?.isSender ? 'flex-end' : 'flex-start'}
              mb={'sm'}>
              {message.type === ChatMessageType.TEXT ? (
                <TextMessage message={message} />
              ) : message.type === ChatMessageType.IMAGE ? (
                <ImageMessage
                  onPress={() => showImageOnModal(message.content)}
                  message={message}
                />
              ) : message.type === ChatMessageType.VIDEO ? (
                <VideoMessage
                  message={message}
                  onPress={() => playVideoOnModal(message.content)}
                />
              ) : message.type === ChatMessageType.OTHER_FILE ? (
                <FileMessage
                  message={message}
                  onPress={() => downloadFile(message)}
                />
              ) : null}
            </Div>
          )}
        />
        <ChatFooter
          onUploadFile={handleUploadFile}
          onUploadVideo={handleUploadVideo}
          onUploadImage={handleUploadImage}
          text={newMessage}
          onChangeText={t => setNewMessage(t)}
          onSend={handleSend}
          mentionSuggestions={suggestions()}
        />
      </KeyboardAvoidingView>
    </WholeContainer>
  );
};

export default Chat;
