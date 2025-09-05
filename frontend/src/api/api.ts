import type {paths} from "./../../../src/api/types";

const API_PATHS = {
  getChatData: '/api/get_chat_data/',
  getChats: '/api/get_chats/',
  getFriendData: '/api/get_friend_data/',
}

export type GetChatDataResponse = paths['/api/get_chat_data/']['get']['responses']['200']['content']['application/json'];
export const getChatData = async (chatId: number) => {
  const response = await fetch(`${API_PATHS.getChatData}${chatId}/`);
  const data : GetChatDataResponse = await response.json();
  return data;
};

export type GetChatsWithHistoryResponse = paths['/api/get_chats_with_history/']['get']['responses']['200']['content']['application/json'];
export type GetChatWithHistoryResponse = paths['/api/get_chats_with_history/']['get']['responses']['200']['content']['application/json']['chats'][0];
export const getChatsWithHistory = async () => {
  const response = await fetch('/api/get_chats_with_history/');
  const data : GetChatsWithHistoryResponse = await response.json();
  const chats : GetChatWithHistoryResponse[] = data.chats;
  return chats;
};

export type GetFriendDataResponse = paths['/api/get_friend_data/']['get']['responses']['200']['content']['application/json'];
export const getFriendData = async () => {
  const response = await fetch('/api/get_friend_data/');
  const data : GetFriendDataResponse = await response.json();
  return data;
};