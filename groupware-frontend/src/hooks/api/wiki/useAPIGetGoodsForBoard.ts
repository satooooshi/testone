import { AxiosError } from 'axios';
import { useMutation, UseMutationOptions } from 'react-query';
import { UserGoodForBoard } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { getGoodsForBoardURL } from 'src/utils/url/wiki.url';

const getGoodsForBoard = async (wikiID: number) => {
  const response = await axiosInstance.get(`${getGoodsForBoardURL}/${wikiID}`);
  return response.data;
};

export const useAPIGetGoodsForBoard = (
  mutationOptions?: UseMutationOptions<
    UserGoodForBoard[],
    AxiosError,
    number,
    unknown
  >,
) => {
  return useMutation<UserGoodForBoard[], AxiosError, number>(
    (q) => getGoodsForBoard(q),
    mutationOptions,
  );
};
