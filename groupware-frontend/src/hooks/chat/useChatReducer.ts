import { EditorState } from 'draft-js';
import { useReducer } from 'react';
import { ChatMessage, ChatMessageType, LastReadChatTime } from 'src/types';

type ChatState = {
  page: number;
  messages: ChatMessage[];
  lastReadChatTime: LastReadChatTime[];
  newChatMessage: Partial<ChatMessage>;
  editorState: EditorState;
};

type ChatAction =
  | {
      type: 'page';
      value: number;
    }
  | {
      type: 'messages';
      value: ChatMessage[];
    }
  | {
      type: 'newChatMessage';
      value: Partial<ChatMessage>;
    }
  | {
      type: 'editorState';
      value: EditorState;
    }
  | {
      type: 'lastReadChatTime';
      value?: LastReadChatTime[];
    }
  | {
      type: 'latestMessages';
      value?: ChatMessage[];
    }
  | {
      type: 'fetchedMessages';
      value?: ChatMessage[];
    };

const chatInitialValue: ChatState = {
  page: 1,
  messages: [],
  lastReadChatTime: [],
  newChatMessage: {
    content: '',
    type: ChatMessageType.TEXT,
  },
  editorState: EditorState.createEmpty(),
};

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'page': {
      return {
        ...state,
        page: action.value,
      };
    }
    case 'messages': {
      return {
        ...state,
        messages: action.value,
      };
    }
    case 'newChatMessage': {
      return {
        ...state,
        newChatMessage: action.value,
      };
    }
    case 'editorState': {
      return {
        ...state,
        editorState: action.value,
      };
    }
    case 'lastReadChatTime': {
      return action.value
        ? {
            ...state,
            lastReadChatTime: action.value,
          }
        : { ...state };
    }
    case 'latestMessages': {
      if (!action.value?.length) {
        return { ...state };
      }
      if (!state.messages.length) {
        return { ...state, messages: action.value };
      }
      const ascSorted = action.value.concat().reverse();
      for (const newMessage of ascSorted) {
        if (
          new Date(state.messages[0].createdAt) <
            new Date(newMessage.createdAt) &&
          state.messages[0].id !== Number(newMessage.id)
        ) {
          state.messages.unshift(newMessage);
        }
      }
      return { ...state, messages: state.messages };
    }
    case 'fetchedMessages': {
      if (!action.value?.length) {
        return { ...state };
      }
      if (!state.messages.length) {
        return { ...state, messages: action.value };
      }
      for (const oldMessage of action.value) {
        if (
          new Date(state.messages[state.messages.length - 1].createdAt) >
          new Date(oldMessage.createdAt)
        ) {
          state.messages.push(oldMessage);
        }
      }
      return { ...state, messages: state.messages };
    }
  }
};

export const useChatReducer = (initialValueProps?: ChatState) => {
  return useReducer(chatReducer, initialValueProps || chatInitialValue);
};
