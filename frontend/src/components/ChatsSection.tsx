import { Paper, ScrollArea, Stack, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import React from "react";


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

interface ChatsSectionProps {
  chatData: ChatData[];
  setChatDetailsFunc: (chatId: number) => void;
  selectedChatId: number;
}

const ChatsSection = ({
  chatData,
  setChatDetailsFunc,
  selectedChatId,
}: ChatsSectionProps) => {
  const [hoveredChatId, setHoveredChatId]=useState<number|null>(null);
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
        {chatData.map((chat) => (
          <Paper
            onMouseEnter={() => setHoveredChatId(chat.id)}
            onMouseLeave={() => setHoveredChatId(null)}
            onClick={setChatDetailsFunc.bind(null, chat.id)}
            key={chat.id}
            shadow="xl"
            p="md"
            withBorder
            radius="lg"
            mb="0rem"
            style={{
              cursor: "pointer",
              backgroundColor: chat.id === selectedChatId ? "#f4adadff" :  hoveredChatId === chat.id ? "#fff2f2" : "#ffffff",
            }}
          >
              
            <Text fw={700} fz="lg" c="red.8" mb="0.5rem">
              {chat.name}
            </Text>
              <ScrollArea
              h={100}
              >
              {chat.lastMessages.map((_, i) => (
                <>
                <Text fz="sm" c="dimmed">
                  {chat.lastMessagesAuthors[i]} • {formatDate(chat.lastMessagesDates[i])}
                </Text>
                <Text fz="md" c="dimmed">
                  {chat.lastMessages[i]}
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
