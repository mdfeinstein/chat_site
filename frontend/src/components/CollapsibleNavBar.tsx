import { useEffect, useState } from "react";
import {
  IconSwitchHorizontal,
  IconLogout,
  IconMessages,
  IconUsers,
  IconSettings,
  IconFileAnalytics,
  IconDatabaseImport,
  IconBellRinging,
  IconFingerprint,
  IconKey,
} from "@tabler/icons-react";
import {
  SegmentedControl,
  Text,
  Box,
  Group,
  NavLink,
  Stack,
  Burger,
} from "@mantine/core";
import { get } from "http";
import FriendsSection from "./FriendsSection";
import ChatsSection from "./ChatsSection";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { ActionIcon } from "@mantine/core";
import type { ChatData } from "./ChatsSection";
import type { FriendData } from "./FriendsSection";

const ArrowedMarginTab: React.FC<{
  isCollapsed: boolean;
  collapser: () => void;
}> = ({ isCollapsed, collapser }) => {
  const [hovered, setHovered] = useState<boolean>(false);

  return (
    <Box
      color="red"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={collapser}
      style={{
        position: "absolute",
        right: 0,
        // top: "50%",
        width: "40px",
        height: "100%",
        backgroundColor: hovered? "#ffbbbbff": "#ffe9e9ff",
        zIndex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
      }}
    >
      <ActionIcon color="#fe0000ff">
        {isCollapsed ? <IconArrowRight /> : <IconArrowLeft />}
      </ActionIcon>
    </Box>
  );
};

const CollapsibleNavBar = ({
  isCollapsed,
  collapser,
  getChatsUrl,
  getFriendInfoUrl,
  setChatDetailsFunc,
  selectedChatId,
}: {
  isCollapsed: boolean;
  collapser: () => void;
  getChatsUrl: string;
  getFriendInfoUrl: string;
  setChatDetailsFunc: (chatId: number) => void;
  selectedChatId: number;
}) => {
  const getChatsData = async () => {
    const response = await fetch(getChatsUrl);
    const data = await response.json();
    setChatData(data);
  };

  const getFriendsData = async () => {
    const response = await fetch(getFriendInfoUrl);
    const data = await response.json();
    setFriendData(data);
  };

  const [section, setSection] = useState<"Chats" | "Friends">("Chats");
  const [chatData, setChatData] = useState<ChatData[]>([]);
  const [friendData, setFriendData] = useState<FriendData[]>([]);

  const chatsElement = (
    <ChatsSection
      chatData={chatData!}
      setChatDetailsFunc={setChatDetailsFunc}
      selectedChatId={selectedChatId}
    />
  );
  const friendsElement = <FriendsSection friendsData={friendData!} />;
  useEffect(() => {
    getChatsData();
  }, []);
  useEffect(() => {
    getFriendsData();
  }, []);

  // Generate links based on the selected section
  const data = section === "Chats" ? chatData : friendData;
  // const chatsElement = <ChatsSection chatData={chatData!} />;
  // const friendsElement = <FriendsSection friendData={friendData!} />;

  const links = data?.map((item) => (
    <NavLink
      // key={item.id}
      label={item.name}
      component="a"
      // href={item.link}
      onClick={(event) => event.preventDefault()}
    />
  ));

  return (
    <Box style={{ display: "flex", flexDirection: "row" }}>
      <Box
        // component="nav"
        // onMouseEnter={collapser}
        // onMouseLeave={collapser}
        // onHoverEnd={collapser}
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "calc(100% - 40px)",
          // padding: '16px',
          borderRight: "1px solid #e9ecef",
        }}
      >
        <Box mb={20}>
          <SegmentedControl
            value={section}
            onChange={(value) => setSection(value as "Chats" | "Friends")}
            transitionTimingFunction="ease"
            fullWidth
            data={[
              { label: "Chats", value: "Chats" },
              { label: "Friends", value: "Friends" },
            ]}
          />
        </Box>

        <Box style={{
          flex: 1,             // Take available space
          minHeight: 0,        // Allow shrinking below content size
          overflow: 'hidden'   // Contain the scroll area
        }}>
          {section === "Chats" ? chatsElement : friendsElement}
        </Box>

        <Box mt="auto" pt={20}>
          <Stack gap="xs">
            <NavLink
              label="Change account"
              component="a"
              href="#"
              onClick={(event) => event.preventDefault()}
            />
            <NavLink
              label="Logout"
              component="a"
              href="#"
              onClick={(event) => event.preventDefault()}
            />
          </Stack>
        </Box>
      </Box>
      <ArrowedMarginTab isCollapsed={isCollapsed} collapser={collapser} />
    </Box>
  );
};

export default CollapsibleNavBar;
