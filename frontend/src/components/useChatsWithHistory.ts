import {useQuery, useQueryClient} from "@tanstack/react-query";
import { getChatsWithHistory } from "../api/api";
import type { GetChatsWithHistoryResponse } from "../api/api";

interface ChatsWithHistoryData {
  chats: GetChatsWithHistoryResponse["chats"];
}

const useChatsWithHistory = (token: string, refreshTime: number) => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ['chatsWithHistory'],
    queryFn: async () => {
      const newData = await getChatsWithHistory(token);
      return newData;
      },
      refetchInterval: refreshTime,
    });
  };

export default useChatsWithHistory;