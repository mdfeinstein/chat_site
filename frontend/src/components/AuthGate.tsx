import { useChatPageContext, ChatPageContextProvider } from "./ChatPageContext";
import { useEffect } from "react";
import ChatPage from "./ChatPage";
import LoginPage from "./LoginPage";

const AuthGateInner: React.FC = () => {
  const { token } = useChatPageContext();

  if (token === null) {
    return <LoginPage />;
  } else {
    return <ChatPage chatId_initial={-1} />;
  }
};

const AuthGate: React.FC = () => (
  <ChatPageContextProvider>
    <AuthGateInner />
  </ChatPageContextProvider>
);

export default AuthGate;