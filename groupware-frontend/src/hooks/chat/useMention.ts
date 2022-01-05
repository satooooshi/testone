import {
  MentionData,
  defaultSuggestionsFilter,
} from '@draft-js-plugins/mention';
import { useReducer } from 'react';
import { User } from 'src/types';
import { useAuthenticate } from 'src/contexts/useAuthenticate';

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

const MentionReducer = (
  state: MentionState,
  action: MentionAction,
): MentionState => {
  const { user } = useAuthenticate();
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
            allMentionUserData: action.value
              ?.filter((u) => u.id !== user?.id)
              .map((u) => ({
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
  return useReducer(MentionReducer, {
    popup: false,
    suggestions: [],
    allMentionUserData: [],
    mentionedUserData: [],
  });
};
