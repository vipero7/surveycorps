import React from 'react';

const ChatHeader = ({ survey }) => {
  return (
    <div className="bg-white shadow-sm p-4 border-b">
      <h1 className="text-xl font-semibold text-gray-900">{survey?.title}</h1>
      <p className="text-sm text-gray-500">Survey Response</p>
    </div>
  );
};

export default ChatHeader;
