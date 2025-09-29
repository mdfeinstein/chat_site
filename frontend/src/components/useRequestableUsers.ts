import {useQuery, useQueryClient} from "@tanstack/react-query";
import { getRequestableUsers } from "../api/api";
import { useUserSocketContext } from "./UserSocketContext";
import { useEffect } from "react";

const useRequestableUsers = (token: string, refreshTime: number) => {
  const queryClient = useQueryClient();
  // hook up socket event to invalidate query
  const { registerHandler, removeHandler } = useUserSocketContext();
  const onFriendsListChange = () => {
    invalidate();
  };

  useEffect(() => {
    registerHandler("friends_list_change", onFriendsListChange);
    return () => {
      removeHandler("friends_list_change", onFriendsListChange);
    };
  }, [registerHandler, removeHandler]);

  const query =  useQuery({
    queryKey: ['requestableUsers'],
    queryFn: async () => {
      const newData = await getRequestableUsers(token);
      return newData;
      },
      refetchInterval: refreshTime,
    });
  
    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: ['requestableUsers'] });
    };

    return {...query, refetch: query.refetch, invalidate};
  };

export default useRequestableUsers;