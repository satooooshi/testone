import {AxiosError} from 'axios';
import {useQuery, UseQueryOptions} from 'react-query';
import {ChatGroup} from '../../../types';
import {axiosInstance} from '../../../utils/url';
import {getRoomURL} from '../../../utils/url/chat.url';

const getOneRoom = async (roomId: number) => {
  console.log('=====', `${getRoomURL}/${roomId.toString()}`);
  const res = await axiosInstance.get<ChatGroup>(
    `${getRoomURL}/${roomId.toString()}`,
  );

  return res.data;
};

export const useAPIGetOneRoom = (
  roomId: number,
  useQueryOptions?: UseQueryOptions<ChatGroup, AxiosError>,
) => {
  return useQuery<ChatGroup, AxiosError>(
    ['getOneRoom', roomId],
    () => getOneRoom(roomId),
    useQueryOptions,
  );
};
