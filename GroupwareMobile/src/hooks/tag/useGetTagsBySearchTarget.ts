import {SearchTarget} from '../../components/common/SearchForm';
import {useAPIGetTag} from '../api/tag/useAPIGetTag';
import {useAPIGetUserTag} from '../api/tag/useAPIGetUserTag';

export const useGetTagsBySearchTarget = (searchTarget: SearchTarget) => {
  return searchTarget === 'user' ? useAPIGetUserTag : useAPIGetTag;
};
