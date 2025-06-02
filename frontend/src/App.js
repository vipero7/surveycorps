import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import FillPage from './pages/survey/FillPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

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
							<Route path="/survey/:oid/fill" element={<FillPage />} />

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