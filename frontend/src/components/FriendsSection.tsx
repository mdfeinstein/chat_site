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
  Chip,
  useMantineTheme,
  Flex,
} from "@mantine/core";
import { use, useEffect, useState, useRef } from "react";
import React from "react";
import {
  IconInnerShadowTopRightFilled,
  IconXboxXFilled,
  IconUserCheck,
  IconUserX,
  IconSend2,
  IconMessageCirclePlus,
} from "@tabler/icons-react";

import { getFriendData } from "../api/api";
import type {
  GetFriendDataResponse,
  ChatUserMinimal,
  ChatUsersMinimal,
  SuccessResponse,
  ErrorResponse,
} from "../api/api";
import {
  sendFriendRequest,
  cancelFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  createChat,
  getRequestableUsers,
} from "../api/api";
import { useChatPageContext } from "./ChatPageContext";
import useFriendsData from "./useFriendsData";
import useRequestableUsers from "./useRequestableUsers";

const FriendsSection = () => {
  const theme = useMantineTheme();
  const { token } = useChatPageContext();
  const { data: friendsData, refetch: refetchFriendsData } = useFriendsData(
    token!,
    2000
  );
  const { data: requestableUsers, refetch: refetchRequestableUsers } =
    useRequestableUsers(token!, 2000);

  const refreshFriendsSection = async () => {
    refetchRequestableUsers();
    refetchFriendsData();
  };

  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const addNewChatClicked = async () => {
    let response: SuccessResponse | ErrorResponse;
    if (selectedFriends.length === 0) {
      //display error?
      response = {
        success: false,
        message: "No users selected. Not sent to server.",
      };
    } else {
      response = await createChat({ usernames: selectedFriends }, token!);
    }
    if (response.success) {
      setSelectedFriends([]);
      // do we want to also switch to new chat? will need to pass setChatId to this component as prop if so. or get it from context, which is probaly reasonable.
    } else {
      alert(response.message);
    }
  };

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
            <Chip.Group
              multiple
              value={selectedFriends}
              onChange={setSelectedFriends}
            >
              {friendsData?.online_friends?.map((friend) => (
                <Box
                  key={friend.id}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <IconInnerShadowTopRightFilled color="green" />
                  <Chip
                    key={friend.username}
                    value={friend.username}
                    radius="xs"
                    width="100%"
                  >
                    <Text fw={700} fz="md" mb="0.5rem">
                      {friend.username}
                    </Text>
                  </Chip>
                </Box>
              ))}
              {friendsData?.offline_friends?.map((friend) => (
                <Box
                  key={friend.id}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <IconInnerShadowTopRightFilled color="red" />
                  <Chip
                    key={friend.username}
                    value={friend.username}
                    radius="xs"
                  >
                    <Text fw={700} fz="md" mb="0.5rem">
                      {friend.username}
                    </Text>
                  </Chip>
                </Box>
              ))}
            </Chip.Group>
          </Stack>
        </ScrollArea>
        <Button
          leftSection={<IconMessageCirclePlus />}
          onClick={() => {
            addNewChatClicked();
          }}
        >
          Create Chat
        </Button>
      </Accordion.Panel>
    </Accordion.Item>
  );

  const sendRequest = async (friend_name: string) => {
    const friend: ChatUserMinimal = { username: friend_name };
    await sendFriendRequest(friend, token!);
    await refreshFriendsSection();
  };

  const cancelRequest = async (friend_name: string) => {
    const friend: ChatUserMinimal = { username: friend_name };
    await cancelFriendRequest(friend, token!);
    await refreshFriendsSection();
  };

  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const [sendRequestMenuOpened, setSendRequestMenuOpened] =
    useState<boolean>(false);

  const requestsElement = (
    <Accordion.Item key="requests" value="requests">
      <Accordion.Control>
        <Text fw={700} fz="lg" mb="0.5rem" ml="0.5rem">
          Requests ({friendsData?.requested_users?.length})
        </Text>
      </Accordion.Control>
      <Accordion.Panel>
        <Box
          w="100%"
          mb={10}
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.5rem",
          }}
        >
          <Select
            placeholder="Select User"
            data={requestableUsers?.usernames}
            value={selectedUser ?? null}
            defaultValue={null}
            searchable
            onChange={(value) =>
              setSelectedUser(
                requestableUsers?.usernames?.find(
                  (username) => username === value!
                ) || null
              )
            }
            style={{
              width: "90%",
            }}
          />
          <Tooltip label="Send Request" position="bottom" withArrow>
            <ActionIcon
              onClick={() => {
                if (selectedUser !== null) {
                  sendRequest(selectedUser);
                }
                setSendRequestMenuOpened(false);
                setSelectedUser(null);
              }}
            >
              <IconSend2 />
            </ActionIcon>
          </Tooltip>
        </Box>
        <Box bd={"2px solid " + theme.colors.gray[2]} bdrs={10}>
          <ScrollArea h={400} p={2}>
            <Stack gap="xs">
              {friendsData?.requested_users?.map((friend) => (
                <Paper
                  key={friend.id}
                  shadow="xl"
                  p="xs"
                  withBorder
                  radius="lg"
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text fw={700} fz="md" c="red.8" mb="0.5rem">
                    {friend.username}
                  </Text>
                  <Tooltip label="Cancel Request" position="bottom" withArrow>
                    <ActionIcon
                      color="red"
                      size="md"
                      onClick={(e) => {
                        cancelRequest(friend.username);
                      }}
                    >
                      <IconXboxXFilled />
                    </ActionIcon>
                  </Tooltip>
                </Paper>
              ))}
            </Stack>
          </ScrollArea>
        </Box>
      </Accordion.Panel>
    </Accordion.Item>
  );

  const acceptRequest = async (friend_name: string) => {
    const friend: ChatUserMinimal = { username: friend_name };
    await acceptFriendRequest(friend, token!);
    await refreshFriendsSection();
  };

  const rejectRequest = async (friend_name: string) => {
    const friend: ChatUserMinimal = { username: friend_name };
    await rejectFriendRequest(friend, token!);
    await refreshFriendsSection();
  };

  const invitesElement = (
    <Accordion.Item key="invites" value="invites">
      <Accordion.Control>
        <Text fw={700} fz="lg" mb="0.5rem" ml="0.5rem">
          Invites ({friendsData?.invited_by?.length})
        </Text>
      </Accordion.Control>
      <Accordion.Panel>
        <ScrollArea h={200}>
          <Stack>
            {friendsData?.invited_by?.map((friend) => (
              <Paper
                key={friend.id}
                shadow="xl"
                p="md"
                withBorder
                radius="lg"
                mb="0rem"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text fw={700} fz="md" mb="0.5rem">
                  {friend.username}
                </Text>
                <Flex justify={"flex-end"} align={"center"} gap={"xs"}>
                  <Tooltip label="Accept Invite" position="bottom" withArrow>
                    <ActionIcon
                      color="green"
                      size="lg"
                      onClick={() => acceptRequest(friend.username)}
                    >
                      <IconUserCheck />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Reject Invite" position="bottom" withArrow>
                    <ActionIcon
                      color="red"
                      size="lg"
                      onClick={() => rejectRequest(friend.username)}
                    >
                      <IconUserX />
                    </ActionIcon>
                  </Tooltip>
                </Flex>
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
