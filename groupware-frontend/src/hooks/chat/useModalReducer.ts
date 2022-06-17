import { useReducer } from 'react';

export type MenuValue = 'editGroup' | 'editMembers' | 'leaveRoom';

export type ModalState = {
  editChatGroupModalVisible: boolean;
  createGroupWindow: boolean;
  selectChatGroupWindow: boolean;
  editMembersModalVisible: boolean;
  modalSelectRoomTypeVisible: boolean;
};

export type ModalAction =
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
  | { type: 'modalSelectRoomTypeVisible'; value: boolean }
  | {
      type: 'handleMenuSelected';
      value: MenuValue;
    };

const modalInitialValue: ModalState = {
  editChatGroupModalVisible: false,
  createGroupWindow: false,
  selectChatGroupWindow: false,
  editMembersModalVisible: false,
  modalSelectRoomTypeVisible: false,
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
    case 'modalSelectRoomTypeVisible': {
      return {
        ...state,
        modalSelectRoomTypeVisible: action.value,
      };
    }
  }
};

export const useModalReducer = (initialValueProps?: ModalState) => {
  return useReducer(modalReducer, initialValueProps || modalInitialValue);
};
