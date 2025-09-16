import {useQuery, useQueryClient} from "@tanstack/react-query";
import { getChatsWithHistory } from "../api/api";
import type { GetChatsWithHistoryResponse } from "../api/api";


const useChatsWithHistory = (token: string, refreshTime: number) => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['chatsWithHistory'],
    queryFn: async () => {
      const newData = await getChatsWithHistory(token);
      return newData;
      },
      refetchInterval: refreshTime,
    });
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['chatsWithHistory'] });
  };

  return {...query, refetch: query.refetch, invalidate};
  };

export default useChatsWithHistory;