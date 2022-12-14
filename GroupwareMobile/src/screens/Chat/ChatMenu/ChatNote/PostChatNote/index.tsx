import {useNavigation, useRoute} from '@react-navigation/native';
import React from 'react';
import {Alert} from 'react-native';
import {useAPICreateChatNote} from '../../../../../hooks/api/chat/note/useAPICreateChatNote';
import {useAPIUploadStorage} from '../../../../../hooks/api/storage/useAPIUploadStorage';
import ChatNoteForm from '../../../../../templates/chat/notes/ChatNoteForm';
import {ChatNote} from '../../../../../types';
import {
  ChatRouteProps,
  PostChatNotesNavigationProps,
} from '../../../../../types/navigator/drawerScreenProps';
import {socket} from '../../../../../utils/socket';

const PostChatNote: React.FC = () => {
  const {mutate: createChatNote} = useAPICreateChatNote({
    onSuccess: result => {
      socket.emit('message', {
        type: 'send',
        chatMessage: result.systemMessage,
      });
      navigation.navigate('ChatStack', {
        screen: 'ChatNotes',
        params: {room},
      });
    },
    onError: () => {
      Alert.alert(
        'ノート作成中にエラーが発生しました。\n時間をおいて再実行してください。',
      );
    },
  });
  const navigation = useNavigation<PostChatNotesNavigationProps>();
  const {mutate: uploadImage} = useAPIUploadStorage();
  const {room} = useRoute<ChatRouteProps>().params;
  const initialValues: Partial<ChatNote> = {
    content: '',
    chatGroup: room,
  };
  return (
    <ChatNoteForm
      rightButtonNameOnHeader={'保存'}
      room={room}
      note={initialValues}
      onUploadImage={uploadImage}
      onSubmit={submittedValues => {
        createChatNote(submittedValues);
      }}
    />
  );
};

export default PostChatNote;
