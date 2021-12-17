import {AxiosError} from 'axios';
import {useQuery, UseQueryOptions} from 'react-query';
import {ChatGroup} from '../../../types';
import {axiosInstance} from '../../../utils/url';
import {getRoomDetailURL} from '../../../utils/url/chat.url';

const getRoomDetail = async (roomId: number) => {
  const res = await axiosInstance.get<ChatGroup>(
    `${getRoomDetailURL}/${roomId.toString()}`,
  );
  return res.data;
};

export const useAPIGetRoomDetail = (
  roomId: number,
  useQueryOptions: UseQueryOptions<ChatGroup, AxiosError>,
) => {
  return useQuery<ChatGroup, AxiosError>(
    ['getRoomDetail', roomId],
    () => getRoomDetail(roomId),
    useQueryOptions,
  );
};
