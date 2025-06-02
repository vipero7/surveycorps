import React from 'react';

const ChatMessage = ({ message }) => {
  return (
    <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          message.type === 'user'
            ? 'bg-blue-500 text-white ml-12'
            : message.isSuccess
              ? 'bg-green-100 text-green-800 mr-12'
              : message.isError
                ? 'bg-red-100 text-red-800 mr-12'
                : 'bg-white text-gray-900 shadow-sm mr-12'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <p className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</p>
      </div>
    </div>
  );
};

export default ChatMessage;
