import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import SendMessageButton from './components/SendMessageButton';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

const rootEl = document.getElementById("react-send-message");
if (rootEl) {
  const sendMessageUrl = rootEl.getAttribute("data-url") || "";
  const chatId = rootEl.getAttribute("data-chat-id") || "";
  const message = rootEl.getAttribute("data-message") || "";

  createRoot(rootEl).render(
    <SendMessageButton
      sendMessageUrl={sendMessageUrl}
      chatId={chatId}
      message={message}
    />
  );
}