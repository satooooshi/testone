import { useMutation, UseMutationOptions } from 'react-query';
import { QAAnswerReply } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { jsonHeader } from 'src/utils/url/header';
import { createAnswerReplyURL } from 'src/utils/url/wiki.url';

const createAnswerReply = async (
  reply: Partial<QAAnswerReply>,
): Promise<QAAnswerReply> => {
  const res = await axiosInstance.post(createAnswerReplyURL, reply, {
    headers: jsonHeader,
  });
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
