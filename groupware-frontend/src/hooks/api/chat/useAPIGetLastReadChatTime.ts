import { getLastReadChatTimeURL } from 'src/utils/url/chat.url';
import { useQuery, UseQueryOptions } from 'react-query';
import { axiosInstance } from 'src/utils/url';
import { LastReadChatTime } from 'src/types';
import { AxiosError } from 'axios';

const getLastReadChatTime = async (query: number) => {
  const res = await axiosInstance.get(getLastReadChatTimeURL + '/' + query);
  return res.data;
};

export const useAPIGetLastReadChatTime = (
  query: number,
  options?: UseQueryOptions<LastReadChatTime[], AxiosError>,
) => {
  return useQuery<LastReadChatTime[], AxiosError>(
    ['getLastReadChatTime', query],
    () => getLastReadChatTime(query),
    options,
  );
};
