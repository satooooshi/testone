import { AxiosError } from 'axios';
import { useMutation, UseQueryOptions } from 'react-query';
import { ChatAlbum } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { chatAlbumDetailURL } from 'src/utils/url/chat.url';

const updateAlbum = async (query: ChatAlbum) => {
  const res = await axiosInstance.patch<ChatAlbum>(
    chatAlbumDetailURL(
      query.chatGroup?.id.toString() || '0',
      query.id.toString() || '0',
    ),
    query,
  );
  return res.data;
};

export const useAPIUpdateAlbum = (
  options?: UseQueryOptions<ChatAlbum, AxiosError>,
) => {
  return useMutation<ChatAlbum, AxiosError, ChatAlbum, unknown>(
    updateAlbum,
    options,
  );
};
