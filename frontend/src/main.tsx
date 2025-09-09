import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { mantineTheme } from "./theme.ts";
// import './index.css'
// import App from './App.tsx'
// import SendMessageButton from './components/SendMessageButton';
// import SendMessageForm from './components/SendMessageForm';
// import MessagesContainer from './components/MessagesContainer';
// import TopBar from './components/TopBar';

import ChatPage from './components/ChatPage';

// Define the interface at module level for reuse
interface Message {
  id: number;
  sender: string;
  createdAt: string;
  text: string;
  messageNumber: number;
  isNew?: boolean;
}

function formatDate(isoStr: string) {
  const date = new Date(isoStr);
  return date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    month: "numeric",
    day: "numeric",
    year: "numeric"
  });
}

const parseInitialMessages = (): Message[] => {
  const messagesContainer = document.querySelector("#react-chat-page");
  if (!messagesContainer) return [];
  
  const messages: Message[] = [];
  const messageElements = messagesContainer.querySelectorAll('.message');
  
  messageElements.forEach((messageEl, index) => {
    // Try to get the message data
    try {
      const text = messageEl.getAttribute('data-text') || '';
      const sender = messageEl.getAttribute('data-sender') || '';
      const createdAt = messageEl.getAttribute('data-created-at') || '';
      const messageNumber = parseInt(messageEl.getAttribute('data-message-number') || '0', 10);
      
      // Add message with consistent property names
      messages.push({
        id: index,
        sender,
        createdAt: formatDate(createdAt),
        text,
        messageNumber, // Match the interface property name
        isNew: false,
      });
    } catch (error) {
      console.error('Error parsing message element:', error);
    }
  });

  return messages;
};

const mountChatPage = () => {
  const chatPage = document.getElementById('react-chat-page');
  if (chatPage) {
    const chatId = chatPage.getAttribute('data-chat-id') || '';
    const homeUrl = chatPage.getAttribute('data-home-url') || '';
    const exitChatUrl = chatPage.getAttribute('data-exit-chat-url') || '';
    const logoutUrl = chatPage.getAttribute('data-logout-url') || '';
    const csrfToken = chatPage.getAttribute('data-csrf-token') || '';
    const initialMessages = parseInitialMessages();
    console.log('Initial messages:', initialMessages);
    
    const root = createRoot(chatPage);
    root.render(
      <MantineProvider theme={mantineTheme}>
      <StrictMode>
        <ChatPage
          chatId_initial={chatId}
          homeUrl={homeUrl}
          exitChatUrl={exitChatUrl}
          logoutUrl={logoutUrl}
          csrfToken={csrfToken}
        />
      </StrictMode>
      </MantineProvider>
    );
  }
};

document.addEventListener('DOMContentLoaded', () => {
  mountChatPage();
});

// const mountMessageContainer = () => {
//   const chatContainer = document.getElementById('chat-container');
//   if (chatContainer) {
//     const initialMessages = parseInitialMessages();
//     console.log('Initial messages:', initialMessages);
//     const chatId = chatContainer.getAttribute('data-chat-id') || '';
//     const getNewMessagesUrl = chatContainer.getAttribute('data-get-new-messages-url') || '';

//     const root = createRoot(chatContainer);
//     root.render(
//       <MantineProvider theme={mantineTheme}>
//       <StrictMode>
//         <MessagesContainer 
//           initialMessages={initialMessages} 
//           chatId={chatId}
//           getNewMessagesUrl={getNewMessagesUrl}
//         />
//       </StrictMode>
//       </MantineProvider>
//     );
//   }
// };

// // Initialize both components
// document.addEventListener('DOMContentLoaded', () => {
//   mountMessageContainer();
//   mountTopBar();
// });
// // Find the mount point in the HTML
// const mountPoint = document.getElementById('react-message-form');

// if (mountPoint) {
//   // Get data attributes
//   const sendMessageUrl = mountPoint.getAttribute('data-url') || '';
//   const chatId = mountPoint.getAttribute('data-chat-id') || '';
  
//   // Get CSRF token from within mountPoint
//   const csrfTokenElement = mountPoint.querySelector('input[name="csrfmiddlewaretoken"]');
//   const csrfToken = csrfTokenElement?.getAttribute('value') || '';

//   // Create React root and render component
//   const root = createRoot(mountPoint);
//   root.render(
//     <MantineProvider theme={mantineTheme}>
//     <StrictMode>
//       <SendMessageForm 
//         sendMessageUrl={sendMessageUrl} 
//         chatId={chatId}
//         csrfToken={csrfToken}
//       />
//     </StrictMode>
//     </MantineProvider>
//   );
// }

// // mount the TopBar component
// const mountTopBar = () => {
//   const topbarMount = document.getElementById('react-topbar');
//   if (topbarMount) {
//     const chatName = topbarMount.getAttribute('data-chat-name') || '';
//     const chatId = topbarMount.getAttribute('data-chat-id') || '';
//     const homeUrl = topbarMount.getAttribute('data-home-url') || '';
//     const exitChatUrl = topbarMount.getAttribute('data-exit-chat-url') || '';
//     const logoutUrl = topbarMount.getAttribute('data-logout-url') || '';
//     const csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]')?.getAttribute('value') || '';

//     const root = createRoot(topbarMount);
//     root.render(
//       <MantineProvider theme={mantineTheme}>
//       <StrictMode>
//         <TopBar 
//           chatName={chatName}
//           chatId={chatId}
//           homeUrl={homeUrl}
//           exitChatUrl={exitChatUrl}
//           logoutUrl={logoutUrl}
//           csrfToken={csrfToken}
//         />
//       </StrictMode>
//       </MantineProvider>
//     );
//   }
// };