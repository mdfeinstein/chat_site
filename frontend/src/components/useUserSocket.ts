import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { MessageResponse, ChatUserMinimal, GetChatsWithHistoryResponse, GetFriendDataResponse, ChatUserResponse } from "../api/api";
import type { ChatMessagesData } from "./useChatMessages";
type MessageByChat = { chat_id: number, message: MessageResponse };

type WebSocketEvent = NewMessageEvent | FriendListChangedEvent;
type NewMessageEvent = {
  type: "chat_message";
  payload: MessageByChat;
}
type FriendListChangedEvent = {
  type: "friends_list_change";
  payload: null;
}

type UnknownEventType = {
  type: string;
  payload: any;
}

type EventType = "chat_message" | "received_friend_request";

const useUserSocket = (token :string) => {
  const queryClient = useQueryClient();
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${wsProtocol}://${window.location.host}/ws/user/`;
    const socket = new WebSocket(wsUrl, ["access_token", token]);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log(`WebSocket connected to user via token ${token}`);
    };

    socket.onmessage = (event: MessageEvent) => {
      try {
        const data : WebSocketEvent= JSON.parse(event.data);
        switch (data.type) {
          case "chat_message":
            console.log("chat_message received");
            // push to chatsWithHistory cache
            queryClient.setQueryData(['chatsWithHistory'], (old : GetChatsWithHistoryResponse) => {
              const { chat_id, message} = data.payload;

              const targetChatIdx = old.chats.findIndex(chat => chat.chat_id === chat_id);
              if (targetChatIdx === -1) return old; //chat not found, do nothing
              const oldMessages = old.chats[targetChatIdx].last_messages ?? [];
              const merged = [message, ...oldMessages];
              old.chats[targetChatIdx].last_messages = merged;
              return old;
            });
            //push to specific chat cache, if intiialized
            const {chat_id, message} = data.payload;
            if (queryClient.getQueryData(['messages', chat_id])) {
              queryClient.setQueryData(['messages', chat_id], (old : ChatMessagesData) => {
                old.messages.push(message);
                old.prevLastMessageNumber = old.lastMessageNumber;
                old.lastMessageNumber = message.message_number;
                return old;
              });            
            }
            break;
          case "friends_list_change":
            queryClient.invalidateQueries({queryKey: ['friendsData']});
            queryClient.invalidateQueries({queryKey: ['requestableUsers']});
            break;
          
          default:
            // if (typeof data.type !== "string") return;
            console.log(`Event type not recognized. JSON data: ${JSON.stringify(data)}`);
        }
      } catch (err) {
        console.error("Error parsing WebSocket message", err);
      }
    };

    socket.onerror = (err) => console.error("WebSocket error", err);

    socket.onclose = (event) =>
      console.log("WebSocket closed", event.code, event.reason);

    return () => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close(1000, "Component unmounted");
      }
    };
  }, [token]);


  return socketRef;
}

export default useUserSocket;