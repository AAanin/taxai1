
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chat } from '@google/genai';
import { type ChatMessage, Sender } from './types';
import { createAninChatSession } from './services/geminiService';
import ChatMessageComponent from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import EmailInput from './components/EmailInput';
import TypingIndicator from './components/TypingIndicator';

// QuickReplies Component for interactive buttons
interface QuickRepliesProps {
  replies: string[];
  onSelect: (reply: string) => void;
}

const QuickReplies: React.FC<QuickRepliesProps> = ({ replies, onSelect }) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center py-3 px-4 border-t border-gray-200">
      {replies.map((reply) => (
        <button
          key={reply}
          onClick={() => onSelect(reply)}
          className="bg-purple-100 text-purple-700 font-semibold py-2 px-4 rounded-full border border-purple-300 hover:bg-purple-200 transition-colors duration-200 text-sm"
        >
          {reply}
        </button>
      ))}
    </div>
  );
};


const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeQuickReplies, setActiveQuickReplies] = useState<string[]>([]);
  const [isAwaitingEmail, setIsAwaitingEmail] = useState<boolean>(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const processBotResponse = useCallback((text: string, messageId: number) => {
    const qrRegex = /\[QUICK_REPLIES:\s*(\[.*\])\]/s;
    const match = text.match(qrRegex);
    let cleanedText = text;
    let hasQuickReplies = false;

    if (match && match[1]) {
        try {
            const replies = JSON.parse(match[1]);
            cleanedText = text.replace(qrRegex, '').trim();
            setActiveQuickReplies(replies);
            hasQuickReplies = true;
        } catch (e) {
            console.error("Failed to parse quick replies JSON:", e);
        }
    } 
    
    if (!hasQuickReplies) {
        setActiveQuickReplies([]);
    }
    
    // Check if the bot is asking for an email
    if (cleanedText.includes("Please enter your email address")) {
        setIsAwaitingEmail(true);
    }
    
    setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, text: cleanedText } : msg
    ));
  }, []);

  const initializeChat = useCallback(async () => {
    setIsLoading(true);
    try {
      const chat = createAninChatSession();
      chatSessionRef.current = chat;
      
      const stream = await chat.sendMessageStream({ message: "Hello" }); 
      
      let botResponse = '';
      const botMessageId = Date.now();
      
      setMessages([{ id: botMessageId, sender: Sender.Bot, text: '' }]);

      for await (const chunk of stream) {
        botResponse += chunk.text;
        setMessages(prev => prev.map(msg => 
            msg.id === botMessageId ? { ...msg, text: botResponse } : msg
        ));
      }

      processBotResponse(botResponse, botMessageId);

    } catch (error) {
      console.error("Initialization error:", error);
      const errorMessage: ChatMessage = {
        id: Date.now(),
        sender: Sender.Bot,
        text: "Sorry, I'm having trouble connecting right now. Please check your API key and refresh the page.",
      };
      setMessages([errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [processBotResponse]);
  
  useEffect(() => {
    initializeChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setActiveQuickReplies([]);

    const userMessage: ChatMessage = {
      id: Date.now(),
      sender: Sender.User,
      text,
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    if (!chatSessionRef.current) {
        setIsLoading(false);
        setMessages(prev => [...prev, {id: Date.now(), sender: Sender.Bot, text: "Chat session not initialized. Please refresh."}]);
        return;
    }

    try {
      const stream = await chatSessionRef.current.sendMessageStream({ message: text });
      
      let botResponse = '';
      const botMessageId = Date.now() + 1;
      
      setMessages(prev => [...prev, { id: botMessageId, sender: Sender.Bot, text: '' }]);

      for await (const chunk of stream) {
        botResponse += chunk.text;
        setMessages(prev => prev.map(msg => 
            msg.id === botMessageId ? { ...msg, text: botResponse } : msg
        ));
      }
      
      processBotResponse(botResponse, botMessageId);

    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        sender: Sender.Bot,
        text: "I encountered an error. Please try again.",
      };
       setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEmailSubmit = async (email: string) => {
    setIsAwaitingEmail(false);
    await handleSendMessage(email);
  };

  return (
    <div className="flex flex-col h-screen max-h-screen font-sans">
      <header className="bg-white shadow-md p-4 border-b border-gray-200 z-10">
        <div className="max-w-4xl mx-auto flex items-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white font-bold text-2xl mr-4 shadow-lg">
                A
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Anin</h1>
              <p className="text-sm text-gray-500">Your AI Tax Lawyer & Advisor</p>
            </div>
        </div>
      </header>
      
      <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((msg) => (
            <ChatMessageComponent key={msg.id} message={msg} />
          ))}
          {isLoading && messages.length > 0 && <TypingIndicator />}
        </div>
      </main>

      <footer className="bg-white border-t-0">
        <div className="max-w-4xl mx-auto">
           {activeQuickReplies.length > 0 && (
                <QuickReplies replies={activeQuickReplies} onSelect={handleSendMessage} />
            )}
           <div className="p-4">
             {isAwaitingEmail ? (
                <EmailInput onSubmit={handleEmailSubmit} isLoading={isLoading} />
             ) : (
                <ChatInput 
                    onSendMessage={handleSendMessage} 
                    isLoading={isLoading} 
                    disabled={activeQuickReplies.length > 0}
                />
             )}
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
