import {useQuery, UseQueryOptions} from 'react-query';
import {axiosInstance} from '../../../utils/url';
import {getLastReadChatTimeURL} from '../../../utils/url/chat.url';
import {LastReadChatTime} from '../../../types';

const getLastReadChatTime = async (query: number) => {
  const res = await axiosInstance.get<LastReadChatTime[]>(
    getLastReadChatTimeURL + '/' + query,
  );
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
