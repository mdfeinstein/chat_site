import {useQuery, useQueryClient} from "@tanstack/react-query";
import { getChatData } from "../api/api";
import type { GetChatDataResponse } from "../api/api";

const useChatData = (chatId: number, token: string, refreshTime: number) => {
  return useQuery({
    queryKey: ['chatData', chatId],
    queryFn: async () => {
      const newData = await getChatData(chatId, token);
      return newData;
      },
      refetchInterval: refreshTime,
    });
  };

export default useChatData;