import React, { useState, useEffect, useRef } from 'react';
import { Stack, Box, ScrollArea } from '@mantine/core';
import MessageContainer from './MessageContainer';
import { ScrollToBottomButton } from './ScrollToBottomButton';

export interface Message {
  id: number;
  sender: string;
  createdAt: string;
  text: string;
  messageNumber: number;
  isNew?: boolean;
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
  const scrollToBottomInstant = () => {
    if (containerRef.current) {
      // Use requestAnimationFrame to ensure the scroll happens after DOM updates
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };
  

  const isScrolledToBottom: ()=>boolean = () => {
  if (containerRef.current) {
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    // Allow a small tolerance (1-5px) for rounding errors and browser inconsistencies
    const tolerance = 5;
    return scrollHeight - scrollTop - clientHeight <= tolerance;
  }
  return false;
  };

  const fetchNewMessagesOnce = async () => {
    const response = await fetch(
      `${getNewMessagesUrl}?chat_pk=${chatId}&last_message_number=${lastMessageNumber}`
    );
    const data = await response.json();
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
      isNew: true,
    }));
    // Add new messages to the state
    setMessages(prevMessages => [...prevMessages, ...newMessages]);
    //scroll to bottom if new message is from this user
    if (data.new_message_this_user || isScrolledToBottom() ) {
      scrollToBottom();
    }
  };

  // Scroll to bottom on initial load
  useEffect(() => {
    scrollToBottom();
  }, []);

  // Fetch new messages
  useEffect(() => {
    let isMounted = true;
    const fetchNewMessagesLoop = async () => {
      if (!isMounted) return;
      try {
        await fetchNewMessagesOnce();

      } catch (error) {
        console.error('Error fetching new messages:', error);
        // Log more details about the error
        if (error instanceof Error) {
          console.error('Error details:', error.message);
        }
      } finally {
        if (isMounted) {
          setTimeout(fetchNewMessagesLoop, 250);
        }
      }
    };

    fetchNewMessagesLoop();

    // Cleanup on unmount
    return () => {
      // Clear any pending timeouts
      isMounted = false;
    };
  });

  return (
    <ScrollArea
      viewportRef={containerRef}
      // h="80vh"
      w="90%"
      style={{
        padding: '0rem',
        margin: '0 auto',
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
            isNew={message.isNew}
          />
        ))}
      </Stack>

      <ScrollToBottomButton 
      onClick={scrollToBottomInstant}
      style={{
        position: 'fixed',
        bottom: "20%",
        right: "10%",
      }}
      />

    </ScrollArea>
  );
};

export default MessagesContainer;