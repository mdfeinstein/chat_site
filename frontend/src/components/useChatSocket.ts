import { useEffect, useRef, useState } from "react";
import type { MessageResponse } from "../api/api";

const useChatSocket = (chatId: number) => {
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${wsProtocol}://${window.location.host}/ws/chat/${chatId}/`;
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log(`WebSocket connected to room ${chatId}`);
    };

    socket.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        setMessages((prev) => [...prev, data.message]);
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
  }, [chatId]);

  const sendMessage = (message: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ message }));
    }
  };

  const flushMessages = () => {
    // return messages and clear the array
    const messagesToFlush = messages;
    setMessages([]);
    return messagesToFlush;
  };

  return { messages, sendMessage, flushMessages };
}

export default useChatSocket;