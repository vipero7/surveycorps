import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Button from '../../components/common/Button';

const ListPage = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Surveys</h1>
                <Button onClick={() => navigate('/dashboard/surveys/create')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Survey
                </Button>
            </div>
            <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
                No surveys yet. Create your first survey to get started!
            </div>
        </div>
    );
};

export default ListPage;