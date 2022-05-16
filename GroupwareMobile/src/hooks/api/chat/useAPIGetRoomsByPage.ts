import {AxiosError} from 'axios';
import {useQuery, UseQueryOptions} from 'react-query';
import {ChatGroup} from '../../../types';
import {axiosInstance} from '../../../utils/url';
import {getRoomsByPageURL} from '../../../utils/url/chat.url';

export interface GetRoomsQuery {
  page?: string;
  limit?: string;
  updatedAtLatestRoom?: Date;
  isLatest?: boolean;
}

export interface GetRoomsResult {
  rooms: ChatGroup[];
  pageCount: number;
}

const getRooms = async (query: GetRoomsQuery) => {
  const {page = 1, limit = '20', updatedAtLatestRoom = ''} = query;
  const res = await axiosInstance.get<GetRoomsResult>(
    `${getRoomsByPageURL}?page=${page}&limit=${limit}&updatedAtLatestRoom=${updatedAtLatestRoom}`,
  );
  return res.data;
};

export const useAPIGetRooms = (
  query: GetRoomsQuery,
  options?: UseQueryOptions<GetRoomsResult, AxiosError>,
) => {
  return useQuery<GetRoomsResult, AxiosError>(
    [query.isLatest ? 'getRoomsLatest' : 'getRooms', query],
    () => getRooms(query),
    options,
  );
};
