import {ChatAlbum, ChatGroup, ChatNote, EventType, WikiType} from '../../types';

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Main: undefined;
  EventList: {
    type?: EventType;
  };
  EventDetail: {
    id: number;
  };
  Wiki: undefined;
  WikiList: {
    type?: WikiType;
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
  PostAnswer: {
    id: number;
  };
  PostReply: {
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
  UserTagAdmin: undefined;
  Chat: {
    room: ChatGroup;
  };
  RoomList:
    | {
        needRefetch: boolean;
      }
    | undefined;
  NewRoom: undefined;
  EditRoom: {room: ChatGroup};
  ChatMenu: {
    room: ChatGroup;
  };
  ChatNotes: {
    room: ChatGroup;
  };
  PostChatNote: {
    room: ChatGroup;
  };
  EditChatNote: {
    room: ChatGroup;
    note: ChatNote;
  };
  ChatAlbums: {
    room: ChatGroup;
  };
  PostChatAlbum: {
    room: ChatGroup;
  };
  ChatAlbumDetail: {
    room: ChatGroup;
    album: ChatAlbum;
  };
  EditChatAlbum: {
    album: ChatAlbum;
  };
};
