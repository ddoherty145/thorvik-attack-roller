import bcrypt from 'bcryptjs';
import db, { createTableApi } from './db';

const usersTable = createTableApi(db.table('users'));

const sessionStore = {
    set(user) {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
    },
    get() {
        const userStr = sessionStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    },
    clear() {
        sessionStorage.removeItem('currentUser');
    }
};

const stripPassword = (user) => {
    if (!user) return null;
    // eslint-disable-next-line no-unused-vars
    const { password, ...rest } = user;
    return rest;
};

export const authService = {
    async register(username, email, password) {
        try {
            const existingUser = await db.users.where('email').equals(email).first();
            if (existingUser) {
                throw new Error('User already exists');
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const userId = await usersTable.add({
                username,
                email,
                password: hashedPassword,
                createdAt: new Date()
            });

            const user = await usersTable.getById(userId);
            const userWithoutPassword = stripPassword(user);
            sessionStore.set(userWithoutPassword);

            return userWithoutPassword;
        } catch (error) {
            console.error('Error registering user:', error);
            throw error;
        }
    },

    async login(email, password) {
        try {
            const user = await db.users.where('email').equals(email).first();

            if (!user) {
                throw new Error('User not found');
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new Error('Invalid password');
            }

            const userWithoutPassword = stripPassword(user);
            sessionStore.set(userWithoutPassword);

            return userWithoutPassword;
        } catch (error) {
            console.error('Error logging in:', error);
            throw error;
        }
    },

    logout() {
        sessionStore.clear();
    },

    getCurrentUser() {
        return sessionStore.get();
    },

    isLoggedIn() {
        return !!sessionStore.get();
    }
};
