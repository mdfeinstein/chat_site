import {useQuery, useQueryClient} from "@tanstack/react-query";
import { getChatData } from "../api/api";
import type { GetChatDataResponse } from "../api/api";
import { useUserSocketContext } from "./UserSocketContext";
import { useEffect } from "react";

let handlersRegistered = false;

const useChatData = (chatId: number, token: string, refreshTime: number) => {
  const queryClient = useQueryClient();
  // hook up socket event to invalidate query
  const {registerHandler, removeHandler} = useUserSocketContext();
  const onChatListChange = () => {
    queryClient.invalidateQueries({ queryKey: ['chatData'] });
  };
  useEffect(() => {
    if (!handlersRegistered) {
      registerHandler("chat_list_change", onChatListChange);
      handlersRegistered = true;
    }
    return () => {
      removeHandler("chat_list_change", onChatListChange);
      handlersRegistered = false;
    };
  }, [registerHandler, removeHandler]);
  
  const query =  useQuery({
    queryKey: ['chatData', chatId],
    queryFn: async () => {
      const newData = await getChatData(chatId, token);
      return newData;
      },
      refetchInterval: refreshTime,
      enabled: chatId != null && chatId !== -1,
    });
  
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['chatData', chatId] });
  };

  return {...query, refetch: query.refetch, invalidate};
};

export default useChatData;