import {useMutation, UseMutationOptions} from 'react-query';
import {QAAnswerReply} from '../../../types';
import {axiosInstance, jsonHeader} from '../../../utils/url';
import {createAnswerReplyURL} from '../../../utils/url/wiki.url';

const createAnswerReply = async (
  reply: Partial<QAAnswerReply>,
): Promise<QAAnswerReply> => {
  const res = await axiosInstance.post<QAAnswerReply>(
    createAnswerReplyURL,
    reply,
    {
      headers: jsonHeader,
    },
  );
  return res.data;
};
export const useAPICreateAnswerReply = (
  mutationOptions?: UseMutationOptions<
    QAAnswerReply,
    Error,
    Partial<QAAnswerReply>,
    unknown
  >,
) => {
  return useMutation<QAAnswerReply, Error, Partial<QAAnswerReply>>(
    createAnswerReply,
    mutationOptions,
  );
};
