import {useQuery, useQueryClient} from "@tanstack/react-query";
import { getMessages } from "../api/api";
import type { MessageResponse } from "../api/api";

interface ChatMessagesData {
  messages: MessageResponse[];
  lastMessageNumber: number;
  prevLastMessageNumber: number;
}

const useChatMessages = (chatId: number, token: string, refreshTime: number) => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['messages', chatId],
    queryFn: async () => {
      const cached = queryClient.getQueryData<ChatMessagesData>(['messages', chatId]);
      const lastMessageNumber = cached?.lastMessageNumber ?? -1;
      const newMessages = await getMessages(chatId, lastMessageNumber + 1, -1, token);
      queryClient.setQueryData(['messages', chatId], (old : {lastMessageNumber: number, messages: MessageResponse[]} | undefined) => {
        const oldMessages = old?.messages ?? [];
        const merged = [...oldMessages, ...newMessages];
        return {
          messages: merged,
          lastMessageNumber: merged[merged.length - 1]?.message_number ?? -1,
          prevLastMessageNumber: lastMessageNumber,
        };
      });
      return queryClient.getQueryData<ChatMessagesData>(['messages', chatId]);
      },
      refetchInterval: refreshTime,
    });
    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
    };

    return {...query, refetch: query.refetch, invalidate};
  };

export default useChatMessages;