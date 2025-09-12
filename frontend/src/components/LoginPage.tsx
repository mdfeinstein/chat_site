import {
  Anchor,
  Button,
  Checkbox,
  Container,
  Group,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import classes from './AuthenticationTitle.module.css';
import { useChatPageContext } from './ChatPageContext';
import { useState } from 'react';
import { obtainAuthToken, getUserInfo } from '../api/api';

const LoginPage : React.FC = () => {
  const { setToken, setChatUser } = useChatPageContext();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    const response = await obtainAuthToken({username: username, password: password});
    if ("token" in response) {
      setToken(response.token);
      const userInfo = await getUserInfo(response.token);
      setChatUser(userInfo);
      setErrorMessage(null);
    }
    else {
      setErrorMessage("Invalid username or password");
    }
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" className={classes.title}>
        Welcome back!
      </Title>

      <Text className={classes.subtitle}>
        Do not have an account yet? <Anchor>Create account</Anchor>
      </Text>

      <Paper withBorder shadow="sm" p={22} mt={30} radius="md">
        <TextInput 
        label="Username" 
        placeholder="Username"
        required 
        radius="md"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        />
        <PasswordInput
        label="Password" 
        placeholder="Your password" 
        required 
        mt="md"
        radius="md"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleLogin();
          }
        }}
        />
        <Group justify="space-between" mt="lg">
          <Checkbox label="Remember me" />
          <Anchor component="button" size="sm">
            Forgot password?
          </Anchor>
        </Group>
        <Button 
        fullWidth mt="xl"
        radius="md"
        onClick={handleLogin}
        >
          Sign in
        </Button>
        {errorMessage && <Text color="red" fz="sm">{errorMessage}</Text>}
      </Paper>
    </Container>
  );
}

export default LoginPage;