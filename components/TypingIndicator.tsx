
import React from 'react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-start">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white font-bold text-md mr-3 flex-shrink-0 shadow">
        A
      </div>
      <div className="bg-white text-gray-800 self-start border border-gray-200 px-4 py-3 rounded-xl shadow-md">
        <div className="flex items-center justify-center space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
