import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { MessageResponse, ChatUserMinimal, GetChatsWithHistoryResponse, GetFriendDataResponse, ChatUserResponse } from "../api/api";
import type { ChatMessagesData } from "./useChatMessages";

export type MessageByChat = { chat_id: number, message: MessageResponse };
export type WebSocketEvent = NewMessageEvent | FriendListChangedEvent | ChatListChangedEvent;
type NewMessageEvent = {
  type: "chat_message";
  payload: MessageByChat;
}
type FriendListChangedEvent = {
  type: "friends_list_change";
  payload: null;
}
type ChatListChangedEvent = {
  type: "chat_list_change";
  payload: null;
}

type UnknownEventType = {
  type: string;
  payload: any;
}


const useUserSocket = (token : string) => {
  const queryClient = useQueryClient();
  const socketRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef<Record<string, ((event: WebSocketEvent) => void)[]>>({});
  const registerHandler = (type: string, handler: (event: WebSocketEvent) => void) => {
    if (!handlersRef.current[type]) {
      handlersRef.current[type] = [];
    }
    handlersRef.current[type].push(handler);
  };
  
  const removeHandler = (type: string, handler: (event: WebSocketEvent) => void) => {
    handlersRef.current[type] = handlersRef.current[type]?.filter((h) => h !== handler);
  };

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
        (handlersRef.current[data.type] ?? []).forEach((handler) => handler(data));
        switch (data.type) {
          case "chat_message":
            console.log("chat_message received");
            break;
          case "chat_list_change":
            break;
          case "friends_list_change":
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


  return {socketRef, registerHandler, removeHandler};
};

export default useUserSocket;