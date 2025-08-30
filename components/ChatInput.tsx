
import React, { useState } from 'react';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, disabled }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage(text);
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-3">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={disabled ? 'Please select an option above' : 'Type your message...'}
        disabled={isLoading || disabled}
        className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 disabled:opacity-50 disabled:bg-gray-100"
        autoComplete="off"
      />
      <button
        type="submit"
        disabled={isLoading || disabled || !text.trim()}
        className="px-5 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-200 disabled:bg-purple-300 disabled:cursor-not-allowed flex items-center justify-center"
      >
        <i className="fa-solid fa-paper-plane"></i>
      </button>
    </form>
  );
};

export default ChatInput;
