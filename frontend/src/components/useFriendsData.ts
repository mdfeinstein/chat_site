import {useQuery, useQueryClient} from "@tanstack/react-query";
import { getFriendData } from "../api/api";
import type { GetFriendDataResponse } from "../api/api";

const useFriendsData = (token: string, refreshTime: number) => {
  const queryClient = useQueryClient();
  const query =  useQuery({
    queryKey: ['chatsWithHistory'],
    queryFn: async () => {
      const newData = await getFriendData(token);
      return newData;
      },
      refetchInterval: refreshTime,
    });
  
    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: ['chatsWithHistory'] });
    };

    return {...query, refetch: query.refetch, invalidate};
  };

export default useFriendsData;