import {AxiosError} from 'axios';
import {useMutation, UseQueryOptions} from 'react-query';
import {ChatNote} from '../../../../types';
import {axiosInstance} from '../../../../utils/url';
import {chatNoteDetailURL} from '../../../../utils/url/chat.url';

const updateNote = async (query: ChatNote) => {
  const res = await axiosInstance.patch<ChatNote>(
    chatNoteDetailURL(
      query.chatGroup?.id.toString() || '0',
      query.id.toString() || '0',
    ),
    query,
  );
  return res.data;
};

export const useAPIUpdateNote = (
  options?: UseQueryOptions<ChatNote, AxiosError>,
) => {
  return useMutation<ChatNote, AxiosError, ChatNote, unknown>(
    updateNote,
    options,
  );
};
