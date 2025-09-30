
//hook that handles the is_typing event from useUserSocket

import { useQueryClient } from "@tanstack/react-query";
import { useUserSocketContext } from "./UserSocketContext";
import type { WebSocketEvent } from "./useUserSocket";
import { useEffect, useRef, useState } from "react";

let handlersRegistered = false;
const useIsTyping = (chatId: number) => {
  const {registerHandler, removeHandler} = useUserSocketContext();
  const [typingUsers, setTypingUsers] = useState<number[]>([]);
  const timeoutRefs = useRef<Map<number, NodeJS.Timeout>>(new Map());

  const onIsTyping = (event: WebSocketEvent) => {
    if (event.type !== "is_typing") return; //this shouldnt be relevant, but doing this to narrow the type
    const {user_id, chat_id} = event.payload!;
    console.log("chat_id", chat_id);
    if (chat_id !== chatId) return; //
    // Clear existing timeout for this user if it exists
    if (timeoutRefs.current.has(user_id)) {
      clearTimeout(timeoutRefs.current.get(user_id)!);
    }
    //add user to typing list if not already there
    setTypingUsers((old : number[]) => {
      if (!old.includes(user_id)) {
        return [...old, user_id];
      }
      return old; // User already in list, don't add again
    });
    //set and refresh timeouts
    const timeoutId = setTimeout(() => {
      setTypingUsers((old : number[]) => {
        return old.filter((user) => user !== user_id);
      });
      timeoutRefs.current.delete(user_id);
    }, 2000);
    timeoutRefs.current.set(user_id, timeoutId);
  };
  //register handler with socket event bus
  useEffect(() => {
    if (!handlersRegistered) {
      registerHandler("is_typing", onIsTyping);
      handlersRegistered = true;
    }
    return () => {
      removeHandler("is_typing", onIsTyping);
      handlersRegistered = false;
      timeoutRefs.current.forEach((timeoutId) => clearTimeout(timeoutId));
      timeoutRefs.current.clear();
    };
  }, [registerHandler, removeHandler, chatId]);

  return {typingUsers};
};

export default useIsTyping;