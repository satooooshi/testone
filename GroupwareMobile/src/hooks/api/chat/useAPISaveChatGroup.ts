import {AxiosError} from 'axios';
import {useMutation, UseMutationOptions} from 'react-query';
import {ChatGroup} from '../../../types';
import {axiosInstance, jsonHeader} from '../../../utils/url';
import {saveChatGroupURL} from '../../../utils/url/chat.url';

const saveChatGroup = async (
  chatGroup: Partial<ChatGroup>,
): Promise<ChatGroup> => {
  const response = await axiosInstance.post<ChatGroup>(
    saveChatGroupURL,
    chatGroup,
    {
      headers: jsonHeader,
    },
  );
  return response.data;
};

export const useAPISaveChatGroup = (
  mutationOptions?: UseMutationOptions<
    ChatGroup,
    AxiosError,
    Partial<ChatGroup>,
    unknown
  >,
) => {
  return useMutation<ChatGroup, AxiosError, Partial<ChatGroup>>(
    saveChatGroup,
    mutationOptions,
  );
};
