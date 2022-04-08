import {AxiosError} from 'axios';
import {useQuery, UseQueryOptions} from 'react-query';
import {ChatGroup} from '../../../types';
import {axiosInstance} from '../../../utils/url';
import {getRoomsByPageURL} from '../../../utils/url/chat.url';

export interface GetRoomsQuery {
  page?: string;
  limit?: string;
}

export interface GetRoomsResult {
  rooms: ChatGroup[];
  pageCount: number;
}

const getRooms = async (query: GetRoomsQuery) => {
  const {page = 1, limit = '20'} = query;
  const res = await axiosInstance.get<GetRoomsResult>(
    `${getRoomsByPageURL}?page=${page}&limit=${limit}`,
  );
  return res.data;
};

export const useAPIGetRooms = (
  query: GetRoomsQuery,
  options?: UseQueryOptions<GetRoomsResult, AxiosError>,
) => {
  return useQuery<GetRoomsResult, AxiosError>(
    ['getMessages', query],
    () => getRooms(query),
    options,
  );
};
