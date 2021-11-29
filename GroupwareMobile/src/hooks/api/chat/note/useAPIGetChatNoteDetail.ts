import {AxiosError} from 'axios';
import {useQuery, UseQueryOptions} from 'react-query';
import {ChatNote} from '../../../../types';
import {axiosInstance} from '../../../../utils/url';
import {chatNoteDetailURL} from '../../../../utils/url/chat.url';

export interface GetChatNotesQuery {
  roomId: string;
  noteId: string;
}

const getNoteDetail = async (query: GetChatNotesQuery) => {
  const {roomId, noteId} = query;
  const res = await axiosInstance.get<ChatNote>(
    chatNoteDetailURL(roomId, noteId),
  );
  return res.data;
};

export const useAPIGetChatDetail = (
  query: GetChatNotesQuery,
  options?: UseQueryOptions<ChatNote, AxiosError>,
) => {
  return useQuery<ChatNote, AxiosError>(
    ['getChatNoteDetail', query],
    () => getNoteDetail(query),
    options,
  );
};
