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
import type { GetFriendDataResponse, ChatUserMinimal, ChatUsersMinimal, 
  SuccessResponse, ErrorResponse
 } from "../api/api";
import {
  sendFriendRequest,
  cancelFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  createChat,
  getRequestableUsers,
} from "../api/api";
import { useChatPageContext } from "./ChatPage";


const FriendsSection = () => {
  const [requestableUsers, setRequestableUsers] = useState<
    ChatUsersMinimal
  >({usernames: []});
  const [friendData, setFriendData] = useState<GetFriendDataResponse>({
    online_friends: [],
    offline_friends: [],
    requested_users: [],
    invited_by: [],
  });

  const updateFriendData = async () => {
    const data = await getFriendData();
    setFriendData(data);
  };

  const { csrfToken } = useChatPageContext();

  const updateRequestableUsers = async () => {
    const data = await getRequestableUsers();
    setRequestableUsers(data);
  };

  const refreshFriendsSection = async () => {
    await updateRequestableUsers();
    await updateFriendData();
  };

  useEffect(() => {
    refreshFriendsSection();
    const interval = setInterval(() => {
    refreshFriendsSection();
  }, 2000);

  return () => clearInterval(interval); // cleanup on unmount
  
  }, []);


  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const addNewChatClicked = async () => {
    let response: SuccessResponse | ErrorResponse;
    if (selectedFriends.length === 0) { //display error?
      response = {success: false, message: "No users selected. Not sent to server."};
    }
    else {
      response = await createChat({usernames: selectedFriends}, csrfToken);
    }
    if (response.success) {
      setSelectedFriends([]);
      // do we want to also switch to new chat? will need to pass setChatId to this component as prop if so. or get it from context, which is probaly reasonable. 
    }
    else {
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
              {friendData.online_friends.map((friend) => (
                <Box
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
              {friendData.offline_friends.map((friend) => (
                <Box
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
          }
        }
        >
          Create Chat
        </Button>
      </Accordion.Panel>
    </Accordion.Item>
  );

  const sendRequest = async (friend_name: string) => {
    const friend: ChatUserMinimal = { username: friend_name };
    await sendFriendRequest(friend, csrfToken);
    await refreshFriendsSection();
  };

  const cancelRequest = async (friend_name: string) => {
    const friend: ChatUserMinimal = { username: friend_name };
    await cancelFriendRequest(friend, csrfToken);
    await refreshFriendsSection();
  };


  const [selectedUser, setSelectedUser] = useState<string | null>(
    null
  );

  const [sendRequestMenuOpened, setSendRequestMenuOpened] =
    useState<boolean>(false);

  const requestsElement = (
    <Accordion.Item key="requests" value="requests">
      <Accordion.Control>
        <Text fw={700} fz="lg" mb="0.5rem" ml="0.5rem">
          Requests ({friendData.requested_users.length})
        </Text>
      </Accordion.Control>
      <Accordion.Panel>
        <Box
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Select
            placeholder="Select User"
            data={requestableUsers.usernames}
            value={selectedUser ?? null}
            defaultValue={null}
            searchable
            onChange={(value) =>
              setSelectedUser(
                requestableUsers.usernames.find(
                  (username) => username === value!
                ) || null
              )
            }
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
        <ScrollArea h={400}>
          <Stack>
            {friendData.requested_users.map((friend) => (
              <Paper
                key={friend.username}
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
                  {friend.username}
                </Text>
                <Tooltip label="Cancel Request" position="bottom" withArrow>
                  <ActionIcon
                    color="red"
                    size="lg"
                    ml="md"
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
      </Accordion.Panel>
    </Accordion.Item>
  );

  const acceptRequest = async (friend_name: string) => {
    const friend: ChatUserMinimal = { username: friend_name };
    await acceptFriendRequest(friend, csrfToken);
    await refreshFriendsSection();
  };

  const rejectRequest = async (friend_name: string) => {
    const friend: ChatUserMinimal = { username: friend_name };
    await rejectFriendRequest(friend, csrfToken);
    await refreshFriendsSection();
  };

  const invitesElement = (
    <Accordion.Item key="invites" value="invites">
      <Accordion.Control>
        <Text fw={700} fz="lg" mb="0.5rem" ml="0.5rem">
          Invites ({friendData.invited_by.length})
        </Text>
      </Accordion.Control>
      <Accordion.Panel>
        <ScrollArea h={200}>
          <Stack>
            {friendData.invited_by.map((friend) => (
              <Paper
                key={friend.username}
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
                  {friend.username}
                </Text>
                <Tooltip label="Accept Invite" position="bottom" withArrow>
                  <ActionIcon
                    color="green"
                    size="lg"
                    ml="xs"
                    onClick={() => acceptRequest(friend.username)}
                  >
                    <IconUserCheck />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Reject Invite" position="bottom" withArrow>
                  <ActionIcon
                    color="red"
                    size="lg"
                    ml="xs"
                    onClick={() => rejectRequest(friend.username)}
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
