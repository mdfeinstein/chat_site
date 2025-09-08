// TopBar.tsx
import React from 'react';
import { Group, Button, Title, Box, Text } from '@mantine/core';
import { useChatPageContext } from './ChatPage';
import { userInfo } from 'os';

interface TopBarProps {
  chatName: string;
  chatId: string | number;
  homeUrl: string;
  exitChatUrl: string;
  logoutUrl: string;
  csrfToken: string;
}

const TopBar: React.FC<TopBarProps> = ({ 
  chatName, 
  chatId, 
  homeUrl, 
  exitChatUrl, 
  logoutUrl, 
  csrfToken 
}) => {
  const username = useChatPageContext().chatUser.username;
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
        <form method="post" action={exitChatUrl}>
          <input type="hidden" name="csrfmiddlewaretoken" value={csrfToken} />
          <input type="hidden" name="chat_pk" value={chatId} />
          <Button type="submit" variant="outline" color="blue">
            Exit Chat
          </Button>
        </form>

        <form method="post" action={logoutUrl}>
          <input type="hidden" name="csrfmiddlewaretoken" value={csrfToken} />
          <Button type="submit" variant="outline" color="red">
            Logout
          </Button>
        </form>
        <Text 
        size="xl"
        ta="center"
        style={{
          whiteSpace: 'pre-wrap',
        }}
        > Welcome{'\n'}{username} </Text>
      </Group>
    </Box>
  );
};

export default TopBar;