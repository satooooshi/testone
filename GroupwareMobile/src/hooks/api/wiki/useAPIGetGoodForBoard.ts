import {AxiosError} from 'axios';
import {useMutation, UseMutationOptions} from 'react-query';
import {UserGoodForBoard} from '../../../types';
import {axiosInstance} from '../../../utils/url';
import {getGoodsForBoardURL} from '../../../utils/url/wiki.url';

const getGoodsForBoard = async (wikiID: number) => {
  const response = await axiosInstance.get<UserGoodForBoard[]>(
    `${getGoodsForBoardURL}/${wikiID}`,
  );
  return response.data;
};

export const useAPIGetGoodsForBoard = (
  mutationOptions?: UseMutationOptions<UserGoodForBoard[], AxiosError, number>,
) => {
  return useMutation<UserGoodForBoard[], AxiosError, number>(
    q => getGoodsForBoard(q),
    mutationOptions,
  );
};
