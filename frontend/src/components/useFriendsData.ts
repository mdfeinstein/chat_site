import {useQuery, useQueryClient} from "@tanstack/react-query";
import { getFriendData } from "../api/api";
import type { GetFriendDataResponse } from "../api/api";
import { useUserSocketContext } from "./UserSocketContext";
import { useEffect } from "react";

let handlersRegistered = false;

const useFriendsData = (token: string, refreshTime: number) => {
  const queryClient = useQueryClient();
  const {registerHandler, removeHandler} = useUserSocketContext();
  const onFriendsListChange = () => {
    invalidate();
  };

  useEffect(() => {
    if (!handlersRegistered) {
      registerHandler("friends_list_change", onFriendsListChange);
      handlersRegistered = true;
    }
    return () => {
      removeHandler("friends_list_change", onFriendsListChange);
      handlersRegistered = false;
    };
  }, [registerHandler, removeHandler]);
  
  const query =  useQuery({
    queryKey: ['friendsData'],
    queryFn: async () => {
      const newData = await getFriendData(token);
      return newData;
      },
      refetchInterval: refreshTime,
    });
  
    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: ['friendsData'] });
    };

    return {...query, refetch: query.refetch, invalidate};
  };

export default useFriendsData;