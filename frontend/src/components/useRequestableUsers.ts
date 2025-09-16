import {useQuery, useQueryClient} from "@tanstack/react-query";
import { getRequestableUsers } from "../api/api";
import { get } from "http";
import type { use } from "react";

const useRequestableUsers = (token: string, refreshTime: number) => {
  const queryClient = useQueryClient();
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