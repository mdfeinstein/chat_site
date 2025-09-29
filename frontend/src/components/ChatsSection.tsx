import { Paper, ScrollArea, Stack, Text, Box } from "@mantine/core";
import { useEffect, useState, Fragment } from "react";
import React from "react";
import type {
  GetChatWithHistoryResponse,
  GetChatsWithHistoryResponse,
} from "../api/api";
import { getChatsWithHistory } from "../api/api";
import { useChatPageContext } from "./ChatPageContext";
import useChatsWithHistory from "./useChatsWithHistory";
import ChatStub from "./ChatStub";

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
  const [hoveredChatId, setHoveredChatId] = useState<number | null>(null);
  const { token } = useChatPageContext();
  const { data: chatsData } = useChatsWithHistory(token!, 0);

  return (
    <ScrollArea
      h={"90vh"}
      type="always"
      scrollbarSize={8}
      style={{
        // height: "100%",
        flex: 1,
        minHeight: 0,
      }}
    >
      <Stack>
        {chatsData?.chats?.map((chat) => (
          <ChatStub
            key={chat.chat_id}
            chat={chat}
            setChatDetailsFunc={setChatDetailsFunc}
            selectedChatId={selectedChatId}
          />
        ))}
      </Stack>
    </ScrollArea>
  );
};

export default ChatsSection;
