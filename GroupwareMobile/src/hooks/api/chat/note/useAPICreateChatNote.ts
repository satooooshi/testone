import {AxiosError} from 'axios';
import {useMutation, UseQueryOptions} from 'react-query';
import {ChatNote} from '../../../../types';
import {axiosInstance} from '../../../../utils/url';
import {noteURL} from '../../../../utils/url/chat.url';

const createNote = async (query: Partial<ChatNote>) => {
  const res = await axiosInstance.post<ChatNote>(
    noteURL(query.chatGroup?.id.toString() || '0'),
    query,
  );
  return res.data;
};

export const useAPICreateChatNote = (
  options?: UseQueryOptions<ChatNote, AxiosError>,
) => {
  return useMutation<ChatNote, AxiosError, Partial<ChatNote>, unknown>(
    createNote,
    options,
  );
};
