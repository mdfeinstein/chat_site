import { Paper, ScrollArea, Stack, Text } from "@mantine/core";
import { useEffect, useState } from "react";
import React from "react";

interface FriendData {
  status: "friend" | "requestedByUser" | "requestedByOther";
  name: string;
  online: boolean;
}

const FriendsSection = ({ friendData }: { friendData: FriendData[] }) => {
  return (
    <ScrollArea>
      <Stack>
        {friendData.map((friend) => (
          <Paper
            key={friend.name}
            shadow="xl"
            p="md"
            withBorder
            radius="lg"
            mb="0rem"
          >
            <Text fw={700} fz="md" c="red.8" mb="0.5rem">
              {friend.name}
            </Text>
            <Text fz="xs" c="dimmed">
              {friend.status}
            </Text>
          </Paper>
        ))}
      </Stack>
    </ScrollArea>
  );
};

export default FriendsSection;