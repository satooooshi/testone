import { Tag, UserTag } from 'src/types';

export const toggleTag = (
  existTag: (Tag | UserTag)[] | undefined,
  clickedTag: Tag | UserTag,
): Tag[] => {
  const isExist = existTag?.filter((t) => t.id === clickedTag.id).length;
  if (isExist) {
    return existTag ? existTag.filter((t) => t.id !== clickedTag.id) : [];
  }
  return existTag ? [...existTag, clickedTag] : [clickedTag];
};
