import {AxiosError} from 'axios';
import {useQuery, UseQueryOptions} from 'react-query';
import {ChatNote} from '../../../types';
import {axiosInstance} from '../../../utils/url';
import {getChatNotesURL} from '../../../utils/url/chat.url';

export interface GetChatNotesQuery {
  roomId: string;
  page: string;
}

export interface GetChatNotesResult {
  notes: ChatNote[];
  pageCount: number;
}

const getNotes = async (query: GetChatNotesQuery) => {
  const {roomId, page} = query;
  const res = await axiosInstance.get<GetChatNotesResult>(
    getChatNotesURL(roomId, page),
  );
  return res.data;
};

export const useAPIGetChatNotes = (
  query: GetChatNotesQuery,
  options?: UseQueryOptions<GetChatNotesResult, AxiosError>,
) => {
  return useQuery<GetChatNotesResult, AxiosError>(
    ['getChatNotes', query],
    () => getNotes(query),
    options,
  );
};
