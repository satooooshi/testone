import { AxiosError } from 'axios';
import { useQuery } from 'react-query';
import { User } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { getMiniProfileURL } from 'src/utils/url/user.url';

const getMiniProfileById = async (id: string): Promise<User> => {
  const res = await axiosInstance.get(`${getMiniProfileURL}/${id}`);
  return res.data;
};

export const useAPIGetMiniProfileById = (id: string) => {
  return useQuery<User, AxiosError>(['getMiniProfile', id], () => {
    return getMiniProfileById(id);
  });
};
