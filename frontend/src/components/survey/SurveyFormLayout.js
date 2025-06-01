import React from 'react';

const SurveyFormLayout = ({ mainContent, sidebar }) => {
    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {mainContent}
                </div>
                <div>
                    {sidebar}
                </div>
            </div>
        </div>
    );
};

export default SurveyFormLayout;