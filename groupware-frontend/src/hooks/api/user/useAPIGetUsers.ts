import { AxiosError } from 'axios';
import { useQuery, UseQueryOptions } from 'react-query';
import { User } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { getUsersURL } from 'src/utils/url/user.url';

const getUsers = async (): Promise<User[]> => {
  const res = await axiosInstance.get(getUsersURL);
  return res.data;
};

export const useAPIGetUsers = (
  useQueryOptions?: UseQueryOptions<User[], AxiosError>,
) => {
  return useQuery('getUsers', getUsers, useQueryOptions);
};
