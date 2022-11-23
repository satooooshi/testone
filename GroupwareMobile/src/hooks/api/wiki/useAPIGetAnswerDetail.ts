import {AxiosError} from 'axios';
import {useQuery} from 'react-query';
import {QAAnswer} from '../../../types';
import {axiosInstance} from '../../../utils/url';
import {getAnswerDetailURL} from '../../../utils/url/wiki.url';

const getAnswerDetail = async (id: number) => {
  const res = await axiosInstance.get<QAAnswer>(`${getAnswerDetailURL}/${id}`);
  return res.data;
};

export const useAPIGetAnswerDetail = (id: number) => {
  return useQuery<QAAnswer, AxiosError>(['answerDetail', {id}], () =>
    getAnswerDetail(id),
  );
};
