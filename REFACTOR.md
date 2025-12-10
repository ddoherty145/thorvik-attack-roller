# Service Layer Refactoring Documentation

## Overview

This document outlines the refactoring changes made to improve code organization, reduce duplication, and implement user-scoped data isolation using composable methods.

## Changes Summary

### 1. Service Layer Composition Refactor
- Centralized database schema definition
- Created reusable table API factory
- Refactored all services to use composition pattern
- Extracted common helpers (session storage, password stripping)

### 2. User-Scoped Data Isolation
- Added user ownership validation for characters
- Updated all character-related pages to filter by userId
- Implemented security checks to prevent unauthorized access

---

## Part 1: Composing Methods Refactor

### Files Modified

#### `src/services/db.js`

**Changes:**
- **Centralized Schema Definition**: Created `defineSchema()` function to consolidate all Dexie schema definitions
  - Moved schema from version 1 to version 2
  - Added `users` table to schema
  - All tables now defined in one place

- **Created `createTableApi` Factory**: New reusable factory function that generates standard CRUD operations
  ```javascript
  const createTableApi = (table, idKey = 'id') => ({
      getAll: () => table.toArray(),
      getById: (id) => table.get(id),
      add: (item) => table.add(item),
      update: (id, updates) => table.update(id, updates),
      remove: (id) => table.delete(id),
      whereEquals: (field, value) => table.where(field).equals(value).toArray(),
      idKey
  });
  ```

- **Refactored Services Using Composition**:
  - `characterService`: Spreads base table API + custom methods
  - `weaponService`: Uses composition for base operations + domain-specific methods
  - `spellService`: Uses composition for base operations + domain-specific methods
  - `rollHistoryService`: Uses composition for base operations + custom roll methods

- **Template Query Updates**: Changed `isTemplate` queries to handle both `1` and `true` values for backward compatibility

**Before:**
```javascript
export const characterService = {
    async getAll() {
        return await db.characters.toArray();
    },
    async getById(id) {
        return await db.characters.get(id);
    },
    // ... more duplicate code
};
```

**After:**
```javascript
const characterTable = createTableApi(db.table('characters'));

export const characterService = {
    ...characterTable,
    delete: (id) => characterTable.remove(id)
};
```

#### `src/services/auth.js`

**Changes:**
- **Removed Duplicate Schema**: Removed `db.version(2).stores()` call (now in `db.js`)
- **Extracted Session Storage Helper**: Created `sessionStore` object with `set()`, `get()`, and `clear()` methods
- **Extracted Password Stripping**: Created `stripPassword()` helper function
- **Uses Table API Factory**: Now imports and uses `createTableApi` for user table operations
- **Removed Unused Service**: Removed `updateCharacterService` export

**Before:**
```javascript
// Store user in local storage
sessionStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
```

**After:**
```javascript
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
```

---

## Part 2: User-Scoped Data Isolation

### Files Modified

#### `src/services/db.js`

**New Methods Added to `characterService`:**

1. **`getAllByUser(userId)`**: Returns all characters belonging to a specific user
   ```javascript
   getAllByUser(userId) {
       return db.characters.where('userId').equals(userId).toArray();
   }
   ```

2. **`getByIdForUser(id, userId)`**: Returns character only if it belongs to the user
   ```javascript
   async getByIdForUser(id, userId) {
       const record = await db.characters.get(id);
       return record?.userId === userId ? record : null;
   }
   ```

3. **`addForUser(userId, character)`**: Creates character with userId automatically set
   ```javascript
   addForUser(userId, character) {
       return characterTable.add({ ...character, userId });
   }
   ```

4. **`updateForUser(id, userId, updates)`**: Updates character only if owned by user
   ```javascript
   async updateForUser(id, userId, updates) {
       await ensureOwnedCharacter(id, userId);
       return characterTable.update(id, updates);
   }
   ```

5. **`deleteForUser(id, userId)`**: Deletes character only if owned by user
   ```javascript
   async deleteForUser(id, userId) {
       await ensureOwnedCharacter(id, userId);
       return characterTable.remove(id);
   }
   ```

**New Helper Function:**
- **`ensureOwnedCharacter(id, userId)`**: Validates ownership and throws error if character doesn't exist or doesn't belong to user

#### `src/pages/CreateCharacterPage.jsx`

**Changes:**
- Added `useAuth()` hook to get `currentUser`
- Changed `characterService.add()` to `characterService.addForUser(currentUser.id, character)`
- Added redirect to login if user not authenticated

**Before:**
```javascript
await characterService.add(character);
```

**After:**
```javascript
if (!currentUser) {
    navigate('/login');
    return;
}
await characterService.addForUser(currentUser.id, character);
```

#### `src/pages/CharacterListPage.jsx`

**Changes:**
- Added `useAuth()` hook and `useNavigate()` hook
- Changed `characterService.getAll()` to `characterService.getAllByUser(currentUser.id)`
- Changed `characterService.delete()` to `characterService.deleteForUser(id, currentUser.id)`
- Added redirect to login if user not authenticated
- Updated `useEffect` dependency array to include `currentUser`

**Before:**
```javascript
const characterData = await characterService.getAll()
```

**After:**
```javascript
if (!currentUser) {
    navigate('/login');
    return;
}
const characterData = await characterService.getAllByUser(currentUser.id);
```

#### `src/pages/CharacterDetailPage.jsx`

**Changes:**
- Added `useAuth()` hook to get `currentUser`
- Changed `characterService.getById()` to `characterService.getByIdForUser(id, currentUser.id)`
- Changed `characterService.update()` to `characterService.updateForUser(id, currentUser.id, updates)`
- Added redirect to login if user not authenticated
- Updated `useEffect` dependency array to include `currentUser`

**Before:**
```javascript
const characterData = await characterService.getById(parseInt(id));
// ...
await characterService.update(editedCharacter.id, editedCharacter);
```

**After:**
```javascript
if (!currentUser) {
    navigate('/login');
    return;
}
const characterData = await characterService.getByIdForUser(parseInt(id), currentUser.id);
// ...
await characterService.updateForUser(editedCharacter.id, currentUser.id, editedCharacter);
```

#### `src/pages/HomePage.jsx`

**Changes:**
- Added `useAuth()` hook to get `currentUser`
- Changed `characterService.getAll()` to `characterService.getAllByUser(currentUser.id)`
- Added early return with empty arrays if user not authenticated
- Updated `useEffect` dependency array to include `currentUser`

**Before:**
```javascript
const characters = await characterService.getAll();
```

**After:**
```javascript
if (!currentUser) {
    setRecentCharacters([]);
    setRecentRolls([]);
    return;
}

const characters = await characterService.getAllByUser(currentUser.id);
```

---

## Benefits

### Code Quality Improvements
- **Reduced Duplication**: CRUD operations defined once in factory, reused everywhere
- **Single Source of Truth**: Schema defined in one place, preventing version conflicts
- **Consistent API**: All services follow the same pattern
- **Better Maintainability**: Changes to base operations automatically propagate
- **Improved Testability**: Small, focused helper functions are easier to test

### Security & Data Isolation
- **User Privacy**: Users can only see their own characters
- **Access Control**: Ownership validation prevents unauthorized access
- **Data Integrity**: userId automatically set on creation
- **Better UX**: Users see only relevant data

---

## Migration Notes

### Breaking Changes
- **Existing Characters**: Characters created before this refactor without a `userId` will not appear for any user. These may need to be manually migrated or recreated.

### Backward Compatibility
- **Non-Character Services**: Weapon, spell, and roll history services maintain their existing API
- **Legacy Methods**: Old methods like `characterService.getAll()` still exist but should not be used for new code

### Required Actions
1. **Authentication Required**: All character operations now require a logged-in user
2. **User Context**: Pages using character services must use `useAuth()` hook
3. **Testing**: Manual smoke testing recommended for:
   - User registration/login
   - Character creation/list/update/delete
   - Dashboard loading
   - Character detail page access

---

## API Reference

### Character Service Methods

#### User-Scoped Methods (Recommended)
- `getAllByUser(userId)` - Get all characters for a user
- `getByIdForUser(id, userId)` - Get character if owned by user
- `addForUser(userId, character)` - Create character with userId
- `updateForUser(id, userId, updates)` - Update character if owned
- `deleteForUser(id, userId)` - Delete character if owned

#### Legacy Methods (Deprecated)
- `getAll()` - Returns all characters (no user filtering)
- `getById(id)` - Returns character without ownership check
- `add(character)` - Creates character without userId
- `update(id, updates)` - Updates without ownership check
- `delete(id)` - Deletes without ownership check

### Table API Factory

The `createTableApi` factory provides these standard methods:
- `getAll()` - Get all records
- `getById(id)` - Get record by ID
- `add(item)` - Add new record
- `update(id, updates)` - Update record
- `remove(id)` - Delete record
- `whereEquals(field, value)` - Query by field value

---

## Testing Checklist

- [ ] User can register and login
- [ ] User can create a character (userId is set)
- [ ] User can see only their own characters in list
- [ ] User can view their own character details
- [ ] User cannot view other users' characters
- [ ] User can update their own characters
- [ ] User cannot update other users' characters
- [ ] User can delete their own characters
- [ ] User cannot delete other users' characters
- [ ] Dashboard shows only user's characters
- [ ] Logout clears session properly
- [ ] Unauthenticated users are redirected to login

---

## Future Improvements

Potential enhancements for future iterations:
- Migrate existing characters to assign userId
- Add user-scoping to weapons/spells if needed
- Consider adding user-scoped roll history
- Add unit tests for new service methods
- Add integration tests for user isolation
