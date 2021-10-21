import { useReducer } from 'react';

type MenuValue = 'editGroup' | 'editMembers';

type ModalState = {
  editChatGroupModalVisible: boolean;
  createGroupWindow: boolean;
  selectChatGroupWindow: boolean;
  editMembersModalVisible: boolean;
};

type ModalAction =
  | {
      type: 'editChatGroupModalVisible';
      value: boolean;
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
      type: 'handleMenuSelected';
      value: MenuValue;
    };

const modalInitialValue: ModalState = {
  editChatGroupModalVisible: false,
  createGroupWindow: false,
  selectChatGroupWindow: false,
  editMembersModalVisible: false,
};

const modalReducer = (state: ModalState, action: ModalAction): ModalState => {
  switch (action.type) {
    case 'editChatGroupModalVisible': {
      return {
        ...state,
        editChatGroupModalVisible: action.value,
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
    case 'handleMenuSelected': {
      return action.value === 'editGroup'
        ? {
            ...state,
            editChatGroupModalVisible: true,
          }
        : action.value === 'editMembers'
        ? {
            ...state,
            editMembersModalVisible: true,
          }
        : { ...state };
    }
  }
};

export const useModalReducer = (initialValueProps?: ModalState) => {
  return useReducer(modalReducer, initialValueProps || modalInitialValue);
};
