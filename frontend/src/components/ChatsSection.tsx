import { Paper, ScrollArea, Stack, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import React from "react";
import type { GetChatWithHistoryResponse, GetChatsWithHistoryResponse } from "../api/api";
import { getChatsWithHistory } from "../api/api";

export interface ChatData {
  id: number;
  name: string;
  link: string;
  lastMessages: string[];
  lastMessagesAuthors: string[];
  lastMessagesDates: string[];
}

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

export interface ChatsSectionProps {
  setChatDetailsFunc: (chatId: number) => void;
  selectedChatId: number;
}

const ChatsSection = ({
  setChatDetailsFunc,
  selectedChatId,
}: ChatsSectionProps) => {

  const [hoveredChatId, setHoveredChatId]=useState<number|null>(null);
  const [chatData, setChatData] = useState<GetChatsWithHistoryResponse>({chats: []});

  const updateChatData = async () => {
    const data = await getChatsWithHistory();
    setChatData(data);
  };

  useEffect(() => {
    updateChatData();
    const interval = setInterval(() => {
    updateChatData();
    }, 4000);

    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  return (
    <ScrollArea
    h={600}
    type="always"
    scrollbarSize={8}
    style={{
      // height: "100%",
      flex: 1,
      minHeight: 0,
    }}
    >
      <Stack
      >

        {chatData.chats.map((chat) => (
          <Paper
            onMouseEnter={() => setHoveredChatId(chat.chat_id)}
            onMouseLeave={() => setHoveredChatId(null)}
            onClick={setChatDetailsFunc.bind(null, chat.chat_id)}
            key={chat.chat_id}
            shadow="xl"
            p="md"
            withBorder
            radius="lg"
            mb="0rem"
            style={{
              cursor: "pointer",
              backgroundColor: chat.chat_id === selectedChatId ? "#f4adadff" :  hoveredChatId === chat.chat_id ? "#fff2f2" : "#ffffff",
            }}
          >
              
            <Text fw={700} fz="lg" c="red.8" mb="0.5rem">
              {chat.chat_name}
            </Text>
              <ScrollArea
              h={100}
              >
              {chat.last_messages.map((msg) => (
                <>
                <Text fz="sm" c="dimmed">
                  {msg.sender} • {formatDate(msg.createdAt)}
                </Text>
                <Text fz="md" c="dimmed">
                  {msg.text}
                </Text>
                </>

              ))}
              </ScrollArea>
          </Paper>
        ))}
      </Stack>
    </ScrollArea>
  );
};

export default ChatsSection;
