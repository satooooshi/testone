import {useNavigation, useRoute} from '@react-navigation/native';
import React from 'react';
import {useAPIGetChatDetail} from '../../../../../hooks/api/chat/note/useAPIGetChatNoteDetail';
import {useAPIUpdateNote} from '../../../../../hooks/api/chat/note/useAPIUpdateChatNote';
import {ChatNote} from '../../../../../types';
import {
  EditChatNotesRouteProps,
  PostChatNotesNavigationProps,
} from '../../../../../types/navigator/drawerScreenProps';
import ChatNoteForm from '../../../../../templates/chat/notes/ChatNoteForm';
import {useAPIUploadStorage} from '../../../../../hooks/api/storage/useAPIUploadStorage';
import {Alert} from 'react-native';
import {AxiosError} from 'axios';

const EditChatNote: React.FC = () => {
  const {room, note} = useRoute<EditChatNotesRouteProps>().params;
  const {mutate: updateChatNote} = useAPIUpdateNote();
  const {mutate: uploadImage} = useAPIUploadStorage();
  const {data} = useAPIGetChatDetail({
    roomId: room.id.toString(),
    noteId: note.id.toString(),
  });
  const navigation = useNavigation<PostChatNotesNavigationProps>();

  return (
    <ChatNoteForm
      rightButtonNameOnHeader={'保存'}
      room={room}
      note={data || note}
      onUploadImage={uploadImage}
      onSubmit={submittedValues => {
        updateChatNote(submittedValues as ChatNote, {
          onSuccess: () => {
            navigation.navigate('ChatStack', {
              screen: 'ChatNotes',
              params: {room},
            });
          },
          onError: err => {
            if (err.response?.data) {
              Alert.alert((err.response?.data as AxiosError)?.message);
            }
          },
        });
      }}
    />
  );
};

export default EditChatNote;
