import React, { useState, useEffect, useRef } from 'react';
import { Stack, Box } from '@mantine/core';
import MessageContainer from './MessageContainer';

interface Message {
  id: number;
  sender: string;
  createdAt: string;
  text: string;
  messageNumber: number;
}

interface MessagesContainerProps {
  initialMessages: Message[];
  chatId: number | string;
  getNewMessagesUrl: string;
}

const MessagesContainer: React.FC<MessagesContainerProps> = ({
  initialMessages,
  chatId,
  getNewMessagesUrl
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  console.log("last initial message: ", initialMessages[initialMessages.length - 1]);
  const [lastMessageNumber, setLastMessageNumber] = useState<number>(
    initialMessages.length > 0 ? initialMessages[initialMessages.length - 1].messageNumber : 0
  );
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Scroll to bottom on initial load
  useEffect(() => {
    scrollToBottom();
  }, []);

  // Fetch new messages
  useEffect(() => {
    let isMounted = true;
    const fetchNewMessages = async () => {
      if (!isMounted) return;
      try {
        console.log('Fetching messages with URL:', `${getNewMessagesUrl}?chat_pk=${chatId}&last_message_number=${lastMessageNumber}`);

        const response = await fetch(
          `${getNewMessagesUrl}?chat_pk=${chatId}&last_message_number=${lastMessageNumber}`
        );
        const data = await response.json();
        console.log('Response data:', data);
        if (data.last_message_number > lastMessageNumber) {
          setLastMessageNumber(data.last_message_number);
        }
        else { return; }
        // Only process messages if the last message number has increased      
        // Create new messages by mapping through the arrays
        const newMessages = data.messages.map((message: any) => ({
          id: message.id,
          sender: message.sender,
          createdAt: message.created_at,
          text: message.text,
          messageNumber: message.message_number,
        }));
        // Add new messages to the state
        setMessages(prevMessages => [...prevMessages, ...newMessages]);
        // Scroll to bottom if new message is from this user
        if (data.new_message_this_user) {
          scrollToBottom();
        }
      } catch (error) {
        console.error('Error fetching new messages:', error);
        // Log more details about the error
        if (error instanceof Error) {
          console.error('Error details:', error.message);
        }
      } finally {
        if (isMounted) {
          setTimeout(fetchNewMessages, 250);
        }
      }
    };

    fetchNewMessages();

    // Cleanup on unmount
    return () => {
      // Clear any pending timeouts
      isMounted = false;
    };
  });

  return (
    <Box
      ref={containerRef}
      style={{
        height: '100%',
        overflowY: 'auto',
        padding: '1rem',

      }}
    >
      <Stack
      gap="0.8rem"
      >
        {messages.map((message) => (
          <MessageContainer
            key={message.id}
            sender={message.sender}
            createdAt={message.createdAt}
            text={message.text}
            messageNumber={message.messageNumber}
          />
        ))}
        {/* Hidden span to store last message number
        Is this needed if we are storing in the state?
        */}

      </Stack>
    </Box>
  );
};

export default MessagesContainer;