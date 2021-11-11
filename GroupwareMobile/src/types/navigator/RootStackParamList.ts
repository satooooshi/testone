import {WikiType} from '../../types';

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Main: undefined;
  EventList: undefined;
  EventDetail: {
    id: number;
  };
  Wiki: undefined;
  WikiList: {
    type: WikiType;
  };
  WikiDetail: {
    id: number;
  };
  PostWiki: {
    type?: WikiType;
  };
  EditWiki: {
    id: number;
  };
  AccountDetail:
    | {
        id?: number;
      }
    | undefined;
  Profile: undefined;
  UpdatePassword: undefined;
  UserList: undefined;
  UserAdmin: undefined;
  UserRegisteringAdmin: undefined;
  TagAdmin: undefined;
};
