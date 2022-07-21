import {AxiosError} from 'axios';
import {useMutation, UseQueryOptions} from 'react-query';
import {ChatNote, SaveRoomsResult} from '../../../../types';
import {axiosInstance} from '../../../../utils/url';
import {noteURL} from '../../../../utils/url/chat.url';

const createNote = async (query: Partial<ChatNote>) => {
  const res = await axiosInstance.post<SaveRoomsResult>(
    noteURL(query.chatGroup?.id.toString() || '0'),
    query,
  );
  return res.data;
};

export const useAPICreateChatNote = (
  options?: UseQueryOptions<SaveRoomsResult, AxiosError>,
) => {
  return useMutation<SaveRoomsResult, AxiosError, Partial<ChatNote>, unknown>(
    createNote,
    options,
  );
};
