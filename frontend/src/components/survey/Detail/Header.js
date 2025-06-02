import React from 'react';
import { Calendar, Users, Edit, CheckCircle, XCircle, Clock } from 'lucide-react';

const Header = ({ survey, formatDate }) => {
    const getStatusIcon = (status) => {
        const statusIcons = {
            draft: <Edit className="w-4 h-4 text-gray-500" />,
            published: <CheckCircle className="w-4 h-4 text-green-500" />,
            closed: <XCircle className="w-4 h-4 text-red-500" />,
            archived: <Clock className="w-4 h-4 text-yellow-500" />
        };
        return statusIcons[status] || statusIcons.draft;
    };

    const getStatusBadge = (status) => {
        const statusStyles = {
            draft: 'bg-gray-100 text-gray-800',
            published: 'bg-green-100 text-green-800',
            closed: 'bg-red-100 text-red-800',
            archived: 'bg-yellow-100 text-yellow-800'
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status] || statusStyles.draft}`}>
                {getStatusIcon(status)}
                <span className="ml-1">{survey?.status_display || status}</span>
            </span>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                        <h1 className="text-2xl font-bold text-gray-900">{survey.title}</h1>
                        {getStatusBadge(survey.status)}
                    </div>
                    {survey.description && (
                        <p className="text-gray-600 mb-4">{survey.description}</p>
                    )}
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Created {formatDate(survey.created_at)}
                        </span>
                        <span className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {survey.total_responses} responses
                        </span>
                        {survey.category_display && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                {survey.category_display}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;