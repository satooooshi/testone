import {useState} from 'react';
import {AllTag} from '../../types';

export const useSelectedTags = (alreadySelectedTags?: Partial<AllTag>[]) => {
  const [selectedTags, setSelectedTags] = useState<Partial<AllTag>[]>(
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

  const clear = () => {
    setSelectedTags(alreadySelectedTags || []);
  };

  return {
    selectedTags,
    setSelectedTags,
    toggleTag,
    isSelected,
    clear,
  };
};
