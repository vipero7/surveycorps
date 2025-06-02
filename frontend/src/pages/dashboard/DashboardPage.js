import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import ContentContainer from '../../components/layout/ContentContainer';
import MainLayout from '../../components/layout/MainLayout';
import CreatePage from '../survey/CreatePage';
import DetailPage from '../survey/DetailPage';
import DistributePage from '../survey/DistributePage';
import ListPage from '../survey/ListPage';

const DashboardPage = () => {
    return (
        <MainLayout>
            <Routes>
                <Route path="/" element={<Navigate to="/dashboard/surveys" replace />} />

                <Route
                    path="/surveys"
                    element={
                        <ContentContainer>
                            <ListPage />
                        </ContentContainer>
                    }
                />

                <Route path="/surveys/create" element={<CreatePage />} />

                <Route
                    path="/surveys/:oid"
                    element={
                        <ContentContainer>
                            <DetailPage />
                        </ContentContainer>
                    }
                />

                <Route path="/surveys/:id/distribute" element={<DistributePage />} />

                <Route
                    path="/analytics"
                    element={
                        <ContentContainer>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>
                                <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
                                    Analytics will appear here once you have survey responses.
                                </div>
                            </div>
                        </ContentContainer>
                    }
                />
            </Routes>
        </MainLayout>
    );
};

export default DashboardPage;
