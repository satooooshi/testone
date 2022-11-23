import { AxiosError } from 'axios';
import { useMutation, UseQueryOptions } from 'react-query';
import { ChatAlbumImage } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { albumImageURL } from 'src/utils/url/chat.url';

const saveAlbumImage = async (query: Partial<ChatAlbumImage>[]) => {
  const res = await axiosInstance.post<ChatAlbumImage[]>(albumImageURL, query);
  return res.data;
};

export const useAPISaveAlbumImage = (
  options?: UseQueryOptions<Partial<ChatAlbumImage>[], AxiosError>,
) => {
  return useMutation<
    ChatAlbumImage[],
    AxiosError,
    Partial<ChatAlbumImage>[],
    unknown
  >(saveAlbumImage, options);
};
