import React, { useState } from "react";

interface SendMessageButtonProps {
  sendMessageUrl: string;
  chatId: string | number;
}

const SendMessageButton: React.FC<SendMessageButtonProps> = () => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  // const csrfToken = (document.querySelector('input[name="csrfmiddlewaretoken"]') as HTMLInputElement)?.value;
  const mountNode = document.getElementById('react-send-message')!;
  const form = mountNode.closest('form')!;
  const textarea = form.querySelector('textarea[name="text"]') as HTMLTextAreaElement;
  const message = textarea.value;


  const handleClick = async () => {
    setErrorMsg("");

    if (!message.trim()) {
      setErrorMsg("Message cannot be empty.");
      return;
    }

    setLoading(true);
    try {
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
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
