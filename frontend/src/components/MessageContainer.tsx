import React from "react";
import { Text, Paper, Group, Box } from "@mantine/core";
import { useState, useEffect } from "react";
import { useChatPageContext } from "./ChatPageContext";

interface MessageProps {
  sender: string;
  createdAt: string;
  text: string;
  messageNumber: number;
  isNew?: boolean;
}

const MessageContainer: React.FC<MessageProps> = ({
  sender,
  createdAt,
  text,
  isNew = false,
}) => {
  // Format the date if needed
  const formattedDate = new Date(createdAt).toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const [highlight, setHighlight] = useState(isNew);
  const { chatUser } = useChatPageContext();
  const isUser = chatUser?.username === sender;

  useEffect(() => {
    setHighlight(isNew);
    if (isNew) {
      setTimeout(() => {
        setHighlight(false);
      }, 1000);
    }
  }, [isNew]);

  return (
    <Paper
      shadow="xl"
      p="md"
      withBorder
      radius="lg"
      mb="0rem"
      mr={isUser ? "20%" : "0%"}
      ml={isUser ? "0%" : "20%"}
      // bg={isUser ? "#d96e95" : "#ffffff"}
      style={{
        borderWidth: "6px",
        backgroundColor: highlight ? "#ffa6a6ff" : undefined,
        transition: "background-color 7s ease", // Smooth transition back to normal
      }}
    >
      <Group mb={5}>
        <Text fw={700} fz="md" c="red.8" mb="0.5rem">
          {sender}
        </Text>
        <Text fz="xs" c="dimmed">
          {formattedDate}
        </Text>
      </Group>
      <Box pl={5}>
        <Text>
          {text.split("\n").map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < text.split("\n").length - 1 && <br />}
            </React.Fragment>
          ))}
        </Text>
      </Box>
    </Paper>
  );
};

export default MessageContainer;
