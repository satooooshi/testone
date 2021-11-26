import {AxiosError} from 'axios';
import {useMutation, UseQueryOptions} from 'react-query';
import {axiosInstance} from '../../../../utils/url';
import {chatAlbumDetailURL} from '../../../../utils/url/chat.url';

export type DeleteAlbumDto = {
  roomId: string;
  albumId: string;
};

const deleteAlbum = async (query: DeleteAlbumDto) => {
  const res = await axiosInstance.delete<void>(
    chatAlbumDetailURL(query.roomId, query.albumId),
  );
  return res.data;
};

export const useAPIDeleteChatAlbum = (
  options?: UseQueryOptions<void, AxiosError>,
) => {
  return useMutation<void, AxiosError, DeleteAlbumDto, unknown>(
    deleteAlbum,
    options,
  );
};
