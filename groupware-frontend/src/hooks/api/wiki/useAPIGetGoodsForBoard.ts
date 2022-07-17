import { AxiosError } from 'axios';
import { useMutation, UseMutationOptions } from 'react-query';
import { userGoodForBoard, Wiki } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { getGoodsForBoardURL } from 'src/utils/url/wiki.url';

const getGoodsForBoard = async (wikiID: number) => {
  const response = await axiosInstance.get(`${getGoodsForBoardURL}/${wikiID}`);
  console.log('get good for board =========================', wikiID);
  return response.data;
};

export const useAPIGetGoodsForBoard = (
  mutationOptions?: UseMutationOptions<
    userGoodForBoard[],
    AxiosError,
    number,
    unknown
  >,
) => {
  return useMutation<userGoodForBoard[], AxiosError, number>(
    (q) => getGoodsForBoard(q),
    mutationOptions,
  );
};
