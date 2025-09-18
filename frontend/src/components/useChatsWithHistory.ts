import {useQuery, useQueryClient} from "@tanstack/react-query";
import { getChatsWithHistory } from "../api/api";
import type { GetChatsWithHistoryResponse, MessageResponse } from "../api/api";


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
  
  const ingestNewMessagesToChat = (messages : MessageResponse[], chatId : number) => {
    //messages will get sorted into the designated chat in the correct order
    //sort messages by most recent last in case the socket presents a diffeent order
    messages.sort((a, b) => b.message_number - a.message_number);
    console.log(messages);
    queryClient.setQueryData(['chatsWithHistory'], (old : GetChatsWithHistoryResponse) => {
      const targetChatIdx = old.chats.findIndex(chat => chat.chat_id === chatId);
      console.log(targetChatIdx);
      if (targetChatIdx === -1) return old; //chat not found, do nothing
      const oldMessages = old.chats[targetChatIdx].last_messages ?? [];
      const merged = [...messages, ...oldMessages];
      old.chats[targetChatIdx].last_messages = merged;
      console.log(old);
      // TODO: sort by createdAt. will need some date math tool.
      // old.chats.sort((a, b) => b.last_messages[0].createdAt - a.last_messages[0].createdAt);
      return old;
    });
  }

  return {...query, refetch: query.refetch, invalidate, ingestNewMessagesToChat};
  };

export default useChatsWithHistory;