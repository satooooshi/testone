import {useState} from 'react';
import {AllTag, TagTypeInApp} from '../../types';

export const useTagType = (
  alreadySelectedTagType?: TagTypeInApp,
  tags?: AllTag[],
) => {
  const [selectedTagType, setSelectedTagType] = useState<TagTypeInApp>(
    alreadySelectedTagType || 'All',
  );

  const filteredTags =
    selectedTagType !== 'All'
      ? tags?.filter(t => t.type === selectedTagType)
      : tags;

  const selectTagType = (tagType: TagTypeInApp) => {
    setSelectedTagType(tagType);
  };

  return {
    selectedTagType,
    selectTagType,
    filteredTags,
  };
};
