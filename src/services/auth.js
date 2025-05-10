import db from './db';
import bcrypt from 'bcrypt';

// Add user to the database
db.version(2).stores({
    users: '++id, email, username',
    characters: '++id, userId, name, class, level',
    weapons: '++id, name, weaponType, isTemplate',
    characterWeapons: '++id, characterId, weaponId, isEquipped',
    spells: '++id, name, level, school, isTemplate',
    characterSpells: '++id, characterId, spellId, prepared',
    rollHistory: '++id, characterId, characterWeaponId, characterSpellId, timestamp'
});

// Password hashing
const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
};

// Register new user
export const authService = {
    async register(username, email, password) {
        try {
            const existingUser = await db.users.where('email').equals(email).first();
            if (existingUser) {
                throw new Error('User already exists');
            }

            const hashedPassword = await hashPassword(password);
            
            const userId = await db.users.add({
                username,
                email,
                password: hashedPassword,
                createdAt: new Date()
            });

            const user = await db.users.get(userId);
            const { password: _, ...userWithoutPassword } = user;

            // Store user in local storage
            sessionStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));

            return userWithoutPassword;
        } catch (error) {
            console.error('Error registering user:', error);
            throw error;
        }
    },

    // Login user
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

            const { password: _, ...userWithoutPassword } = user;

            // Store user in local storage
            sessionStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));

            return userWithoutPassword;
        } catch (error) {
            console.error('Error logging in:', error);
            throw error;
        }
    },

    // Logout user
    logout() {
        sessionStorage.removeItem('currentUser');
    },

    // Get Current User
    getCurrentUser() {
        const userStr = sessionStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Check if user is logged in
    isLoggedIn() {
        return !!this.getCurrentUser();
    }
};

export const updateCharacterService = {
    async getAll(userId) {
        return await db.characters.where('userId').equals(userId).toArray();
    }
};
