import React from 'react';

import Button from '../../common/Button';

const Links = ({ survey }) => {
    if (!survey.public_url && !survey.edit_url && !survey.responses_url) {
        return null;
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Survey Links</h2>
            <div className="space-y-3">
                {survey.public_url && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Public URL
                        </label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="text"
                                value={survey.public_url}
                                readOnly
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigator.clipboard.writeText(survey.public_url)}
                            >
                                Copy
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Links;
