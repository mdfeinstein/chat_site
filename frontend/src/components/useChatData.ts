import {useQuery, useQueryClient} from "@tanstack/react-query";
import { getChatData } from "../api/api";
import type { GetChatDataResponse } from "../api/api";

const useChatData = (chatId: number, token: string, refreshTime: number) => {
  const queryClient = useQueryClient();
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