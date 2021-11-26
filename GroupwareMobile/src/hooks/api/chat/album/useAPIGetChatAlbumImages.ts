import {AxiosError} from 'axios';
import {useQuery, UseQueryOptions} from 'react-query';
import {ChatAlbumImage} from '../../../../types';
import {axiosInstance} from '../../../../utils/url';
import {chatAlbumImageURL} from '../../../../utils/url/chat.url';

export interface GetChatAlbumImagesQuery {
  roomId: string;
  albumId: string;
  page: string;
}

export interface GetChatAlbumImagesResult {
  images: ChatAlbumImage[];
  pageCount: number;
}

const getAlbumImages = async (query: GetChatAlbumImagesQuery) => {
  const {roomId, albumId, page} = query;
  const res = await axiosInstance.get<GetChatAlbumImagesResult>(
    chatAlbumImageURL(roomId, albumId, page),
  );
  return res.data;
};

export const useAPIGetChatImages = (
  query: GetChatAlbumImagesQuery,
  options?: UseQueryOptions<GetChatAlbumImagesResult, AxiosError>,
) => {
  return useQuery<GetChatAlbumImagesResult, AxiosError>(
    ['getChatAlbumImages', query],
    () => getAlbumImages(query),
    options,
  );
};
