import React from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import FillPage from './pages/survey/FillPage';
import SubmissionViewPage from './pages/survey/SubmissionViewPage';

function App() {
    return (
        <AuthProvider>
            <NotificationProvider>
                <Router>
                    <div className="App">
                        <Routes>
                            {/* Public routes */}
                            <Route path="/login" element={<LoginPage />} />

                            {/* Public survey completion - NO AUTH REQUIRED */}
                            <Route path="/surveys/:oid/fill" element={<FillPage />} />
                            <Route
                                path="/surveys/submission/:responseOid/view"
                                element={<SubmissionViewPage />}
                            />

                            {/* Protected routes */}
                            <Route
                                path="/dashboard/*"
                                element={
                                    <ProtectedRoute>
                                        <DashboardPage />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Default redirect */}
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        </Routes>
                    </div>
                </Router>
            </NotificationProvider>
        </AuthProvider>
    );
}

export default App;
