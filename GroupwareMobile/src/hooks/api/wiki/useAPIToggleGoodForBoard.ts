import {useMutation, UseMutationOptions} from 'react-query';
import {Wiki} from '../../../types';
import {axiosInstance, jsonHeader} from '../../../utils/url';
import {toggleGoodForBoardURL} from '../../../utils/url/wiki.url';

const toggleGoodForBoard = async (wikiID: number) => {
  const response = await axiosInstance.post<Wiki>(
    toggleGoodForBoardURL,
    {id: wikiID},
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
    wikiID => toggleGoodForBoard(wikiID),
    mutationOptions,
  );
};
