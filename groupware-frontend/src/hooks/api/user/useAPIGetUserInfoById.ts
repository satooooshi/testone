import { useQuery } from 'react-query';
import { User } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { getProfileUrl } from 'src/utils/url/account.url';

const getUserInfoById = async (id: string): Promise<User> => {
  const res = await axiosInstance.get(`${getProfileUrl}/${id}`);
  return res.data;
};

export const useAPIGetUserInfoById = (id: string) => {
  return useQuery(['getUserInfoById', id], () => {
    return getUserInfoById(id);
  });
};
