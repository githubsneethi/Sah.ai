
import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import MessageBubble from './MessageBubble';
import LoadingIndicator from './LoadingIndicator';

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="space-y-6">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {isLoading && messages.length > 0 && <LoadingIndicator />}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default ChatWindow;
