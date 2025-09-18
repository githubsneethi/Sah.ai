import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Chat } from '@google/genai';
import { ChatMessage, MessageRole } from './types';
import { createChatSession } from './services/geminiService';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import { LightbulbIcon } from './components/Icons';
import { useOnlineStatus } from './hooks/useOnlineStatus';

const CHAT_HISTORY_KEY = 'sahAiChatHistory';

function App() {
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isOnline = useOnlineStatus();
  const hasInitialized = useRef(false);

  const fetchInitialMessage = useCallback(async (session: Chat) => {
    setIsLoading(true);
    try {
      const initialMessage: ChatMessage = {
        id: `model-${Date.now()}`,
        role: MessageRole.MODEL,
        content: ""
      };
      // Clear any previous error messages before fetching
      setMessages([initialMessage]);
      
      const stream = await session.sendMessageStream({ message: "Introduce yourself" });

      let fullResponse = "";
      for await (const chunk of stream) {
        fullResponse += chunk.text;
        setMessages([{ ...initialMessage, content: fullResponse }]);
      }

    } catch (error) {
      console.error("Initialization failed:", error);
      setMessages([{
        id: `error-${Date.now()}`,
        role: MessageRole.ERROR,
        content: "Oh no! I couldn't get started. Please check your connection and API key, then refresh the page. 🙏"
      }]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const session = createChatSession();
    setChatSession(session);

    const initialize = async () => {
        const savedMessages = localStorage.getItem(CHAT_HISTORY_KEY);
        if (savedMessages) {
            try {
                const parsedMessages = JSON.parse(savedMessages);
                if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
                    setMessages(parsedMessages);
                    setIsLoading(false);
                    return;
                }
            } catch (e) {
                console.error("Failed to parse chat history:", e);
                localStorage.removeItem(CHAT_HISTORY_KEY);
            }
        }

        if (navigator.onLine) {
            await fetchInitialMessage(session);
        } else {
            setMessages([{
                id: `error-offline-init-${Date.now()}`,
                role: MessageRole.ERROR,
                content: "Welcome! You seem to be offline. Connect to the internet to start chatting with Sah.ai. 🙏"
            }]);
            setIsLoading(false);
        }
    };
    
    initialize();
  }, [fetchInitialMessage]);

  useEffect(() => {
    // If we come online and the chat only contains error messages, fetch the initial message.
    if (isOnline && chatSession && messages.length > 0 && messages.every(m => m.role === MessageRole.ERROR)) {
        fetchInitialMessage(chatSession);
    }
  }, [isOnline, chatSession, messages, fetchInitialMessage]);

  useEffect(() => {
    if (messages.length > 0) {
        const messagesToSave = messages.filter(
            msg => msg.role !== MessageRole.ERROR && msg.content
        );
        if (messagesToSave.length > 0) {
            localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messagesToSave));
        }
    }
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!isOnline) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: MessageRole.ERROR,
        content: "You're offline. Please check your connection and try again. 🔌"
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    if (!chatSession || !text.trim()) return;

    setIsLoading(true);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: MessageRole.USER,
      content: text,
    };

    const modelResponseId = `model-${Date.now()}`;
    const modelMessagePlaceholder: ChatMessage = {
        id: modelResponseId,
        role: MessageRole.MODEL,
        content: "",
    };
    
    setMessages(prev => [...prev, userMessage, modelMessagePlaceholder]);

    try {
      const stream = await chatSession.sendMessageStream({ message: text });

      let fullResponse = "";
      for await (const chunk of stream) {
        fullResponse += chunk.text;
        setMessages(prev => prev.map(msg => 
            msg.id === modelResponseId ? { ...msg, content: fullResponse } : msg
        ));
      }
      
    } catch (error) {
      console.error("Message sending failed:", error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: MessageRole.ERROR,
        content: "Oops! Something went wrong. Maybe ask a different question? 🤔"
      };
      setMessages(prev => [...prev.filter(m => m.id !== modelResponseId), errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen font-sans bg-indigo-50 text-gray-800">
      <header className="bg-white shadow-md p-4 flex items-center gap-4 z-10 border-b border-indigo-100">
        <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center">
            <LightbulbIcon className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-indigo-900">Sah.ai Doubt Engine</h1>
          <p className="text-sm text-gray-500">Clear your doubts, instantly!</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full transition-colors ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="text-sm text-gray-500">{isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <ChatWindow messages={messages} isLoading={isLoading} />
      </main>

      <footer className="bg-white p-4 border-t border-indigo-100">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} isOnline={isOnline} />
        <p className="text-xs text-center text-gray-400 mt-2">
            An internet connection is required. Sah.ai is an AI and can make mistakes. Always double-check important information.
        </p>
      </footer>
    </div>
  );
}

export default App;