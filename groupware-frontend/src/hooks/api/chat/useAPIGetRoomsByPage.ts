import { AxiosError } from 'axios';
import { useQuery, UseQueryOptions } from 'react-query';
import { ChatGroup } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { getRoomsByPageURL } from 'src/utils/url/chat.url';

export interface GetRoomsQuery {
  page?: string;
  limit?: string;
  updatedAtLatestRoom?: Date;
}

export interface GetRoomsResult {
  rooms: ChatGroup[];
  pageCount: number;
}

const getRooms = async (query: GetRoomsQuery) => {
  const { page = 1, limit, updatedAtLatestRoom = '' } = query;
  const res = await axiosInstance.get<GetRoomsResult>(
    `${getRoomsByPageURL}?page=${page}&limit=${
      limit || ''
    }&updatedAtLatestRoom=${updatedAtLatestRoom}`,
  );
  return res.data;
};

export const useAPIGetRoomsByPage = (
  query: GetRoomsQuery,
  options?: UseQueryOptions<GetRoomsResult, AxiosError>,
) => {
  return useQuery<GetRoomsResult, AxiosError>(
    [query.updatedAtLatestRoom ? 'getLatestRooms' : 'getRooms', query],
    () => getRooms(query),
    options,
  );
};
