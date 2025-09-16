import { useEffect, useRef, useState } from "react";

interface ChatMessage {
  id: number;
  sender_username: string;
  text: string;
  message_number: number;
  created_at: string;
}

const useChatSocket = (chatId: number) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // Type the ref as WebSocket | null
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

  return { messages, sendMessage };
}

export default useChatSocket;