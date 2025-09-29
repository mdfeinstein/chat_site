import { useChatPageContext, ChatPageContextProvider } from "./ChatPageContext";
import { useEffect } from "react";
import ChatPage from "./ChatPage";
import LoginPage from "./LoginPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserSocketProvider } from "./UserSocketContext";

const AuthGateInner: React.FC = () => {
  const { token } = useChatPageContext();

  if (token === null) {
    return <LoginPage />;
  } else {
    return (
      <UserSocketProvider token={token!}>
        <ChatPage />
      </UserSocketProvider>
    );
  }
};

const queryClient = new QueryClient();

const AuthGate: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <ChatPageContextProvider>
      <AuthGateInner />
    </ChatPageContextProvider>
  </QueryClientProvider>
);

export default AuthGate;
