import {useNavigation, useRoute} from '@react-navigation/native';
import React from 'react';
import {useAPICreateChatNote} from '../../../../../hooks/api/chat/useAPICreateChatNote';
import {useAPIUploadStorage} from '../../../../../hooks/api/storage/useAPIUploadStorage';
import ChatNoteForm from '../../../../../templates/chat/notes/ChatNoteForm';
import {ChatNote} from '../../../../../types';
import {
  ChatRouteProps,
  PostChatNotesNavigationProps,
} from '../../../../../types/navigator/drawerScreenProps';

const PostChatNote: React.FC = () => {
  const {mutate: createChatNote} = useAPICreateChatNote();
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
        createChatNote(submittedValues, {
          onSuccess: () => {
            navigation.navigate('ChatStack', {
              screen: 'ChatNotes',
              params: {room},
            });
          },
        });
      }}
    />
  );
};

export default PostChatNote;
