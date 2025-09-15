import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { mantineTheme } from "./theme.ts";
import AuthGate from "./components/AuthGate";

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


const mountChatPage = () => {
  const chatPage = document.getElementById('react-chat-page');
  if (chatPage) {
    const root = createRoot(chatPage);
    root.render(
      <MantineProvider theme={mantineTheme}>
      <StrictMode>
        <AuthGate />
      </StrictMode>
      </MantineProvider>
    );
  }
};

document.addEventListener('DOMContentLoaded', () => {
  mountChatPage();
});