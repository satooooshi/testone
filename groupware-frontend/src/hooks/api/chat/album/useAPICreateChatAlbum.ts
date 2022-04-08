import { AxiosError } from 'axios';
import { useMutation, UseQueryOptions } from 'react-query';
import { ChatAlbum } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { albumURL } from 'src/utils/url/chat.url';

const createAlbum = async (query: Partial<ChatAlbum>) => {
  const res = await axiosInstance.post<ChatAlbum>(
    albumURL(query.chatGroup?.id.toString() || '0'),
    query,
  );
  return res.data;
};

export const useAPICreateChatAlbum = (
  options?: UseQueryOptions<ChatAlbum, AxiosError>,
) => {
  return useMutation<ChatAlbum, AxiosError, Partial<ChatAlbum>, unknown>(
    createAlbum,
    options,
  );
};
