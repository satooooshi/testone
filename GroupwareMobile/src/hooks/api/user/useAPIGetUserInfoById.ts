import {useQuery} from 'react-query';
import {User} from '../../../types';
import {axiosInstance} from '../../../utils/url';
import {getProfileURL} from '../../../utils/url/user.url';

const getUserInfoById = async (id: string): Promise<User> => {
  const res = await axiosInstance.get<User>(`${getProfileURL}/${id}`);
  return res.data;
};

export const useAPIGetUserInfoById = (id: string) => {
  return useQuery(['getUserInfoById', id], () => {
    return getUserInfoById(id);
  });
};
