import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api/auth';

const AuthContext = createContext();

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Check if user is already logged in on app start
		const accessToken = localStorage.getItem('access_token');
		const userData = localStorage.getItem('user');

		if (accessToken && userData) {
			setUser(JSON.parse(userData));
		}
		setLoading(false);
	}, []);

	const login = async (email, password) => {
		try {
			const response = await authAPI.login({ email, password });
			const { access, refresh, user } = response.data.data;

			// Store tokens
			localStorage.setItem('access_token', access);
			localStorage.setItem('refresh_token', refresh);

			// Store user data (could be full_name or email)
			localStorage.setItem('user', JSON.stringify(user));
			setUser(user);

			return { success: true };
		} catch (error) {
			return {
				success: false,
				error: error.response?.data?.message || 'Login failed'
			};
		}
	};

	const logout = () => {
		localStorage.removeItem('access_token');
		localStorage.removeItem('refresh_token');
		localStorage.removeItem('user');
		setUser(null);
	};

	const value = {
		user,
		login,
		logout,
		loading,
		isAuthenticated: !!user,
	};

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	);
};