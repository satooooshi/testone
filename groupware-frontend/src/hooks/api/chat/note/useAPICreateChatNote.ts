import { AxiosError } from 'axios';
import { useMutation, UseQueryOptions } from 'react-query';
import { ChatNote, SaveNoteResult } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { noteURL } from 'src/utils/url/chat.url';

const createNote = async (query: Partial<ChatNote>) => {
  const res = await axiosInstance.post<SaveNoteResult>(
    noteURL(query.chatGroup?.id.toString() || '0'),
    query,
  );
  return res.data;
};

export const useAPICreateChatNote = (
  options?: UseQueryOptions<SaveNoteResult, AxiosError>,
) => {
  return useMutation<SaveNoteResult, AxiosError, Partial<ChatNote>, unknown>(
    createNote,
    options,
  );
};
