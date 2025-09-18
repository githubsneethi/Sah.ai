import React, { useState } from 'react';
import { SendIcon } from './Icons';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isOnline: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, isOnline }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading && isOnline) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const isDisabled = isLoading || !isOnline;
  const placeholderText = isOnline ? "Ask a question..." : "You are offline. Connect to the internet to chat.";

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholderText}
        disabled={isDisabled}
        className="flex-1 w-full p-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-shadow duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
        aria-label="Chat input"
      />
      <button
        type="submit"
        disabled={isDisabled}
        className="w-12 h-12 flex-shrink-0 bg-indigo-500 text-white rounded-full flex items-center justify-center transition-transform duration-200 hover:bg-indigo-600 active:scale-95 disabled:bg-indigo-300 disabled:cursor-not-allowed"
        aria-label="Send message"
      >
        <SendIcon className="w-6 h-6" />
      </button>
    </form>
  );
};

export default ChatInput;