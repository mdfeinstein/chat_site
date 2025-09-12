// TopBar.tsx
import React from 'react';
import { Group, Button, Title, Box, Text, Menu, Tooltip } from '@mantine/core';
import { useChatPageContext } from './ChatPageContext';
import { exitChat, getChatsWithHistory, revokeAuthToken } from '../api/api';
import type { GetChatDataResponse} from '../api/api';
import { userInfo } from 'os';
import { useMantineTheme } from '@mantine/core';

import {IconDoorExit, IconUserCancel} from '@tabler/icons-react';

interface TopBarProps {
  chatData: GetChatDataResponse;
  setChatDetailsFunc: (chatId: number) => void;
}

const TopBar: React.FC<TopBarProps> = ({ 
  chatData, 
  setChatDetailsFunc,
}) => {
  const {token, chatUser, setToken, setChatUser} = useChatPageContext();
  
  const logoutFunc = async () => {
    await revokeAuthToken(token!);
    setToken(null);
    setChatUser(null);
  };
  
  let usersRemaining : string[] = [];
  chatData.chat_usernames.forEach((username) => {
    if (!chatData.exited_chat_usernames.includes(username)) {
      usersRemaining.push(username);
    }
  });
  const exitedUsers = chatData.exited_chat_usernames;

  const exitChatFunc = async () => {
    const response = await exitChat(chatData.chat_id, token!);
    if (response.success) {
      const chats_data = await getChatsWithHistory(token!);
      setChatDetailsFunc(chats_data.chats[0].chat_id);
    }
    else {
      console.log(response.message);
    }
  };

  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        // height: '10vh',
        // minHeight: '50px',
        // maxHeight: '100px',
        background: '#f0f0f5',
        padding: '0 1rem',
        boxSizing: 'border-box',
        marginBottom: '0rem',
      }}
    >
      {/* <Button 
        variant="filled" 
        color="blue" 
        onClick={() => window.location.href = homeUrl}
      >
        Home
      </Button> */}

      <Title 
        order={2} 
        style={{
          color: '#2c2e33',
          fontWeight: 600,
          flexGrow: 1,
          textAlign: 'center',
        }}
      >
        <Group>
        <Text fz="xl"> Chat with: </Text>
        {usersRemaining.map((username) => (
          <Text fz="xl" key = {username}> {username} </Text>
        ))}
        {
        (exitedUsers.length > 0) && (
          <Tooltip label={exitedUsers.join(", ")}>
            <Text fz="lg" c="dimmed" ml="sm">
              {exitedUsers.length} exited
            </Text>
          </Tooltip>
        )
        }
        </Group>
      </Title>

      <Group 
        style={{
          display: 'flex',
          gap: '0.5rem',
        }}
      >
        <Menu>
          <Menu.Target>
          <Button
          variant="outline"
          // gradient={{ from: 'red', to: 'darkred' }}
          // onClick={exitChatFunc}
          color= {useMantineTheme().colors.red[8]}
          >
            Exit Chat
            <IconDoorExit/>
          </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label> Are you sure?</Menu.Label>
            <Menu.Item
              onClick={exitChatFunc}
              >Yes</Menu.Item>
            <Menu.Item color="red">No</Menu.Item>
          </Menu.Dropdown>
          </Menu>

          <Button
            variant="outline"
            color= {useMantineTheme().colors.red[6]}
            onClick={logoutFunc}
            >
            Logout
            <IconUserCancel/>
          </Button>
        <Text 
        size="xl"
        ta="center"
        style={{
          whiteSpace: 'pre-wrap',
        }}
        > Welcome{'\n'}{chatUser?.username} </Text>
      </Group>
    </Box>
  );
};

export default TopBar;