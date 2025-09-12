import { useChatPageContext } from "./ChatPageContext";
import { sendMessage } from "../api/api";
import type { NewMessageRequest } from "../api/api";
import React, { useState } from "react";
import { Button, Textarea, Box, TextInput, ActionIcon, Tooltip } from "@mantine/core";
import { IconSend2} from "@tabler/icons-react";

interface SendMessageFormProps {
  chatId: number;
}

const SendMessageForm: React.FC<SendMessageFormProps> = ({ chatId }) => {
  const { token } = useChatPageContext();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  return (
    <Box

    style={{
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      height: '10vh',
      boxSizing: 'border-box',
      alignItems: "center",
    }}
    >
      <Textarea
        placeholder="Type message here..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!message.trim()) {
              return;
            }
            const data: NewMessageRequest = {
              text: message,
            };
            sendMessage(data, chatId, token!).then((response) => {
              if (response.success) {
                setMessage("");
              } else {
                setError(response.message);
              }
            });
          }}}
        required
        error={!!error}
        p={5}
        m={2}
        w={"90%"}
        h={"100%"}
        styles={{
          wrapper: {
            height : "100%"
          },
          input : {
            height : "100%"
          }
        }}

      />
      <Tooltip label={"Send Message"} position="top" withArrow>
      <ActionIcon
        
        p={5}
        mr={10}
        style = {{
          width:"10%",
          height:"90%",
        }}
        onClick={async () => {
          if (!message.trim()) {
            return;
          }
          const data: NewMessageRequest = {
            text: message,
          };
          const response = await sendMessage(data, chatId, token!);
          if (response.success) {
            setMessage("");
          } else {
            setError(response.message);
          }
        }}
        disabled={!message.trim()}
      >
        <IconSend2 style={{
          width:"100%",
          height:"100%",
        }}/>
      </ActionIcon>
      </Tooltip>
    </Box>
  );
};

export default SendMessageForm;