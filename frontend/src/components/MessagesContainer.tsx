import React, { useState, useEffect, useRef, useContext } from 'react';
import { Stack, Box, ScrollArea } from '@mantine/core';
import MessageContainer from './MessageContainer';
import { ScrollToBottomButton } from './ScrollToBottomButton';
import { getMessages } from '../api/api';
import type { MessageResponse } from '../api/api';
import { useChatPageContext } from "./ChatPageContext";

export interface Message {
  message: MessageResponse;
  isNew?: boolean;
}

interface MessagesContainerProps {
  initialMessages: Message[];
  initialMessagesLoaded: boolean;
  chatId: number;
}

const MessagesContainer: React.FC<MessagesContainerProps> = ({
  initialMessages,
  initialMessagesLoaded,
  chatId
}) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  // console.log("last initial message: ", initialMessages[initialMessages.length - 1]);
  const [lastMessageNumber, setLastMessageNumber] = useState<number>(
    initialMessages.length > 0 ? initialMessages[initialMessages.length - 1].message.message_number : 0
  );
  const [scrolledToBottom, setScrolledToBottom] = useState<boolean>(true);

  // Get the user info from the context
  const { token, chatUser } = useChatPageContext();

  const lastMessageNumberRef=useRef<number>(lastMessageNumber);
  useEffect(()=>{
    lastMessageNumberRef.current=lastMessageNumber;
  },[lastMessageNumber]);
  
  useEffect(() => {
    setMessages(initialMessages);
    setLastMessageNumber(initialMessages.length > 0 ? initialMessages[initialMessages.length - 1].message.message_number : 0);
    scrollToBottom();
  }, [chatId, initialMessages]);

  
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
  
  const fetchNewMessagesOnce = async () => {
    if (chatId===-1) return;
    // console.log("fetch with last message number: ", lastMessageNumberRef.current);

    const data = await getMessages(chatId, lastMessageNumberRef.current + 1, -1, token!);
    if (!data ||  data.length === 0) return;
    // console.log("checking last message number before setting: ", data.last_message_number);
    else if (data[data.length - 1].message_number > lastMessageNumberRef.current) {
      setLastMessageNumber(data[data.length - 1].message_number);
    }
    else { return; }
    // Only process messages if the last message number has increased      
    // Create new messages by mapping through the arrays
    let thisUserInMessages = false;
    const newMessages = data.map((message) => {
      console.log("message author: ", message.sender);
      console.log("chat user username: ", chatUser!.username);
      if (message.sender === chatUser!.username) {
        console.log("this user in messages");
        thisUserInMessages = true;
      }
      return {
      message: message,
      isNew: true,
    };
  }
  );

    // Add new messages to the state
    setMessages(prevMessages => [...prevMessages, ...newMessages]);
    //scroll to bottom if new message is from this user
    if (thisUserInMessages || scrolledToBottom ) {
      scrollToBottom();
    }
  };


  // Fetch new messages
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;
    if (!initialMessagesLoaded) return;
    const fetchNewMessagesLoop = async () => {
      if (!isMounted || !initialMessagesLoaded) return;
      try {
        await fetchNewMessagesOnce();

      } catch (error) {
        console.error('Error fetching new messages:', error);
        // Log more details about the error
        if (error instanceof Error) {
          console.error('Error details:', error.message);
        }
      } finally {
        if (isMounted && initialMessagesLoaded) {
          timeoutId = setTimeout(fetchNewMessagesLoop, 250);
        }
      }
    };

    if (initialMessagesLoaded) {
      fetchNewMessagesLoop();
    }

    // Cleanup on unmount
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [initialMessagesLoaded, lastMessageNumber]);

  return (
    <ScrollArea
      viewportRef={containerRef}
      // h="80vh"
      w="90%"
      onScrollPositionChange={(position) => {
        if (containerRef.current) {
          const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
          const tolerance = 5;
          if (scrollHeight - scrollTop - clientHeight <= tolerance) {
            if (!scrolledToBottom) //only switch if needed to avoid adding to render queue
              setScrolledToBottom(true);
        } else {
          if (scrolledToBottom) //only switch if needed to avoid adding to render queue
            setScrolledToBottom(false);
        }
      }}}
      style={{
        padding: '0rem',
        margin: '0 auto',
        cursor: initialMessagesLoaded ? "default" : "wait",
      }}
    >
      <Stack
      gap="0.8rem"
      >
        {messages.map((message) => (
          <MessageContainer
            key={message.message.message_number}
            sender={message.message.sender}
            createdAt={message.message.createdAt}
            text={message.message.text}
            messageNumber={message.message.message_number}
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
        opacity: scrolledToBottom ? 0.1 : 1
      }}
      />

    </ScrollArea>
  );
};

export default MessagesContainer;