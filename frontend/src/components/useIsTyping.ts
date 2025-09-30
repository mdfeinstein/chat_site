
//hook that handles the is_typing event from useUserSocket

import { useQueryClient } from "@tanstack/react-query";
import { useUserSocketContext } from "./UserSocketContext";
import type { WebSocketEvent } from "./useUserSocket";
import { useEffect, useRef, useState } from "react";
// tracks chatIds that have registered handlers
const handlersRegistered : Set<number> = new Set();
type UserPair = {user_id: number, user_name: string};

const useIsTyping = (chatId: number) => {
  const {registerHandler, removeHandler} = useUserSocketContext();
  const [typingUsers, setTypingUsers] = useState<UserPair[]>([]);
  const timeoutRefs = useRef<Map<number, NodeJS.Timeout>>(new Map());

  const onIsTyping = (event: WebSocketEvent) => {
    if (event.type !== "is_typing") return; //this shouldnt be relevant, but doing this to narrow the type
    const {user_id, chat_id, user_name} = event.payload!;
    console.log("chat_id", chat_id);
    if (chat_id !== chatId) return; //
    if (user_name === undefined) return; //
    // Clear existing timeout for this user if it exists
    if (timeoutRefs.current.has(user_id)) {
      clearTimeout(timeoutRefs.current.get(user_id)!);
    }
    //add user to typing list if not already there
    setTypingUsers((old)=>{
      const existingIndex = old.findIndex(user => user.user_id === user_id);
      if (existingIndex === -1) {
        return [...old, {user_id, user_name}];
      }
      return old; // User already exists
    })
    //set and refresh timeouts
    const timeoutId = setTimeout(() => {
      setTypingUsers((old) => {
        return old.filter(user => user.user_id !== user_id);
      });
      timeoutRefs.current.delete(user_id);
    }, 2000);
    timeoutRefs.current.set(user_id, timeoutId);
  };
  //register handler with socket event bus
  useEffect(() => {
    if (!handlersRegistered.has(chatId)) {
      registerHandler("is_typing", onIsTyping);
      handlersRegistered.add(chatId);
    }
    return () => {
      removeHandler("is_typing", onIsTyping);
      handlersRegistered.delete(chatId);
      timeoutRefs.current.forEach((timeoutId) => clearTimeout(timeoutId));
      timeoutRefs.current.clear();
    };
  }, [registerHandler, removeHandler, chatId]);

  return {typingUsers};
};

export default useIsTyping;