import React, { useEffect, useRef } from 'react';

import ChatMessage from './ChatMessage';

const ChatMessages = ({ messages }) => {
    const messagesEndRef = useRef(null);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="h-[calc(100vh-200px)] overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
                <ChatMessage key={index} message={message} />
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default ChatMessages;
