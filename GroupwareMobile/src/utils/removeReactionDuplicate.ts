import {ChatMessageReaction} from '../types';

export const removeReactionDuplicates = (reactions: ChatMessageReaction[]) => {
  let reactionsNoDuplicates: ChatMessageReaction[] = [];
  for (const r of reactions) {
    reactionsNoDuplicates = reactionsNoDuplicates.filter(
      duplicated => duplicated.emoji !== r.emoji,
    );
    reactionsNoDuplicates.push(r);
  }
  return reactionsNoDuplicates;
};
