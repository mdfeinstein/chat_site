import type {paths} from "./../../../src/api/types";
import type { components } from "./../../../src/api/types";

export type SuccessResponse = components['schemas']['SuccessResponse'];
export type ErrorResponse = components['schemas']['ErrorResponse'];
export type ChatUserMinimal = components['schemas']['ChatUserMinimal'];
export type ChatUsersMinimal = components['schemas']['ChatUsersMinimal'];
export type MessageResponse = components['schemas']['Message'];
export type ChatUserResponse = components['schemas']['ChatUser'];
export type NewMessageRequest = components['schemas']['NewMessage'];

const API_PATHS = {
  getChatData: '/api/get_chat_data/',
  getChats: '/api/get_chats/',
  getFriendData: '/api/get_friend_data/',
  sendFriendRequest: '/api/send_request/',
  cancelFriendRequest: '/api/cancel_request/',
  acceptFriendRequest: '/api/accept_friend_request/',
  rejectFriendRequest: '/api/reject_friend_request/',
  createChat: '/api/create_chat/',
  requestableUsers: '/api/requestable_users/',
  getMessages: '/api/get_messages/',
  getUserInfo: '/api/get_user_info/',
  sendMessage: '/api/send_message/',
};


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
  return data;
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

export const createChat = async (data: ChatUsersMinimal, csrfToken: string) => {
  const response = await fetch('/api/create_chat/', {
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

export const getRequestableUsers = async () => {
  const response = await fetch('/api/requestable_users/');
  const data : ChatUsersMinimal = await response.json();
  return data;
};

export const getMessages = async (chatId: number, startMsgNumber: number, endMsgNumber: number) => {
  const response = await fetch(`/api/get_messages/${chatId}/?start_msg_number=${startMsgNumber}&end_msg_number=${endMsgNumber}`);
  const data : MessageResponse[] = await response.json();
  return data;
};

export const getUserInfo = async () => {
  const response = await fetch('/api/get_user_info/');
  const data : ChatUserResponse = await response.json();
  return data;
};

export const sendMessage = async (data: NewMessageRequest, chatId: number, csrfToken: string) => {
  const response = await fetch(`/api/send_message/${chatId}/`, {
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