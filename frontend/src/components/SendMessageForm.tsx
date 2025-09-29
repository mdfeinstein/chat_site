import { useChatPageContext } from "./ChatPageContext";
import { sendMessage } from "../api/api";
import type { NewMessageRequest } from "../api/api";
import React, { useState } from "react";
import {
  Button,
  Textarea,
  Box,
  TextInput,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { IconSend2 } from "@tabler/icons-react";
import useChatMessages from "./useChatMessages";
import { useMutation } from "@tanstack/react-query";
import { send } from "process";

interface SendMessageFormProps {
  chatId: number;
}

const SendMessageForm: React.FC<SendMessageFormProps> = ({ chatId }) => {
  const { token } = useChatPageContext();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  // const { sendMessage: sendMessageChannel } = useChatSocket(chatId, token!);
  const { invalidate: invalidateMessages } = useChatMessages(chatId, token!, 0);
  const sendMessageMutation = useMutation({
    mutationFn: (data: NewMessageRequest) => sendMessage(data, chatId, token!),
    onSuccess: () => {
      setMessage("");
      invalidateMessages();
    },
    onError: (e) => {
      setError(e.message);
    },
  });

  const sendFunction = () => {
    if (!message.trim()) {
      return;
    }
    const data: NewMessageRequest = {
      text: message,
    };
    console.log("about to mutate...");
    sendMessageMutation.mutate({
      text: message,
    });
    // sendMessageChannel(message);
  };

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
        height: "10vh",
        boxSizing: "border-box",
        alignItems: "center",
      }}
    >
      <Textarea
        placeholder="Type message here..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            console.log("Enter pressed");
            e.preventDefault();
            console.log("about send...");
            sendFunction();
          }
        }}
        required
        error={!!error}
        p={5}
        m={2}
        w={"90%"}
        h={"100%"}
        styles={{
          wrapper: {
            height: "100%",
          },
          input: {
            height: "100%",
          },
        }}
      />
      <Tooltip label={"Send Message"} position="top" withArrow>
        <ActionIcon
          p={5}
          mr={10}
          style={{
            width: "10%",
            height: "90%",
          }}
          onClick={sendFunction}
          disabled={!message.trim()}
        >
          <IconSend2
            style={{
              width: "100%",
              height: "100%",
            }}
          />
        </ActionIcon>
      </Tooltip>
    </Box>
  );
};

export default SendMessageForm;
