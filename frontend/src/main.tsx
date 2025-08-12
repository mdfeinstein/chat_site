import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { mantineTheme } from "./theme.ts";
// import './index.css'
// import App from './App.tsx'
// import SendMessageButton from './components/SendMessageButton';
import SendMessageForm from './components/SendMessageForm';
import MessagesContainer from './components/MessagesContainer';

// Define the interface at module level for reuse
interface Message {
  id: number;
  sender: string;
  createdAt: string;
  text: string;
  messageNumber: number;
}

const parseInitialMessages = (): Message[] => {
  const messagesContainer = document.querySelector('.chat-container');
  if (!messagesContainer) return [];
  
  const messages: Message[] = [];
  const messageElements = messagesContainer.querySelectorAll('.message');
  
  messageElements.forEach((messageEl, index) => {
    // Try to get the message data
    try {
      const messageLine = messageEl.querySelector('li')?.textContent || '';
      const [senderPart, datePart] = messageLine.split(':');
      const sender = senderPart?.trim() || 'Unknown';
      const createdAt = datePart?.trim() || new Date().toISOString();
      const text = messageEl.innerHTML
        .split('<br>')[1]?.split('<span')[0]?.replace('</li>', '') || '';

      // Extract message number from the last message
      const spanEl = messageEl.querySelector('#message-number');
      if (!spanEl) {
        console.warn('Missing message number element for message', index);
        return; // Skip this iteration
      }
      
      const messageNumber = parseInt(spanEl.getAttribute('data-message-number') || '0', 10);
      
      // Add message with consistent property names
      messages.push({
        id: index,
        sender,
        createdAt,
        text,
        messageNumber // Match the interface property name
      });
    } catch (error) {
      console.error('Error parsing message element:', error);
    }
  });

  return messages;
};


const mountMessageContainer = () => {
  const chatContainer = document.getElementById('chat-container');
  if (chatContainer) {
    const initialMessages = parseInitialMessages();
    console.log('Initial messages:', initialMessages);
    const chatId = chatContainer.getAttribute('data-chat-id') || '';
    const getNewMessagesUrl = chatContainer.getAttribute('data-get-new-messages-url') || '';

    const root = createRoot(chatContainer);
    root.render(
      <MantineProvider theme={mantineTheme}>
      <StrictMode>
        <MessagesContainer 
          initialMessages={initialMessages} 
          chatId={chatId}
          getNewMessagesUrl={getNewMessagesUrl}
        />
      </StrictMode>
      </MantineProvider>
    );
  }
};

// Initialize both components
document.addEventListener('DOMContentLoaded', () => {
  mountMessageContainer();
});
// Find the mount point in the HTML
const mountPoint = document.getElementById('react-message-form');

if (mountPoint) {
  // Get data attributes
  const sendMessageUrl = mountPoint.getAttribute('data-url') || '';
  const chatId = mountPoint.getAttribute('data-chat-id') || '';
  
  // Get CSRF token from within mountPoint
  const csrfTokenElement = mountPoint.querySelector('input[name="csrfmiddlewaretoken"]');
  const csrfToken = csrfTokenElement?.getAttribute('value') || '';

  // Create React root and render component
  const root = createRoot(mountPoint);
  root.render(
    <MantineProvider theme={mantineTheme}>
    <StrictMode>
      <SendMessageForm 
        sendMessageUrl={sendMessageUrl} 
        chatId={chatId}
        csrfToken={csrfToken}
      />
    </StrictMode>
    </MantineProvider>
  );
}