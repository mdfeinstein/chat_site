// UserSocketContext.tsx
import React, { createContext, useContext } from "react";
import useUserSocket from "./useUserSocket";

const UserSocketContext = createContext<ReturnType<
  typeof useUserSocket
> | null>(null);

export const UserSocketProvider: React.FC<{
  token: string;
  children: React.ReactNode;
}> = ({ token, children }) => {
  const socketStuff = useUserSocket(token); // Only one instance here!
  return (
    <UserSocketContext.Provider value={socketStuff}>
      {children}
    </UserSocketContext.Provider>
  );
};

export const useUserSocketContext = () => {
  const ctx = useContext(UserSocketContext);
  if (!ctx)
    throw new Error(
      "useUserSocketContext must be used within UserSocketProvider"
    );
  return ctx;
};
