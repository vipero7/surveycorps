import React, { createContext, useContext, useState } from 'react';

import { AlertCircle, CheckCircle, Info, X, XCircle } from 'lucide-react';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

const NotificationItem = ({ notification, onRemove }) => {
    const getIcon = () => {
        switch (notification.type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-400" />;
            case 'error':
                return <XCircle className="w-5 h-5 text-red-400" />;
            case 'warning':
                return <AlertCircle className="w-5 h-5 text-yellow-400" />;
            case 'info':
            default:
                return <Info className="w-5 h-5 text-blue-400" />;
        }
    };

    const getBackgroundColor = () => {
        switch (notification.type) {
            case 'success':
                return 'bg-green-50 border-green-200';
            case 'error':
                return 'bg-red-50 border-red-200';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200';
            case 'info':
            default:
                return 'bg-blue-50 border-blue-200';
        }
    };

    return (
        <div
            className={`flex items-start p-4 rounded-lg border ${getBackgroundColor()} shadow-sm mb-3 animate-in slide-in-from-right duration-300`}
        >
            <div className="flex-shrink-0">{getIcon()}</div>
            <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">{notification.message}</p>
            </div>
            <button
                onClick={() => onRemove(notification.id)}
                className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = (message, type = 'info', duration = 5000) => {
        const id = Date.now() + Math.random();
        const notification = { id, message, type };

        setNotifications(prev => [...prev, notification]);

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, duration);
        }

        return id;
    };

    const removeNotification = id => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    };

    const showSuccess = (message, duration) => addNotification(message, 'success', duration);
    const showError = (message, duration) => addNotification(message, 'error', duration);
    const showWarning = (message, duration) => addNotification(message, 'warning', duration);
    const showInfo = (message, duration) => addNotification(message, 'info', duration);

    const value = {
        notifications,
        addNotification,
        removeNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}

            {/* Notification Container */}
            <div className="fixed top-4 right-4 z-50 w-96 max-w-sm">
                {notifications.map(notification => (
                    <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onRemove={removeNotification}
                    />
                ))}
            </div>
        </NotificationContext.Provider>
    );
};
