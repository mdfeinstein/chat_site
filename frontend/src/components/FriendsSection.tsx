import {
  Paper,
  ScrollArea,
  Stack,
  Text,
  Accordion,
  ActionIcon,
  Select,
  Menu,
  Button
} from "@mantine/core";
import { use, useEffect, useState } from "react";
import React from "react";
import { IconInnerShadowTopRightFilled, IconXboxXFilled } from "@tabler/icons-react";
import { urls } from "../urls";
import { useChatPageContext } from "./ChatPage";

export interface FriendData {
  status: "friend" | "requestedByUser" | "requestedByOther";
  name: string;
  online: boolean;
}

export interface RequestableUserData {
  name: string;
  pk: number;
}

const FriendsSection = ({ friendsData }: { friendsData: FriendData[] }) => {
  const [requestableUsers, setRequestableUsers] = useState<
    RequestableUserData[]
  >([]);

  let onlineFriends: FriendData[] = [];
  let offlineFriends: FriendData[] = [];
  let friendRequests: FriendData[] = [];
  let friendInvites: FriendData[] = [];

  const { csrfToken } = useChatPageContext();

  friendsData.forEach((friend: FriendData) => {
    if (friend.status === "friend") {
      if (friend.online) {
        onlineFriends.push(friend);
      } else {
        offlineFriends.push(friend);
      }
    } else if (friend.status === "requestedByUser") {
      friendRequests.push(friend);
    } else if (friend.status === "requestedByOther") {
      friendInvites.push(friend);
    }
  });

  const getRequestableUsers = async () => {
    const response = await fetch(urls.get_requestable_users);
    const data = await response.json();
    setRequestableUsers(data.users);
  };

  // const getFriendsData = async () => {
  //   const response = await fetch(urls.get_friend_info);
  //   const data = await response.json();
  //   setFriendData(data);
  // };

  const refreshFriendsSection = async () => {
    await getRequestableUsers();
    // await getFriendsData();
  };

  useEffect(() => {
    getRequestableUsers();
  }, []);

  const friendsElement = (
    <Accordion.Item key="friends" value="friends">
      <Accordion.Control>
        <Text fw={700} fz="lg" mb="0.5rem" ml="0.5rem">
          Friends
        </Text>
      </Accordion.Control>
      <Accordion.Panel>
        <ScrollArea h={400}>
          <Stack>
            {onlineFriends.map((friend: FriendData) => (
              <Paper
                key={friend.name}
                shadow="xl"
                p="md"
                withBorder
                radius="lg"
                mb="0rem"
              >
                <IconInnerShadowTopRightFilled color="green"></IconInnerShadowTopRightFilled>
                <Text fw={700} fz="md" mb="0.5rem">
                  {friend.name}
                </Text>
              </Paper>
            ))}
            {offlineFriends.map((friend: FriendData) => (
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
              </Paper>
            ))}
          </Stack>
        </ScrollArea>
      </Accordion.Panel>
    </Accordion.Item>
  );

  const requestUser = async (user: RequestableUserData) => {
    const response = await fetch(urls.request_friend, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify({ requested_user_pk: user.pk }),
    });
    const data = await response.json();
    console.log(data);
  };

  const cancelRequest = async (friend: FriendData) => {
    const response = await fetch(urls.cancel_request, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify({ requested_user_name: friend.name }),
    });
    const data = await response.json();
    console.log(data);
  };

  const [selectedUser, setSelectedUser] = useState<RequestableUserData>(
    {name: "", pk: -1}
  );
  const requestsElement = (
    <Accordion.Item key="requests" value="requests">
      <Accordion.Control>
        <Text fw={700} fz="lg" mb="0.5rem" ml="0.5rem">
          Requests
        </Text>
      </Accordion.Control>
      <Accordion.Panel>
        <Menu>
          <Menu.Target>
            <Button fz="md" p="lg">New Friend Request</Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Select
              placeholder="Select User"
              data={requestableUsers.map(
                (user: RequestableUserData) => user.name
              )}
              value={selectedUser.name}
              onChange={(value) => setSelectedUser(
                requestableUsers.find((user: RequestableUserData) => user.name === value!)!
              )}
              searchable
              />
              <Button
              onClick={() => requestUser(selectedUser)}
              >Send</Button>
          </Menu.Dropdown>

        </Menu>
        <ScrollArea h={400}>
          <Stack>
            {friendRequests.map((friend: FriendData) => (
              <Paper
                key={friend.name}
                shadow="xl"
                p="md"
                withBorder
                radius="lg"
                mb="0rem"
                style={{
                  display: "flex",
                  flexDirection: "row",
                }}
              >
                <Text fw={700} fz="md" c="red.8" mb="0.5rem">
                  {friend.name}
                </Text>
                <ActionIcon color="red" size="lg" ml="md"
                onClick={() => cancelRequest(friend)}
                ><IconXboxXFilled /></ActionIcon>
              </Paper>
            ))}
          </Stack>
        </ScrollArea>
      </Accordion.Panel>
    </Accordion.Item>
  );

  const invitesElement = (
    <Accordion.Item key="invites" value="invites">
      <Accordion.Control>
        <Text fw={700} fz="lg" mb="0.5rem" ml="0.5rem">
          Invites
        </Text>
      </Accordion.Control>
      <Accordion.Panel>
        <ScrollArea h={200}>
          <Stack>
            {friendInvites.map((friend: FriendData) => (
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
                <ActionIcon color="red" size="lg"></ActionIcon>
              </Paper>
            ))}
          </Stack>
        </ScrollArea>
      </Accordion.Panel>
    </Accordion.Item>
  );

  return (
    <Accordion defaultValue="friends">
      {[friendsElement, requestsElement, invitesElement]}
    </Accordion>
  );
};

export default FriendsSection;
