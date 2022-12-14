import { useMutation, UseMutationOptions } from 'react-query';
import { Wiki } from 'src/types';
import { jsonHeader } from 'src/utils/url/header';
import { toggleGoodForBoardURL } from 'src/utils/url/wiki.url';
import { axiosInstance } from '../../../utils/url';

const toggleGoodForBoard = async (wikiID: number) => {
  const response = await axiosInstance.post(
    toggleGoodForBoardURL,
    { id: wikiID },
    {
      headers: jsonHeader,
    },
  );
  return response.data;
};

export const useAPIToggleGoodForBoard = (
  mutationOptions?: UseMutationOptions<Partial<Wiki>, Error, number, unknown>,
) => {
  return useMutation<Partial<Wiki>, Error, number>(
    (wikiID) => toggleGoodForBoard(wikiID),
    mutationOptions,
  );
};
