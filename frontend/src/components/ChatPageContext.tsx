
import React, { createContext, useContext, useState} from "react";
import type { ReactNode } from "react";
import type { ChatUserResponse } from "../api/api";

interface ChatPageContextType {
  token: string | null;
  chatUser: ChatUserResponse | null;
  setToken: (token: string | null) => void;
  setChatUser: (user: ChatUserResponse | null) => void;
}

const ChatPageContext = createContext<ChatPageContextType | undefined>(undefined);

export const useChatPageContext = () => {
  const ctx = useContext(ChatPageContext);
  if (!ctx) throw new Error("useChatPageContext must be used within ChatPageContextProvider");
  return ctx;
};

export const ChatPageContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(()=> {
    const stored =localStorage.getItem("token");
    return stored ? stored : null;
  });
  const [chatUser, setChatUserState] = useState<ChatUserResponse | null>(()=> {
    const stored = localStorage.getItem("chatUser");
    return stored ? JSON.parse(stored) : null;
  });
  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) {
      localStorage.setItem("token", newToken);
    } else {
      localStorage.removeItem("token");
    }
  };

  const setChatUser = (user: ChatUserResponse | null) => {
    setChatUserState(user);
    if (user) {
      localStorage.setItem("chatUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("chatUser");
    }
  };

  return (
    <ChatPageContext.Provider value={{ token, setToken, chatUser, setChatUser }}>
      {children}
    </ChatPageContext.Provider>
  );
};