import { useMutation, UseMutationOptions } from 'react-query';
import { ChatGroup } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { saveChatGroupURL } from 'src/utils/url/chat.url';
import { jsonHeader } from 'src/utils/url/header';

const saveChatGroup = async (
  chatGroup: Partial<ChatGroup>,
): Promise<ChatGroup> => {
  const response = await axiosInstance.post(saveChatGroupURL, chatGroup, {
    headers: jsonHeader,
  });
  return response.data;
};

export const useAPISaveChatGroup = (
  mutationOptions?: UseMutationOptions<
    ChatGroup,
    Error,
    Partial<ChatGroup>,
    unknown
  >,
) => {
  return useMutation<ChatGroup, Error, Partial<ChatGroup>>(
    saveChatGroup,
    mutationOptions,
  );
};
