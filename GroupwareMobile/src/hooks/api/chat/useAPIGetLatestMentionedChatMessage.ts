import {useQuery} from 'react-query';
import {axiosInstance} from '../../../utils/url';
import {ChatMessage} from '../../../types';
import {getLatestMentionedMessageURL} from '../../../utils/url/chat.url';

const getLatestMentionedChatMessage = async () => {
  const res = await axiosInstance.get<ChatMessage[]>(
    getLatestMentionedMessageURL,
  );
  return res.data;
};

export const useAPIGetLatestMentionedChatMessage = () => {
  return useQuery<ChatMessage[], Error>(
    'getLatestMentionedChatMessage',
    getLatestMentionedChatMessage,
  );
};
