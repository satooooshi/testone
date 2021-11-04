import {useState} from 'react';
import {AllTag} from '../../types';

export const useSelectedTags = (alreadySelectedTags?: AllTag[]) => {
  const [selectedTags, setSelectedTags] = useState<AllTag[]>(
    alreadySelectedTags || [],
  );

  const isSelected = (targetTag: AllTag): boolean => {
    return !!selectedTags.filter(t => t.id === targetTag.id).length;
  };

  const toggleTag = (newSelectedTag: AllTag) => {
    setSelectedTags(tags => {
      const filteredSelectedTagArr = tags.filter(
        t => t.id === newSelectedTag.id,
      );
      if (filteredSelectedTagArr.length) {
        return tags.filter(t => t.id !== newSelectedTag.id);
      }
      return [...tags, newSelectedTag];
    });
  };

  return {
    selectedTags,
    toggleTag,
    isSelected,
  };
};
