const chatURL = 'chat';

export const getChatGroupListURL = `/${chatURL}/group-list`;
export const getRoomsByPageURL = `/${chatURL}/v2/rooms`;
export const getRoomDetailURL = `/${chatURL}/v2/room`;
export const getChatMessagesURL = `/${chatURL}/get-messages`;
export const searchMessagesURL = `/${chatURL}/search-messages`;
export const editMembersURL = (roomId: number) =>
  `/${chatURL}/v2/room/${roomId.toString()}/members`;
export const getLatestMentionedMessageURL = `/${chatURL}/latest-mentioned`;
export const getLastReadChatTimeURL = `/${chatURL}/get-last-read-chat-time`;
export const sendChantMessageURL = `/${chatURL}/send-message`;
export const deleteChantMessageURL = `/${chatURL}/delete-message`;
export const saveChatGroupURL = `/${chatURL}/v2/room`;
export const savePinURL = `${saveChatGroupURL}/pin`;
export const saveLastReadChatTimeURL = `/${chatURL}/save-last-read-chat-time`;
export const saveReactionURL = `/${chatURL}/v2/reaction`;
export const deleteReactionURL = (reactionId: string) =>
  `/${chatURL}/v2/reaction/${reactionId}`;
export const leaveChatRoomURL = `/${chatURL}/leave-room`;
export const noteURL = (roomId: string) => `${chatURL}/v2/room/${roomId}/note`;
export const albumURL = (roomId: string) =>
  `${chatURL}/v2/room/${roomId}/album`;

//GET
export const getChatNotesURL = (roomId: string, page: string) =>
  `${noteURL(roomId)}?page=${page}`;
//DELETE
export const chatNoteDetailURL = (roomId: string, noteId: string) =>
  `${noteURL(roomId)}/${noteId}`;
//GET
export const getChatAlbumsURL = (roomId: string, page: string) =>
  `${albumURL(roomId)}?page=${page}`;
//DELETE
export const chatAlbumImageURL = (roomId: string, albumId: string) =>
  `${albumURL(roomId)}/${albumId}`;

export const chatAlbumDetailURL = (roomId: string, albumId: string) =>
  `${albumURL(roomId)}/${albumId}`;
