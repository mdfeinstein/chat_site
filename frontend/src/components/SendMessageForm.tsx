// SendMessageForm.tsx
import React, { useState } from 'react';
//type only import of formevent
import type { FormEvent } from 'react';
import { Button, Textarea } from '@mantine/core'; // import Mantine Button

// Define the CSS animation for the popup
const popupAnimation = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1;  }
  }
  @keyFrames fadeOut {
    from { opacity: 1; }
    to { opacity: 0;  }
  }
`;

interface SendMessageFormProps {
  sendMessageUrl: string;
  chatId: string | number;
  csrfToken: string;
}

const SendMessageForm: React.FC<SendMessageFormProps> = ({ sendMessageUrl, chatId, csrfToken }) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emptyWarning, setEmptyWarning] = useState(false);

  // Handle key down event for textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit form on Enter key press, but allow Shift+Enter for new line
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Clear any previous warnings
    setEmptyWarning(false);
    
    // Check for empty message
    if (!message.trim()) {
      setEmptyWarning(true);
      // Hide the warning after 3 seconds
      setTimeout(() => setEmptyWarning(false), 2000);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('text', message);
      formData.append('chat_id', chatId.toString());

      const response = await fetch(sendMessageUrl, {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRFToken': csrfToken
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setMessage(''); // Clear the form on success
      } else {
        setError('Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('An error occurred while sending your message');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{popupAnimation}</style>
      <form 
        id="send-message-form" 
        onSubmit={handleSubmit} 
        className="send-message-form"
        style={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          position: 'relative', // Add relative positioning for absolute popup
        }}
      >
      <Textarea
        className="chat-textarea"
        name="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type message here..."
        required
        h="100%" // Height prop
        mr="8px" // Add right margin (can use xs, sm, md, lg, xl)
        styles={{
          root: { 
            flex: '0 0 80%' }, // Adjust flex basis to account for margin
          wrapper: { height: '100%' },
          input: { height: '100%', resize: 'none', fontSize: '25px' } // Set your desired font size here
        }}
      />
      <input type="hidden" name="chat_id" value={chatId.toString()} />
        <Button
          type="submit"
          loading={isLoading}
          disabled={isLoading}
          h="100%"         // Mantine height prop
          styles={{
            root: {
              boxSizing: 'border-box',
              flex: '0 0 20%', // Adjust to account for the margin
            }
          }}
        >
          Send Message
        </Button>
      {error && (
        <div 
          style={{ 
            color: 'red', 
            marginTop: '0.5rem', 
            width: '100%', 
            textAlign: 'center' 
          }}
        >
          {error}
        </div>
      )}
      {emptyWarning && (
        <div 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '5px',
            zIndex: 1000,
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
            animation: 'fadeIn 0.5s ease-out, fadeOut 1.5s ease-in forwards',
          }}
        >
          Cannot send an empty message
        </div>
      )}
    </form>
    </>
  );
};

export default SendMessageForm;