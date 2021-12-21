import {
  MentionData,
  defaultSuggestionsFilter,
} from '@draft-js-plugins/mention';
import { useReducer } from 'react';
import { User } from 'src/types';

type MentionState = {
  suggestions: MentionData[];
  allMentionUserData: MentionData[];
  popup: boolean;
  mentionedUserData: MentionData[];
};

type MentionAction =
  | {
      type: 'popup';
      value: boolean;
    }
  | {
      type: 'suggestions';
      value: string;
    }
  | {
      type: 'allMentionUserData';
      value?: User[];
    }
  | {
      type: 'mentionedUserData';
      value: MentionData;
    };

const mentionReducer = (
  state: MentionState,
  action: MentionAction,
): MentionState => {
  switch (action.type) {
    case 'popup': {
      return {
        ...state,
        popup: action.value,
      };
    }
    case 'suggestions': {
      return {
        ...state,
        suggestions: defaultSuggestionsFilter(
          action.value,
          state.allMentionUserData,
        ),
      };
    }
    case 'allMentionUserData': {
      return action.value?.length
        ? {
            ...state,
            allMentionUserData: action.value.map((u) => ({
              id: u.id,
              name: u.lastName + ' ' + u.firstName + 'さん',
              avatar: u.avatarUrl,
            })),
          }
        : {
            ...state,
          };
    }
    case 'mentionedUserData': {
      return !state.mentionedUserData.filter(
        (prev) => prev.id === action.value.id,
      ).length
        ? {
            ...state,
            mentionedUserData: [...state.mentionedUserData, action.value],
          }
        : {
            ...state,
          };
    }
  }
};
export const useMention = () => {
  return useReducer(mentionReducer, {
    popup: false,
    suggestions: [],
    allMentionUserData: [],
    mentionedUserData: [],
  });
};
