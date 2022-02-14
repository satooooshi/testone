import { AxiosError } from 'axios';
import { useQuery, UseQueryOptions } from 'react-query';
import { User } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { getUsersURL } from 'src/utils/url/user.url';

const getUsers = async (all: 'ALL' | ''): Promise<User[]> => {
  const res = await axiosInstance.get(`${getUsersURL}?status=${all}`);
  return res.data;
};

export const useAPIGetUsers = (
  all: 'ALL' | '',
  useQueryOptions?: UseQueryOptions<User[], AxiosError>,
) => {
  return useQuery('getUsers', () => getUsers(all), useQueryOptions);
};
