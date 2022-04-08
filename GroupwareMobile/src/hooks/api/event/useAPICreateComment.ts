import {AxiosError} from 'axios';
import {useMutation, UseMutationOptions} from 'react-query';
import {EventComment} from '../../../types';
import {axiosInstance, jsonHeader} from '../../../utils/url';
import {createCommentURL} from '../../../utils/url/event.url';
import {ValidateErrorResponseByServer} from '../../../utils/factory/responseEroorMsgFactory';

const createComment = async (
  answer: Partial<EventComment>,
): Promise<EventComment> => {
  const response = await axiosInstance.post<EventComment>(
    createCommentURL,
    answer,
    {
      headers: jsonHeader,
    },
  );
  return response.data;
};

export const useAPICreateComment = (
  mutationOptions?: UseMutationOptions<
    EventComment,
    AxiosError<ValidateErrorResponseByServer>,
    Partial<EventComment>,
    unknown
  >,
) => {
  return useMutation<
    EventComment,
    AxiosError<ValidateErrorResponseByServer>,
    Partial<EventComment>
  >(createComment, mutationOptions);
};
