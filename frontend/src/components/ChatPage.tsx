import React, { use } from "react";
import { useState, useEffect, createContext, useContext } from "react";
import { ChatPageContextProvider, useChatPageContext } from "./ChatPageContext";
import { Box, Burger } from "@mantine/core";
import MessagesContainer from "./MessagesContainer";
import TopBar from "./TopBar";
import SendMessageForm from "./SendMessageForm";
import CollapsibleNavBar from "./CollapsibleNavBar";
import useChatsWithHistory from "./useChatsWithHistory";
import useUserSocket from "./useUserSocket";

interface ChatPageProps {}

const ChatPage: React.FC<ChatPageProps> = ({}) => {
  const { token, chatUser } = useChatPageContext();
  const userSocket = useUserSocket(token!);
  const {
    data: chatsData,
    isLoading: chatsLoading,
    isError: chatsError,
  } = useChatsWithHistory(token!, 0);
  const [chatId, setChatId] = useState<number>(-1);
  const [initialized, setInitialized] = useState<boolean>(false);

  const [isNavBarCollapsed, setIsNavBarCollapsed] = useState<boolean>(true);
  const toggleNavBar = () => {
    setIsNavBarCollapsed(!isNavBarCollapsed);
  };

  const setChatDetailsFunc = (chatId: number) => {
    setChatId(chatId);
  };

  useEffect(() => {
    if (initialized || !chatsData || chatsData.chats.length === 0) return;
    setChatId(chatsData.chats[0].chat_id);
    setInitialized(true);
  }, [chatsData, initialized, setChatId]);

  // useEffect(() => {
  //   updateUserInfo();
  // }, []);

  return (
    // <ChatPageContextProvider value={{ token: token, chatUser: userInfo }}>

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
        // cursor: initialMessagesLoaded ? "default" : "wait",
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
          <TopBar chatId={chatId} setChatDetailsFunc={setChatDetailsFunc} />
        </Box>

        {/* MessagesContainer - 70% height */}
        <Box
          bg="linear-gradient(#f4adad, #befbff)"
          style={{
            height: "80vh",
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <MessagesContainer chatId={chatId} />
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
          <SendMessageForm chatId={chatId} />
        </Box>
      </Box>
    </Box>
    // </ChatPageContextProvider>
  );
};

export default ChatPage;
