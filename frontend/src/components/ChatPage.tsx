import React from "react";
import { useState } from "react";
import { Box, Burger } from "@mantine/core";
import MessagesContainer from "./MessagesContainer";
import type { Message } from "./MessagesContainer";
import TopBar from "./TopBar";
import SendMessageForm from "./SendMessageForm";
import CollapsibleNavBar from "./CollapsibleNavBar";

interface ChatPageProps {
  chatName: string;
  chatId: number | string;
  homeUrl: string;
  exitChatUrl: string;
  logoutUrl: string;
  getNewMessagesUrl: string;
  initialMessages: Message[];
  sendMessageUrl: string;
  getChatsUrl: string;
  getFriendInfoUrl: string;
  csrfToken: string;
}

const ChatPage: React.FC<ChatPageProps> = ({
  chatName,
  chatId,
  homeUrl,
  exitChatUrl,
  logoutUrl,
  getNewMessagesUrl,
  initialMessages,
  sendMessageUrl,
  getChatsUrl,
  getFriendInfoUrl,
  csrfToken,
}) => {
  const [isNavBarCollapsed, setIsNavBarCollapsed] = useState<boolean>(true);
  const toggleNavBar = () => {
    setIsNavBarCollapsed(!isNavBarCollapsed);
  };

  return (
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
      }}
    >
      <Box
        style={{
          position: "absolute",
          transition: "width 0.5s ease",
          zIndex: 1,
          width: isNavBarCollapsed ? "5%" : "40%",
          height: "100%",
          backgroundColor: "#f5f5f5",
        }}
      >
        <CollapsibleNavBar
          collapser={toggleNavBar}
          getChatsUrl={getChatsUrl}
          getFriendInfoUrl={getFriendInfoUrl}
        />
      </Box>

      <Box
        style={{
          // display: 'flex',
          // flexDirection: 'column',
          position: "absolute",
          right: 0,
          width: "95%",
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
  );
};

export default ChatPage;
