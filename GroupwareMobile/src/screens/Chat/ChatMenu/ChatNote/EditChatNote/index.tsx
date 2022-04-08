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
          onError: () => {
            Alert.alert(
              'ノート更新中にエラーが発生しました。\n時間をおいて再実行してください。',
            );
          },
        });
      }}
    />
  );
};

export default EditChatNote;
