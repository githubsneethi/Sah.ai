import React from 'react';
import { ChatMessage, MessageRole } from '../types';
import { LightbulbIcon, UserIcon } from './Icons';

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { role, content } = message;

  const isUser = role === MessageRole.USER;
  const isModel = role === MessageRole.MODEL;
  const isError = role === MessageRole.ERROR;

  const bubbleClasses = {
    base: 'max-w-xl p-4 rounded-2xl relative',
    user: 'bg-indigo-500 text-white self-end',
    model: 'bg-white self-start shadow-sm border border-gray-100',
    error: 'bg-red-100 text-red-800 self-start',
  };

  const wrapperClasses = `flex items-start gap-3 w-full ${isUser ? 'justify-end' : 'justify-start'}`;

  const renderContent = (text: string) => {
    return text.split('\n').map((line, index) => (
      <p key={index}>{line}</p>
    ));
  };
  
  if (!content && role === MessageRole.MODEL) {
      return null;
  }

  return (
    <div className={wrapperClasses}>
      {!isUser && (
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isError ? 'bg-red-200' : 'bg-indigo-500'}`}>
          <LightbulbIcon className={`w-6 h-6 ${isError ? 'text-red-600' : 'text-white'}`} />
        </div>
      )}
      <div className={`${bubbleClasses.base} ${isUser ? bubbleClasses.user : isError ? bubbleClasses.error : bubbleClasses.model}`}>
        <div className="prose prose-sm max-w-none text-inherit break-words">
          {renderContent(content)}
        </div>
      </div>
       {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-indigo-100">
          <UserIcon className="w-6 h-6 text-indigo-600" />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;