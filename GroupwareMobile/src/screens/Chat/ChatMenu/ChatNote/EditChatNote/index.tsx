import {useNavigation, useRoute} from '@react-navigation/native';
import React from 'react';
import {useAPIGetChatDetail} from '../../../../../hooks/api/chat/useAPIGetChatNoteDetail';
import {useAPIUpdateNote} from '../../../../../hooks/api/chat/useAPIUpdateChatNote';
import {ChatNote} from '../../../../../types';
import {
  EditChatNotesRouteProps,
  PostChatNotesNavigationProps,
} from '../../../../../types/navigator/drawerScreenProps';
import ChatNoteForm from '../../../../../templates/chat/notes/ChatNoteForm';

const EditChatNote: React.FC = () => {
  const {room, note} = useRoute<EditChatNotesRouteProps>().params;
  const {mutate: updateChatNote} = useAPIUpdateNote();
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
      onSubmit={submittedValues => {
        updateChatNote(submittedValues as ChatNote, {
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

export default EditChatNote;
