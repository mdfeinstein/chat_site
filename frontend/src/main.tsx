import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { mantineTheme } from "./theme.ts";
import AuthGate from "./components/AuthGate";

const mountChatPage = () => {
  const chatPage = document.getElementById("react-chat-page");
  if (chatPage) {
    const root = createRoot(chatPage);
    root.render(
      <MantineProvider theme={mantineTheme}>
        {/* <StrictMode> */}
        <AuthGate />
        {/* </StrictMode> */}
      </MantineProvider>
    );
  }
};

document.addEventListener("DOMContentLoaded", () => {
  mountChatPage();
});
