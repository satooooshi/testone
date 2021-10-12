import { EditorState } from 'draft-js';
import { useReducer } from 'react';
import {
  ChatGroup,
  ChatMessage,
  ChatMessageType,
  LastReadChatTime,
} from 'src/types';

type ChatState = {
  page: number;
  editChatGroupModalVisible: boolean;
  messages: ChatMessage[];
  lastReadChatTime: LastReadChatTime[];
  newChatMessage: Partial<ChatMessage>;
  createGroupWindow: boolean;
  selectChatGroupWindow: boolean;
  editMembersModalVisible: boolean;
  newGroup: Partial<ChatGroup>;
  editorState: EditorState;
};

type ChatAction =
  | {
      type: 'page';
      value: number;
    }
  | {
      type: 'editChatGroupModalVisible';
      value: boolean;
    }
  | {
      type: 'messages';
      value: ChatMessage[];
    }
  | {
      type: 'lastReadChatTime';
      value: LastReadChatTime[];
    }
  | {
      type: 'newChatMessage';
      value: Partial<ChatMessage>;
    }
  | {
      type: 'createGroupWindow';
      value: boolean;
    }
  | {
      type: 'selectChatGroupWindow';
      value: boolean;
    }
  | {
      type: 'editMembersModalVisible';
      value: boolean;
    }
  | {
      type: 'newGroup';
      value: Partial<ChatGroup>;
    }
  | {
      type: 'editorState';
      value: EditorState;
    };

const chatInitialValue: ChatState = {
  page: 1,
  editChatGroupModalVisible: false,
  messages: [],
  lastReadChatTime: [],
  newChatMessage: {
    content: '',
    type: ChatMessageType.TEXT,
  },
  createGroupWindow: false,
  selectChatGroupWindow: false,
  editMembersModalVisible: false,
  newGroup: {
    name: '',
    members: [],
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
    case 'editChatGroupModalVisible': {
      return {
        ...state,
        editChatGroupModalVisible: action.value,
      };
    }
    case 'messages': {
      return {
        ...state,
        messages: action.value,
      };
    }
    case 'lastReadChatTime': {
      return {
        ...state,
        lastReadChatTime: action.value,
      };
    }
    case 'newChatMessage': {
      return {
        ...state,
        newChatMessage: action.value,
      };
    }
    case 'createGroupWindow': {
      return {
        ...state,
        createGroupWindow: action.value,
      };
    }
    case 'selectChatGroupWindow': {
      return {
        ...state,
        selectChatGroupWindow: action.value,
      };
    }
    case 'editMembersModalVisible': {
      return {
        ...state,
        editMembersModalVisible: action.value,
      };
    }
    case 'newGroup': {
      return {
        ...state,
        newGroup: action.value,
      };
    }
    case 'editorState': {
      return {
        ...state,
        editorState: action.value,
      };
    }
  }
};

export const useChatReducer = () => {
  return useReducer(chatReducer, chatInitialValue);
};
