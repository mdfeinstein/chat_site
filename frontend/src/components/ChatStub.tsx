import { Paper, ScrollArea, Text, Box, Group } from "@mantine/core";
import { useEffect, useState } from "react";
import type { GetChatWithHistoryResponse } from "../api/api";
import useChatSocket from "./useChatSocket";
import useChatsWithHistory from "./useChatsWithHistory";
import { useChatPageContext } from "./ChatPageContext";

const formatDate = (createdAt: string) => {
  // Format the date if needed

  return new Date(createdAt).toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

interface ChatStubProps {
  chat: GetChatWithHistoryResponse;
  setChatDetailsFunc: (chatId: number) => void;
  selectedChatId: number;
}

const ChatStub: React.FC<ChatStubProps> = ({
  chat,
  setChatDetailsFunc,
  selectedChatId,
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const { token } = useChatPageContext();
  // const { messages: socketMessages, flushMessages } = useChatSocket(
  //   chat.chat_id,
  //   token!
  // );
  // const { ingestNewMessagesToChat } = useChatsWithHistory(token!, 0);
  const [newMessageCount, setNewMessageCount] = useState<number>(0);

  // useEffect(() => {
  //   if (socketMessages && socketMessages.length > 0) {
  //     const messages = flushMessages();
  //     console.log(messages);
  //     // chat.last_messages = [...messages, ...chat.last_messages];
  //     ingestNewMessagesToChat(messages, chat.chat_id);
  //     if (selectedChatId !== chat.chat_id) {
  //       setNewMessageCount((oldCount) => oldCount + messages.length);
  //     }
  //     console.log("done updating");
  //   }
  // }, [socketMessages]);

  const onSelectChat = () => {
    setChatDetailsFunc(chat.chat_id);
    setNewMessageCount(0);
  };

  return (
    <Paper
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelectChat}
      key={chat.chat_id}
      shadow="xl"
      p="md"
      withBorder
      radius="lg"
      mb="0rem"
      style={{
        cursor: "pointer",
        backgroundColor:
          chat.chat_id === selectedChatId
            ? "#f4adadff"
            : isHovered
            ? "#fff2f2"
            : newMessageCount > 0
            ? "#befbff"
            : "#ffffff",
      }}
    >
      <Text fw={700} fz="lg" c="red.8" mb="0.5rem">
        {chat.chat_name +
          (newMessageCount > 0 ? " (" + newMessageCount + ")" : "")}
      </Text>
      <ScrollArea h={100}>
        {chat.last_messages.map((msg) => {
          return (
            <Paper
              key={msg.id}
              m={0}
              p={".05rem"}
              withBorder
              radius="md"
              shadow="xl"
            >
              <Group align="top" wrap="nowrap" justify="flex-start" gap={"xs"}>
                <Text fz="sm" c="dimmed">
                  {msg.sender}
                </Text>
                <Text fz="sm" c="dimmed">
                  {formatDate(msg.createdAt)}
                </Text>
              </Group>
              <Text fz="md" c="red.8">
                {msg.text}
              </Text>
            </Paper>
          );
        })}
      </ScrollArea>
    </Paper>
  );
};

export default ChatStub;
