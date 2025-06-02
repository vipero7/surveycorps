import React from 'react';

import { Settings, Upload } from 'lucide-react';

const TabNavigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'manual', label: 'Manual Creation', icon: Settings },
    { id: 'csv', label: 'CSV Import', icon: Upload },
  ];

  return (
    <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
      {tabs.map(tab => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Icon className="w-4 h-4 mr-2" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default TabNavigation;
