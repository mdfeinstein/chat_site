import React, { use } from "react";
import { useState, useEffect, createContext, useContext } from "react";
import { Box, Burger } from "@mantine/core";
import MessagesContainer from "./MessagesContainer";
import type { Message } from "./MessagesContainer";
import TopBar from "./TopBar";
import SendMessageForm from "./SendMessageForm";
import CollapsibleNavBar from "./CollapsibleNavBar";
import { getChatData, getUserInfo } from "../api/api";
import type { GetChatDataResponse, ChatUserResponse } from "../api/api";

interface ChatPageProps {
  chatId_initial: number | string;
  homeUrl: string;
  exitChatUrl: string;
  logoutUrl: string;
  csrfToken: string;
}

interface ChatPageContext {
  csrfToken: string;
  chatUser: ChatUserResponse;
}

const ChatPageContext = createContext<ChatPageContext>({} as ChatPageContext);
const ChatPageContextProvider = ChatPageContext.Provider;
export const useChatPageContext = () => useContext(ChatPageContext);

const ChatPage: React.FC<ChatPageProps> = ({
  chatId_initial,
  homeUrl,
  exitChatUrl,
  logoutUrl,
  csrfToken,
}) => {
  if (typeof chatId_initial === "string") {
    chatId_initial = parseInt(chatId_initial);
  }
  const [userInfo, setUserInfo] = useState<ChatUserResponse>({} as ChatUserResponse);
  const [chatId, setChatId] = useState<number>(chatId_initial);
  const [chatData, setChatData] = useState<GetChatDataResponse>({
    chat_id:-1,
    chat_usernames: [],
    exited_chat_usernames: [],
    messages: [],
  } as GetChatDataResponse);
  
  const [isNavBarCollapsed, setIsNavBarCollapsed] = useState<boolean>(true);
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [initialMessagesLoaded, setInitialMessagesLoaded] = useState<boolean>(false);
  const toggleNavBar = () => {
    setIsNavBarCollapsed(!isNavBarCollapsed);
  };

  const updateUserInfo = async () => {
    const data = await getUserInfo();
    setUserInfo(data);
  };

  const updateChatData = async () => {
    setInitialMessagesLoaded(false);
    if (chatId!==-1) {
      const data = await getChatData(chatId);
      setChatData(data);
      setInitialMessages(data.messages.map((message) => ({message: message, isNew: false})));
      setInitialMessagesLoaded(true);
    }
    else {
      // setChatName("No Chats Found. Start One in the Friends Tab!");
    }
  };

  const setChatDetailsFunc = async (chatId: number) => {
    setChatId(chatId);
  };

  useEffect(() => {
    updateChatData();
  }, [chatId]);

  useEffect(() => {
    updateUserInfo();
  }, []);


  return (
    <ChatPageContextProvider value={{ csrfToken: csrfToken, chatUser: userInfo }}>

    <Box
      style={{
        // display: 'flex',
        // flexDirection: 'row',
        position: "relative",

        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        margin: 0,
        padding: 0,
        cursor: initialMessagesLoaded ? "default" : "wait",
      }}
    >
      <Box
        style={{
          position: "absolute",
          transition: "width 0.5s ease",
          zIndex: 1,
          width: isNavBarCollapsed ? "20%" : "60%",
          height: "100%",
          backgroundColor: "#f5f5f5",
          
        }}
      >
        <CollapsibleNavBar
          isCollapsed={isNavBarCollapsed}
          collapser={toggleNavBar}
          setChatDetailsFunc={setChatDetailsFunc}
          selectedChatId={chatId}
        />
        </Box>
      <Box
        style={{
          // display: 'flex',
          // flexDirection: 'column',
          position: "absolute",
          right: 0,
          width: "80%",
          height: "100%",
          overflow: "hidden",
          margin: 0,
          padding: 0,
        }}
      >
        {/* TopBar - 10% height */}
        <Box
          style={{
            height: "10vh",
          }}
        >
          <TopBar
            chatData={chatData}
            setChatDetailsFunc={setChatDetailsFunc}
          />
        </Box>

        {/* MessagesContainer - 70% height */}
        <Box
          style={{
            height: "80vh",
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <MessagesContainer
            initialMessages={initialMessages}
            initialMessagesLoaded={initialMessagesLoaded}
            chatId={chatId}
          />
        </Box>

        {/* SendMessageForm - 20% height */}
        <Box
          style={{
            height: "10vh",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <SendMessageForm
            chatId={chatId}
          />
        </Box>
      </Box>
    </Box>
    </ChatPageContextProvider>
  );
};

export default ChatPage;
