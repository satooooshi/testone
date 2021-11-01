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
  EditWiki: {
    id: number;
  };
};
