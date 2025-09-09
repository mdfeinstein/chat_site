// TopBar.tsx
import React from 'react';
import { Group, Button, Title, Box, Text } from '@mantine/core';
import { useChatPageContext } from './ChatPage';
import { exitChat } from '../api/api';
import { userInfo } from 'os';
import { useMantineTheme } from '@mantine/core';

import {IconDoorExit, IconUserCancel} from '@tabler/icons-react';

interface TopBarProps {
  chatName: string;
  chatId: number;
}

const TopBar: React.FC<TopBarProps> = ({ 
  chatName, 
  chatId, 
}) => {
  const {chatUser, csrfToken} = useChatPageContext();

  const exitChatFunc = async () => {
    const response = await exitChat(chatId, csrfToken);
    if (response.success) {
      //navigate to different chat... need a func passed as a prop for this.
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
        {chatName}
      </Title>

      <Group 
        style={{
          display: 'flex',
          gap: '0.5rem',
        }}
      >

          <Button
          variant="outline"
          // gradient={{ from: 'red', to: 'darkred' }}
          onClick={exitChatFunc}
          color= {useMantineTheme().colors.red[8]}
          >
            Exit Chat
            <IconDoorExit/>
          </Button>

          <Button
            variant="outline"
            color= {useMantineTheme().colors.red[6]}
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
        > Welcome{'\n'}{chatUser.username} </Text>
      </Group>
    </Box>
  );
};

export default TopBar;