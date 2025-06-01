import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
	return (
		<AuthProvider>
			<Router>
				<div className="App">
					<Routes>
						{/* Public routes */}
						<Route path="/login" element={<LoginPage />} />

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
		</AuthProvider>
	);
}

export default App;