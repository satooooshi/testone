import { SearchQueryToGetUsers } from '@/hooks/api/user/useAPISearchUsers';
import { searchUsersURL } from './url/user.url';

export const userAPIQueryRefresh = (
  query: Partial<SearchQueryToGetUsers>,
): string => {
  const {
    page: newPage = '1',
    word: newWord = '',
    tag: newTag = '',
    sort,
    role,
    verified,
    duration,
  } = query;

  let refreshURL = `${searchUsersURL}?page=${newPage}&word=${newWord}&tag=${newTag}`;
  if (sort) {
    refreshURL = `${refreshURL}&sort=${sort}`;
  }
  if (role) {
    refreshURL = `${refreshURL}&role=${role}`;
  }
  if (verified) {
    refreshURL = `${refreshURL}&verified=true`;
  }
  if (duration) {
    refreshURL = `${refreshURL}&duration=${duration}`;
  }
  return refreshURL;
};

export const searchUserQueryParamFactory = (
  query: Partial<SearchQueryToGetUsers>,
): string => {
  const {
    page: newPage = '1',
    word: newWord = '',
    tag: newTag = '',
    sort,
    role,
    verified,
    duration,
  } = query;
  let refreshURL = `?page=${newPage}&word=${newWord}&tag=${newTag}`;
  if (sort) {
    refreshURL = `${refreshURL}&sort=${sort}`;
  }
  if (role) {
    refreshURL = `${refreshURL}&role=${role}`;
  }
  if (verified) {
    refreshURL = `${refreshURL}&verified=true`;
  }
  if (duration) {
    refreshURL = `${refreshURL}&duration=${duration}`;
  }
  return refreshURL;
};

export const userQueryRefresh = (
  query: Partial<SearchQueryToGetUsers>,
): string => {
  const queryParam = searchUserQueryParamFactory(query);

  const refreshURL = `/users/list?${queryParam}`;
  return refreshURL;
};
