import {AxiosError} from 'axios';
import {useMutation, UseQueryOptions} from 'react-query';
import {axiosInstance} from '../../../utils/url';
import {chatNoteDetailURL} from '../../../utils/url/chat.url';

export type DeleteNoteDto = {
  roomId: string;
  noteId: string;
};

const deleteNote = async (query: DeleteNoteDto) => {
  const res = await axiosInstance.delete<void>(
    chatNoteDetailURL(query.roomId, query.noteId),
  );
  return res.data;
};

export const useAPIDeleteChatNote = (
  options?: UseQueryOptions<void, AxiosError>,
) => {
  return useMutation<void, AxiosError, DeleteNoteDto, unknown>(
    deleteNote,
    options,
  );
};
