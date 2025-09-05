import {
  Paper,
  ScrollArea,
  Stack,
  Text,
  Accordion,
  ActionIcon,
  Select,
  Menu,
  Button,
  Tooltip,
  Box,
  Chip
} from "@mantine/core";
import { use, useEffect, useState } from "react";
import React from "react";
import {
  IconInnerShadowTopRightFilled,
  IconXboxXFilled,
  IconUserCheck,
  IconUserX,
  IconSend2,
  IconMessageCirclePlus
} from "@tabler/icons-react";

import { getFriendData } from "../api/api";
import type { GetFriendDataResponse } from "../api/api";
import { useChatPageContext } from "./ChatPage";
import { urls } from "../urls";

export interface FriendData {
  status: "friend" | "requestedByUser" | "requestedByOther";
  name: string;
  online: boolean;
}

export interface RequestableUserData {
  name: string;
  pk: number;
}

const FriendsSection = () => {
  const [requestableUsers, setRequestableUsers] = useState<
    RequestableUserData[]
  >([]);
  const [onlineFriends, setOnlineFriends] = useState<FriendData[]>([]);
  const [offlineFriends, setOfflineFriends] = useState<FriendData[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendData[]>([]);
  const [friendInvites, setFriendInvites] = useState<FriendData[]>([]);

  const getFriendsData = async () => {
    const response = await fetch(urls.get_friend_info);
    const friendsData = await response.json();
    let onlineFriends: FriendData[] = [];
    let offlineFriends: FriendData[] = [];
    let friendRequests: FriendData[] = [];
    let friendInvites: FriendData[] = [];
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
    setOnlineFriends(onlineFriends);
    setOfflineFriends(offlineFriends);
    setFriendRequests(friendRequests);
    setFriendInvites(friendInvites);
  };

  useEffect(() => {
    getFriendsData();
  }, []);

  const { csrfToken } = useChatPageContext();

  const getRequestableUsers = async () => {
    const response = await fetch(urls.get_requestable_users);
    const data = await response.json();
    setRequestableUsers(data.users);
  };

  const refreshFriendsSection = async () => {
    await getRequestableUsers();
    await getFriendsData();
  };

  useEffect(() => {
    getRequestableUsers();
  }, []);

  const add_chat = async (user_names: string[]) => {
    const response = await fetch(urls.add_chat, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify({ requested_user_names: user_names }),
    });
    const data = await response.json();
    console.log(data);
    await refreshFriendsSection();
  };

  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
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
            <Chip.Group multiple value={selectedFriends} onChange={setSelectedFriends}>
            {onlineFriends.map((friend: FriendData) => (
              <Box
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                >
              <IconInnerShadowTopRightFilled color="green"/>
              <Chip
                key={friend.name}
                value={friend.name}
                radius="xs"
                width="100%"
              >
                <Text fw={700} fz="md" mb="0.5rem">
                  {friend.name}
                </Text>
              </Chip>
            </Box>
            ))}
            {offlineFriends.map((friend: FriendData) => (
              <Box
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
              <IconInnerShadowTopRightFilled color="red"/>
              <Chip
                key={friend.name}
                value={friend.name}
                radius="xs"
              >
                <Text fw={700} fz="md" mb="0.5rem">
                  {friend.name}
                </Text>
              </Chip>
            </Box>
            ))}
            </Chip.Group>
          </Stack>
        </ScrollArea>
        <Button
          leftSection={<IconMessageCirclePlus />}
          onClick={() => add_chat(selectedFriends)}
          >
            Create Chat
        </Button>
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
    await refreshFriendsSection();
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
    await refreshFriendsSection();
  };

  const [selectedUser, setSelectedUser] = useState<RequestableUserData>({
    name: "",
    pk: -1,
  });

  const [sendRequestMenuOpened, setSendRequestMenuOpened] =
    useState<boolean>(false);
  const requestsElement = (
    <Accordion.Item key="requests" value="requests">
      <Accordion.Control>
        <Text fw={700} fz="lg" mb="0.5rem" ml="0.5rem">
          Requests ({friendRequests.length})
        </Text>
      </Accordion.Control>
      <Accordion.Panel>
        <Box 
          style={{
            display : 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
        <Select
          placeholder="Select User"
          data={requestableUsers.map(
            (user: RequestableUserData) => user.name
          )}
          value={selectedUser.name}
          searchable
          onChange={(value) =>
            setSelectedUser(
              requestableUsers.find(
                (user: RequestableUserData) => user.name === value!
              )!
            )
          }
        />
        <Tooltip label="Send Request" position="bottom" withArrow>
        <ActionIcon
          onClick={() => {
            requestUser(selectedUser);
            setSendRequestMenuOpened(false);
          }}
        >
          <IconSend2/>
        </ActionIcon>
        </Tooltip>
        </Box>
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
                <Tooltip label="Cancel Request" position="bottom" withArrow>
                <ActionIcon
                  color="red"
                  size="lg"
                  ml="md"
                  onClick={() => cancelRequest(friend)}
                >
                  <IconXboxXFilled />
                </ActionIcon>
                </Tooltip>
              </Paper>
            ))}
          </Stack>
        </ScrollArea>
      </Accordion.Panel>
    </Accordion.Item>
  );

  const acceptInvite = async (friend: FriendData) => {
    const response = await fetch(urls.accept_invite, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify({ requesting_user_name: friend.name }),
    });
    const data = await response.json();
    console.log(data);
    await refreshFriendsSection();
  };

  const rejectInvite = async (friend: FriendData) => {
    const response = await fetch(urls.reject_invite, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify({ requesting_user_name: friend.name }),
    });
    const data = await response.json();
    console.log(data);
    await refreshFriendsSection();
  };

  const invitesElement = (
    <Accordion.Item key="invites" value="invites">
      <Accordion.Control>
        <Text fw={700} fz="lg" mb="0.5rem" ml="0.5rem">
          Invites ({friendInvites.length})
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
                style={{
                  display: "flex",
                  flexDirection: "row",
                }}
              >
                <Text fw={700} fz="md" mb="0.5rem">
                  {friend.name}
                </Text>
                <Tooltip label="Accept Invite" position="bottom" withArrow>
                <ActionIcon color="green" size="lg" ml="xs"
                onClick={() => acceptInvite(friend)}
                >
                  <IconUserCheck />
                </ActionIcon>
                </Tooltip>
                <Tooltip label="Reject Invite" position="bottom" withArrow>
                <ActionIcon color="red" size="lg" ml="xs"
                onClick={() => rejectInvite(friend)}
                >
                  <IconUserX />
                </ActionIcon>
                </Tooltip>
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
