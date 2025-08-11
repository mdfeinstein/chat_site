import React, { useState } from "react";

interface SendMessageButtonProps {
  sendMessageUrl: string;
  chatId: string | number;
  message: string;
}

const SendMessageButton: React.FC<SendMessageButtonProps> = ({ sendMessageUrl, chatId, message }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleClick = async () => {
    setErrorMsg("");

    if (!message.trim()) {
      setErrorMsg("Message cannot be empty.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(sendMessageUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, message })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      // You can add additional success handling here
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          backgroundColor: loading ? "#4f83cc" : "#1e88e5",
          color: "#fff",
          padding: "8px 16px",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "default" : "pointer",
          transition: "background-color 0.3s ease"
        }}
      >
        {loading ? "Sending..." : "Send Message"}
      </button>
      {errorMsg && <p style={{ color: "red", marginTop: "8px" }}>{errorMsg}</p>}
    </div>
  );
};

export default SendMessageButton;
