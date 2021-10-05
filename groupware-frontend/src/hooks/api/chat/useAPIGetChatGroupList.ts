import { useQuery } from 'react-query';
import { ChatGroup } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { getChatGroupListURL } from 'src/utils/url/chat.url';

const getChatGroupList = async (): Promise<ChatGroup[]> => {
  const response = await axiosInstance.get(getChatGroupListURL);
  return response.data;
};

export const useAPIGetChatGroupList = () => {
  return useQuery<ChatGroup[], Error>('chatGroups', getChatGroupList);
};
