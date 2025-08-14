// src/context/AuthContext.js

// BƯỚC SỬA LỖI: Thêm đầy đủ các import cần thiết
import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

// Dòng này định nghĩa 'AuthContext', sửa lỗi 'AuthContext' is not defined
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Dòng import ở trên đã sửa lỗi cho 'useState'
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Dòng import ở trên đã sửa lỗi cho 'useEffect'
    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('userData');

        if (storedToken && storedUser) {
            try {
                // Dòng import ở trên đã sửa lỗi cho 'jwtDecode'
                const decodedToken = jwtDecode(storedToken);
                if (decodedToken.exp * 1000 > Date.now()) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                } else {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userData');
                }
            } catch (error) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('userData');
            }
        }
        setIsLoading(false);
    }, []);

    const login = (apiResponse) => {
        const { access_token, ...userData } = apiResponse;
        
        localStorage.setItem('authToken', access_token);
        
        const userToStore = {
            id: userData.employer_id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
        };
        localStorage.setItem('userData', JSON.stringify(userToStore));
        
        setToken(access_token);
        setUser(userToStore);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        setToken(null);
        setUser(null);
    };

    const value = { user, token, isLoading, login, logout };

    // Dòng 'const AuthContext' ở trên đã sửa lỗi cho thẻ này
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    // Dòng import ở trên đã sửa lỗi cho 'useContext'
    return useContext(AuthContext);
};