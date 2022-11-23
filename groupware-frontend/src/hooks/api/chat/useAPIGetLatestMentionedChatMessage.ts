import { AxiosError } from 'axios';
import { useQuery } from 'react-query';
import { ChatMessage } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { getLatestMentionedMessageURL } from 'src/utils/url/chat.url';

const getLatestMentionedChatMessage = async () => {
  const res = await axiosInstance.get(getLatestMentionedMessageURL);
  return res.data;
};

export const useAPIGetLatestMentionedChatMessage = () => {
  return useQuery<ChatMessage[], AxiosError>(
    'getLatestMentionedChatMessage',
    getLatestMentionedChatMessage,
  );
};
