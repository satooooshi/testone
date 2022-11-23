import { AxiosError } from 'axios';
import { useMutation, UseMutationOptions } from 'react-query';
import { ChatGroup, SaveRoomsResult } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { saveChatGroupURL } from 'src/utils/url/chat.url';
import { jsonHeader } from 'src/utils/url/header';

const updateChatGroup = async (
  chatGroup: ChatGroup,
): Promise<SaveRoomsResult> => {
  const response = await axiosInstance.patch<SaveRoomsResult>(
    saveChatGroupURL,
    chatGroup,
    {
      headers: jsonHeader,
    },
  );
  return response.data;
};

export const useAPIUpdateChatGroup = (
  mutationOptions?: UseMutationOptions<
    SaveRoomsResult,
    AxiosError,
    ChatGroup,
    unknown
  >,
) => {
  return useMutation<SaveRoomsResult, AxiosError, ChatGroup>(
    updateChatGroup,
    mutationOptions,
  );
};
