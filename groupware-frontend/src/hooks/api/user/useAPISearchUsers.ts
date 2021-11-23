import { AxiosError } from 'axios';
import { useQuery } from 'react-query';
import { User, UserRole } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { userAPIQueryRefresh } from 'src/utils/userQueryRefresh';

export interface SearchQueryToGetUsers {
  page?: string;
  word?: string;
  tag?: string;
  sort?: 'event' | 'question' | 'answer' | 'knowledge';
  role?: UserRole;
  verified?: boolean;
  duration?: 'month' | 'week';
}

export interface SearchResultToGetUsers {
  // this key is the total page count
  pageCount: number;
  users: User[];
}

const searchUsers = async (
  query: SearchQueryToGetUsers,
): Promise<SearchResultToGetUsers> => {
  const url = userAPIQueryRefresh(query);
  const res = await axiosInstance.get(url);
  return res.data;
};

export const useAPISearchUsers = (query: SearchQueryToGetUsers) => {
  return useQuery<SearchResultToGetUsers, AxiosError>(
    ['searchUsers', query],
    () => searchUsers(query),
  );
};
