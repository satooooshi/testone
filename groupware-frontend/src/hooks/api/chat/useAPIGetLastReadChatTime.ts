import { getLastReadChatTimeURL } from 'src/utils/url/chat.url';
import { useQuery, UseQueryOptions } from 'react-query';
import { axiosInstance } from 'src/utils/url';
import { LastReadChatTime } from 'src/types';

const getLastReadChatTime = async (query: number) => {
  const res = await axiosInstance.get(getLastReadChatTimeURL + '/' + query);
  return res.data;
};

export const useAPIGetLastReadChatTime = (
  query: number,
  options?: UseQueryOptions<LastReadChatTime[], Error>,
) => {
  return useQuery<LastReadChatTime[], Error>(
    ['getLastReadChatTime', query],
    () => getLastReadChatTime(query),
    options,
  );
};
