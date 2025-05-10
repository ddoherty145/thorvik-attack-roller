import { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Provider component
export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = authService.getCurrentUser();
        setCurrentUser(user);
        setLoading(false);
    }, []);

    const register = async (username, email, password) => {
        try {
            const user = await authService.register(username, email, password);
            setCurrentUser(user);
            return user;
        } catch (error) {
            console.error('Error registering user:', error);
            throw error;
        }
    };

    // Login User
    const login = async (email, password) => {
        try {
            const user = await authService.login(email, password);
            setCurrentUser(user);
            return user;
        } catch (error) {
            console.error('Error logging in:', error);
            throw error;
        }
    };

    // Logout User
    const logout = () => {
        authService.logout();
        setCurrentUser(null);
    };

    // Value that will be available to all components
    const value = {
        currentUser,
        register,
        login,
        logout,
        isLoggedIn: !!currentUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
