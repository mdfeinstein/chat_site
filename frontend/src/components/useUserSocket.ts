import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { MessageResponse } from "../api/api";

export type MessageByChat = { chat_id: number, message: MessageResponse };
export type WebSocketEvent = NewMessageEvent | FriendListChangedEvent | ChatListChangedEvent | IsTypingEvent;
export type NewMessageEvent = {
  type: "chat_message";
  payload: MessageByChat;
}
export type FriendListChangedEvent = {
  type: "friends_list_change";
  payload: null;
}
export type ChatListChangedEvent = {
  type: "chat_list_change";
  payload: null;
}
export type IsTypingEvent = {
  type: "is_typing";
  payload: TypingPayload;
}

type UnknownEventType = {
  type: string;
  payload: any;
}

export type TypingPayload = {
  chat_id: number;
  user_id: number;
  user_name?: string;
}

const useUserSocket = (token : string) => {
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

  const sendTyping = (data: TypingPayload) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "send_typing", payload: data }));
    }
  };

  useEffect(() => {
    const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${wsProtocol}://${window.location.host}/ws/user/`;
    const socket = new WebSocket(wsUrl, ["access_token", token]);
    socketRef.current = socket;

    socket.onopen = () => {
    };

    socket.onmessage = (event: MessageEvent) => {
      try {
        const data : WebSocketEvent= JSON.parse(event.data);
        (handlersRef.current[data.type] ?? []).forEach((handler) => handler(data));
        }
      catch (err) {
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


  return {socketRef, registerHandler, removeHandler, sendTyping};
};

export default useUserSocket;