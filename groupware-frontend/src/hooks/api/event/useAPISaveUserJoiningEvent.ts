import { AxiosError } from 'axios';
import { useMutation, UseMutationOptions } from 'react-query';
import { UserJoiningEvent } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { saveUserJoiningEventURL } from 'src/utils/url/event.url';

const saveUserJoiningEvent = async (
  userJoiningEvent: UserJoiningEvent,
): Promise<UserJoiningEvent> => {
  const res = await axiosInstance.post(
    saveUserJoiningEventURL,
    userJoiningEvent,
  );
  return res.data;
};

export const useAPISaveUserJoiningEvent = (
  mutationOptions?: UseMutationOptions<
    UserJoiningEvent,
    AxiosError,
    UserJoiningEvent,
    unknown
  >,
) => {
  return useMutation<UserJoiningEvent, AxiosError, UserJoiningEvent>(
    saveUserJoiningEvent,
    mutationOptions,
  );
};
