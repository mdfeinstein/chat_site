import type {paths} from "./../../../src/api/types";
import type { components } from "./../../../src/api/types";

export type SuccessResponse = components['schemas']['SuccessResponse'];
export type ErrorResponse = components['schemas']['ErrorResponse'];
export type ChatUserMinimal = components['schemas']['ChatUserMinimal'];

const API_PATHS = {
  getChatData: '/api/get_chat_data/',
  getChats: '/api/get_chats/',
  getFriendData: '/api/get_friend_data/',
  sendFriendRequest: '/api/send_request/',
  cancelFriendRequest: '/api/cancel_request/',
  acceptFriendRequest: '/api/accept_friend_request/',
  rejectFriendRequest: '/api/reject_friend_request/',
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

export const sendFriendRequest = async (data: ChatUserMinimal, csrfToken: string) => {
  const response = await fetch('/api/send_request/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-CSRFToken': csrfToken,
    },
    body: JSON.stringify(data),
  });
  const responseMessage : SuccessResponse | ErrorResponse = await response.json();
  return responseMessage;
};

export type CancelFriendRequestRequest = paths['/api/cancel_request/']['post']['requestBody']['content']['application/json'];
export const cancelFriendRequest = async (data: CancelFriendRequestRequest, csrfToken: string) => {
  const response = await fetch('/api/cancel_request/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-CSRFToken': csrfToken,
    },
    body: JSON.stringify(data),
  });
  const responseMessage : SuccessResponse | ErrorResponse = await response.json();
  return responseMessage;
};

export const acceptFriendRequest = async (data: ChatUserMinimal, csrfToken: string) => {
  const response = await fetch('/api/accept_friend_request/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-CSRFToken': csrfToken,
    },
    body: JSON.stringify(data),
  });
  const responseMessage : SuccessResponse | ErrorResponse = await response.json();
  return responseMessage;
};

export const rejectFriendRequest = async (data: ChatUserMinimal, csrfToken: string) => {
  const response = await fetch('/api/reject_friend_request/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-CSRFToken': csrfToken,
    },
    body: JSON.stringify(data),
  });
  const responseMessage : SuccessResponse | ErrorResponse = await response.json();
  return responseMessage;
};