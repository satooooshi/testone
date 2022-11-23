import { AxiosError } from 'axios';
import { useQuery, UseQueryOptions } from 'react-query';
import { ChatAlbum } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { getChatAlbumsURL } from 'src/utils/url/chat.url';

export interface GetChatAlbumsQuery {
  roomId: string;
  page: string;
}

export interface GetChatAlbumsResult {
  albums: ChatAlbum[];
  pageCount: number;
}

const getAlbums = async (query: GetChatAlbumsQuery) => {
  const { roomId, page } = query;
  const res = await axiosInstance.get<GetChatAlbumsResult>(
    getChatAlbumsURL(roomId, page),
  );
  return res.data;
};

export const useAPIGetChatAlbums = (
  query: GetChatAlbumsQuery,
  options?: UseQueryOptions<GetChatAlbumsResult, AxiosError>,
) => {
  return useQuery<GetChatAlbumsResult, AxiosError>(
    ['getChatAlbums', query],
    () => getAlbums(query),
    options,
  );
};
