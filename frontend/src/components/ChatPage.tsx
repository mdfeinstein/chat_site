import React from "react";
import { useState, useEffect, createContext, useContext } from "react";
import { Box, Burger } from "@mantine/core";
import MessagesContainer from "./MessagesContainer";
import type { Message } from "./MessagesContainer";
import TopBar from "./TopBar";
import SendMessageForm from "./SendMessageForm";
import CollapsibleNavBar from "./CollapsibleNavBar";
import type {paths} from "./../../../src/api/types";

type GetChatDataResponse = paths['/api/get_chat_data/{chat_id}/']['get']['responses']['200']['content']['application/json'];


interface ChatPageProps {
  chatId_initial: number | string;
  homeUrl: string;
  exitChatUrl: string;
  logoutUrl: string;
  getNewMessagesUrl: string;
  sendMessageUrl: string;
  getChatsUrl: string;
  getFriendInfoUrl: string;
  csrfToken: string;
}

interface ChatPageContext {
  csrfToken: string;
}

const ChatPageContext = createContext<ChatPageContext>({} as ChatPageContext);
const ChatPageContextProvider = ChatPageContext.Provider;
export const useChatPageContext = () => useContext(ChatPageContext);

const ChatPage: React.FC<ChatPageProps> = ({
  chatId_initial,
  homeUrl,
  exitChatUrl,
  logoutUrl,
  getNewMessagesUrl,
  sendMessageUrl,
  // getChatsUrl,
  getFriendInfoUrl,
  csrfToken,
}) => {
  if (typeof chatId_initial === "string") {
    chatId_initial = parseInt(chatId_initial);
  }
  const [chatId, setChatId] = useState<number>(chatId_initial);
  const [chatName, setChatName] = useState<string>("");
  const [isNavBarCollapsed, setIsNavBarCollapsed] = useState<boolean>(true);
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
  const [initialMessagesLoaded, setInitialMessagesLoaded] = useState<boolean>(false);
  const toggleNavBar = () => {
    setIsNavBarCollapsed(!isNavBarCollapsed);
  };

  const getChatData = async () => {
    setInitialMessagesLoaded(false);
    if (chatId!==-1) {
      const response = await fetch('/api/get_chat_data'+"/"+chatId);
      const data : GetChatDataResponse = await response.json();
      setChatName("Chat with: " + data.chat_name);
      setInitialMessages(data.messages);
      setInitialMessagesLoaded(true);
    }
    else {
      setChatName("No Chats Found. Start One in the Friends Tab!");

    }
  };

  const setChatDetailsFunc = async (chatId: number) => {
    setChatId(chatId);
  };

  useEffect(() => {
    getChatData();
  }, [chatId]);



  return (
    <ChatPageContextProvider value={{ csrfToken: csrfToken }}>

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
          // getChatsUrl={getChatsUrl}
          getFriendInfoUrl={getFriendInfoUrl}
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
            // width: '100%',
          }}
        >
          <TopBar
            chatName={chatName}
            chatId={chatId}
            homeUrl={homeUrl}
            exitChatUrl={exitChatUrl}
            logoutUrl={logoutUrl}
            csrfToken={csrfToken}
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
            getNewMessagesUrl={getNewMessagesUrl}
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
            sendMessageUrl={sendMessageUrl}
            chatId={chatId}
            csrfToken={csrfToken}
          />
        </Box>
      </Box>
    </Box>
    </ChatPageContextProvider>
  );
};

export default ChatPage;
