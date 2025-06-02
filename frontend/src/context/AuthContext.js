import React, { createContext, useContext, useEffect, useState } from 'react';

import Cookies from 'universal-cookie';

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
        const cookies = new Cookies();
        let accessToken = cookies.get('access_token') || localStorage.getItem('access_token');
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

            const cookies = new Cookies();

            cookies.set('access_token', access, { path: '/' });
            cookies.set('refresh_token', refresh, { path: '/' });

            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);

            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);

            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error:
                    error.response?.data?.message || error.response?.data?.error || 'Login failed',
            };
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout API call failed:', error);
        }

        const cookies = new Cookies();

        cookies.remove('access_token', { path: '/' });
        cookies.remove('refresh_token', { path: '/' });

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

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
