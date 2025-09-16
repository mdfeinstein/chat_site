import React, { useState, useEffect, useRef, useContext, memo } from "react";
import { Stack, Box, ScrollArea } from "@mantine/core";
import MessageContainer from "./MessageContainer";
import { ScrollToBottomButton } from "./ScrollToBottomButton";
import { getMessages } from "../api/api";
import type { MessageResponse } from "../api/api";
import { useChatPageContext } from "./ChatPageContext";
import useChatMessages from "./useChatMessages";
import useChatSocket from "./useChatSocket";

export interface Message {
  message: MessageResponse;
  isNew?: boolean;
}

interface MessagesContainerProps {
  chatId: number;
}

const MessagesContainer: React.FC<MessagesContainerProps> = ({ chatId }) => {
  const [scrolledToBottom, setScrolledToBottom] = useState<boolean>(true);

  // Get the user info from the context
  const { token, chatUser } = useChatPageContext();
  const {
    data: messageQueryData,
    isLoading: messageQueryLoading,
    isError: messageQueryError,
  } = useChatMessages(chatId, token!, 250);

  const containerRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage } = useChatSocket(chatId);
  useEffect(() => {
    messages.forEach((message) => {
      console.log(message);
    });
  }, [messages]);

  // Function to scroll to bottom of messages
  const scrollToBottom = () => {
    if (containerRef.current) {
      // Use requestAnimationFrame to ensure the scroll happens after DOM updates
      requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      });
    }
  };
  const scrollToBottomInstant = () => {
    if (containerRef.current) {
      // Use requestAnimationFrame to ensure the scroll happens after DOM updates
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (!messageQueryData) return;
    scrollToBottomInstant();
  }, [chatId, messageQueryData?.lastMessageNumber]);

  return (
    <ScrollArea
      viewportRef={containerRef}
      // h="80vh"
      w="90%"
      onScrollPositionChange={(position) => {
        if (containerRef.current) {
          const { scrollTop, scrollHeight, clientHeight } =
            containerRef.current;
          const tolerance = 5;
          if (scrollHeight - scrollTop - clientHeight <= tolerance) {
            if (!scrolledToBottom)
              //only switch if needed to avoid adding to render queue
              setScrolledToBottom(true);
          } else {
            if (scrolledToBottom)
              //only switch if needed to avoid adding to render queue
              setScrolledToBottom(false);
          }
        }
      }}
      style={{
        padding: "0rem",
        margin: "0 auto",
        // cursor: initialMessagesLoaded ? "default" : "wait",
      }}
    >
      <Stack gap="0.8rem">
        {messageQueryData?.messages.map((message) => (
          <MessageContainer
            key={message.id}
            sender={message.sender}
            createdAt={message.createdAt}
            text={message.text}
            messageNumber={message.message_number}
            isNew={
              messageQueryData?.prevLastMessageNumber !== -1 &&
              message.message_number > messageQueryData?.prevLastMessageNumber
            }
          />
        ))}
      </Stack>

      <ScrollToBottomButton
        onClick={scrollToBottomInstant}
        style={{
          position: "fixed",
          bottom: "20%",
          right: "10%",
          opacity: scrolledToBottom ? 0.1 : 1,
        }}
      />
    </ScrollArea>
  );
};

export default MessagesContainer;
