import {useQuery, useQueryClient} from "@tanstack/react-query";
import { getMessages } from "../api/api";
import type { MessageResponse } from "../api/api";
import { useUserSocketContext } from "./UserSocketContext";
import type { WebSocketEvent } from "./useUserSocket";
import { useEffect } from "react";


export interface ChatMessagesData {
  messages: MessageResponse[];
  lastMessageNumber: number;
  prevLastMessageNumber: number;
}

let handlersRegistered = false;

const useChatMessages = (chatId: number, token: string, refreshTime: number) => {
  const queryClient = useQueryClient();
  const { registerHandler, removeHandler } = useUserSocketContext();
  const onNewMessage = (event: WebSocketEvent) => {
    // push to specific chat cache, if intiialized
    if (event.type !== "chat_message") return; //this shouldnt be relevant, but doing this to narrow the type
    const {chat_id, message} = event.payload!;
    if (queryClient.getQueryData(['messages', chat_id])) {
      queryClient.setQueryData(['messages', chat_id], (old : ChatMessagesData) => {
        old.messages.push(message);
        old.prevLastMessageNumber = old.lastMessageNumber;
        old.lastMessageNumber = message.message_number;
        return old;
      });            
    }
  };
  useEffect(() => {
    if (!handlersRegistered) {
      registerHandler("chat_message", onNewMessage);
      handlersRegistered = true;
    }
    return () => {
      removeHandler("chat_message", onNewMessage);
      handlersRegistered = false;
    };
  }, [registerHandler, removeHandler]);

  const query = useQuery({
    queryKey: ['messages', chatId],
    queryFn: async () => {
      const cached = queryClient.getQueryData<ChatMessagesData>(['messages', chatId]);
      const lastMessageNumber = cached?.lastMessageNumber ?? -1;
      const newMessages = await getMessages(chatId, lastMessageNumber + 1, -1, token);
      queryClient.setQueryData(['messages', chatId], (old : {lastMessageNumber: number, messages: MessageResponse[]} | undefined) => {
        const oldMessages = old?.messages ?? [];
        const merged = [...oldMessages, ...newMessages];
        return {
          messages: merged,
          lastMessageNumber: merged[merged.length - 1]?.message_number ?? -1,
          prevLastMessageNumber: lastMessageNumber,
        };
      });
      return queryClient.getQueryData<ChatMessagesData>(['messages', chatId]);
      },
      refetchInterval: refreshTime,
      enabled: chatId != null && chatId !== -1,
    });
    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
    };

    const ingestMessages = (messages: MessageResponse[]) => {
      queryClient.setQueryData(['messages', chatId], (old : {lastMessageNumber: number, messages: MessageResponse[]} | undefined) => {
        const oldMessages = old?.messages ?? [];
        const merged = [...oldMessages, ...messages];
        return {
          messages: merged,
          lastMessageNumber: messages[messages.length - 1]?.message_number ?? -1,
          prevLastMessageNumber: old?.lastMessageNumber ?? -1,
        };
      });
    };

    return {...query, refetch: query.refetch, invalidate, ingestMessages};
  };

export default useChatMessages;