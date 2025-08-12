import React from 'react';
import { Text, Paper, Group, Box } from '@mantine/core';

interface MessageProps {
  sender: string;
  createdAt: string;
  text: string;
  messageNumber: number;
}

const MessageContainer: React.FC<MessageProps> = ({ sender, createdAt, text }) => {
  // Format the date if needed
  const formattedDate = new Date(createdAt).toLocaleString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return (
    <Paper 
      shadow="xl" 
      p="md" 
      withBorder
      radius="lg"
      mb="0rem"
      style={{
        borderWidth: "6px",
      }}

    >
      <Group mb={5}>
        <Text fw={700} fz="md" c="red.8" mb="0.5rem">{sender}</Text>
        <Text fz="xs" c="dimmed">{formattedDate}</Text>
      </Group>
      <Box pl={5}>
        <Text>
          {text.split('\n').map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < text.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
        </Text>
      </Box>
    </Paper>
  );
};

export default MessageContainer;