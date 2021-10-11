import { useMutation, UseMutationOptions } from 'react-query';
import { Tag } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { deleteTagURL } from 'src/utils/url/tag.url';

const deleteTag = async (tag: Tag) => {
  const res = await axiosInstance.post(deleteTagURL, { id: tag.id });
  return res.data;
};

export const useAPIDeleteTag = (
  mutationOptions?: UseMutationOptions<Tag, Error, Tag, unknown>,
) => {
  return useMutation<Tag, Error, Tag>(deleteTag, mutationOptions);
};
