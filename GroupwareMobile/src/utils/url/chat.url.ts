const chatURL = 'chat';

export const getChatGroupListURL = `/${chatURL}/group-list`;
export const getRoomsByPageURL = `/${chatURL}/v2/rooms`;
export const getChatMessagesURL = `/${chatURL}/get-messages`;
export const getLatestMentionedMessageURL = `/${chatURL}/latest-mentioned`;
export const getLastReadChatTimeURL = `/${chatURL}/get-last-read-chat-time`;
export const sendChantMessageURL = `/${chatURL}/send-message`;
export const saveChatGroupURL = `/${chatURL}/save-chat-group`;
export const saveLastReadChatTimeURL = `/${chatURL}/save-last-read-chat-time`;
export const leaveChatRoomURL = `/${chatURL}/leave-room`;
export const noteURL = (roomId: string) => `${chatURL}/v2/room/${roomId}/note`;

//GET
export const getChatNotesURL = (roomId: string, page: string) =>
  `${noteURL(roomId)}?page=${page}`;
//DELETE
export const chatNoteDetailURL = (roomId: string, noteId: string) =>
  `${noteURL(roomId)}/${noteId}`;
