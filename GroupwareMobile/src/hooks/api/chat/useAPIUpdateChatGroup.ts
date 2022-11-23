import {AxiosError} from 'axios';
import {useMutation, UseMutationOptions} from 'react-query';
import {ChatGroup, SaveRoomsResult} from '../../../types';
import {axiosInstance, jsonHeader} from '../../../utils/url';
import {saveChatGroupURL} from '../../../utils/url/chat.url';

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
