import React from 'react';

const PageHeader = ({ title, subtitle, action, className = '' }) => {
    return (
        <div className={`bg-white border-b border-gray-200 ${className}`}>
            <div className="max-w-6xl mx-auto px-6 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                        {subtitle && <p className="text-gray-600 mt-2">{subtitle}</p>}
                    </div>
                    {action && <div>{action}</div>}
                </div>
            </div>
        </div>
    );
};

export default PageHeader;
