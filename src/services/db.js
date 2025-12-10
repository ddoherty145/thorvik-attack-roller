import Dexie from 'dexie';

const db = new Dexie('ThorvikAttackRollerDB');

const defineSchema = () => {
    db.version(2).stores({
        users: '++id, email, username',
        characters: '++id, userId, name, class, level',
        weapons: '++id, name, weaponType, isTemplate',
        characterWeapons: '++id, characterId, weaponId, isEquipped',
        spells: '++id, name, level, school, isTemplate',
        characterSpells: '++id, characterId, spellId, prepared',
        rollHistory: '++id, characterId, characterWeaponId, characterSpellId, timestamp'
    });
};

defineSchema();

const createTableApi = (table, idKey = 'id') => ({
    getAll: () => table.toArray(),
    getById: (id) => table.get(id),
    add: (item) => table.add(item),
    update: (id, updates) => table.update(id, updates),
    remove: (id) => table.delete(id),
    whereEquals: (field, value) => table.where(field).equals(value).toArray(),
    idKey
});

// Initialize with sample data
db.on('populate', async () => {
    await db.weapons.bulkAdd([
        {
            name: 'Longsword',
            description: 'A versatile slashing weapon.',
            weaponType: 'martial melee',
            damageDice: '1d8',
            damageType: 'slashing',
            properties: ['versatile'],
            versatileDamageDice: '1d10',
            range: '5ft',
            abilityScore: 'STR',
            magicalBonus: 0,
            proficiencyCategory: 'martial',
            isTemplate: 1
        },
        {
            name: 'Shortbow',
            description: 'A small bow',
            weaponType: 'simple ranged',
            damageDice: '1d6',
            damageType: 'piercing',
            properties: ['ammunition', 'two-handed'],
            range: '80/320 ft',
            abilityScore: 'DEX',
            magicalBonus: 0,
            proficiencyCategory: 'simple',
            isTemplate: 1
        },
        {
            name: 'Dagger',
            description: 'A small blade',
            weaponType: 'simple melee',
            damageDice: '1d4',
            damageType: 'piercing',
            properties: ['finesse', 'light', 'thrown'],
            range: '20/60 ft',
            abilityScore: 'DEX',
            magicalBonus: 0,
            proficiencyCategory: 'simple',
            isTemplate: 1
        }
    ]);

    await db.spells.bulkAdd([
        {
            name: 'Fireball',
            description: 'A bright streak flashes from your pointing finger to a point you choose within range and then blossoms with a low roar into an explosion of flame.',
            level: 3,
            school: 'Evocation',
            castingTime: '1 action',
            attackType: 'save',
            saveAttribute: 'DEX',
            damageDice: '8d6',
            damageType: 'fire',
            areaOfEffect: '20 ft radius',
            duration: 'Instantaneous',
            components: ['V', 'S', 'M'],
            materialComponents: 'a tiny ball of bat guano and sulfur',
            isTemplate: 1
        },
        {
            name: 'Magic Missile',
            description: 'You create three glowing darts of magical force. Each dart hits a creature of your choice that you can see within range.',
            level: 1,
            school: 'Evocation',
            castingTime: '1 action',
            attackType: 'auto hit',
            damageDice: '1d4+1',
            damageType: 'force',
            areaOfEffect: 'Single target',
            duration: 'Instantaneous',
            components: ['V', 'S'],
            isTemplate: 1
        },
        {
            name: 'Shield',
            description: 'An invisible barrier of magical force appears and protects you.',
            level: 1,
            school: 'Abjuration',
            castingTime: '1 reaction, which you take when you are hit by an attack or targeted by the magic missile spell',
            attackType: 'none',
            damageDice: null,
            damageType: null,
            areaOfEffect: null,
            duration: '1 round',
            components: ['V', 'S'],
            isTemplate: 1
        }
    ]);
});

const characterTable = createTableApi(db.table('characters'));
const weaponTable = createTableApi(db.table('weapons'));
const characterWeaponTable = createTableApi(db.table('characterWeapons'));
const spellTable = createTableApi(db.table('spells'));
const characterSpellTable = createTableApi(db.table('characterSpells'));
const rollHistoryTable = createTableApi(db.table('rollHistory'));

const ensureOwnedCharacter = async (id, userId) => {
    const record = await db.characters.get(id);
    if (!record || record.userId !== userId) {
        throw new Error('Character not found');
    }
    return record;
};

export const characterService = {
    ...characterTable,
    getAllByUser(userId) {
        return db.characters.where('userId').equals(userId).toArray();
    },
    async getByIdForUser(id, userId) {
        const record = await db.characters.get(id);
        return record?.userId === userId ? record : null;
    },
    addForUser(userId, character) {
        return characterTable.add({ ...character, userId });
    },
    async updateForUser(id, userId, updates) {
        await ensureOwnedCharacter(id, userId);
        return characterTable.update(id, updates);
    },
    async deleteForUser(id, userId) {
        await ensureOwnedCharacter(id, userId);
        return characterTable.remove(id);
    },
    delete: (id) => characterTable.remove(id)
};

export const weaponService = {
    ...weaponTable,
    async getTemplates() {
        return db.weapons.where('isTemplate').anyOf(1, true).toArray();
    },
    async getCharacterWeapons(characterId) {
        const characterWeapons = await db.characterWeapons.where('characterId').equals(characterId).toArray();
        const weapons = [];
        for (const charWeapon of characterWeapons) {
            const weapon = await db.weapons.get(charWeapon.weaponId);
            weapons.push({
                ...weapon,
                isEquipped: charWeapon.isEquipped,
                characterWeaponId: charWeapon.id,
                customName: charWeapon.customName || weapon?.name,
                attackBonusOverride: charWeapon.attackBonusOverride,
                damageBonusOverride: charWeapon.damageBonusOverride
            });
        }
        return weapons;
    },
    addToCharacter(characterId, weaponId, customProperties = {}) {
        return characterWeaponTable.add({
            characterId,
            weaponId,
            isEquipped: 0,
            ...customProperties
        });
    },
    addTemplate(weapon) {
        return weaponTable.add({
            ...weapon,
            isTemplate: 1
        });
    }
};

export const spellService = {
    ...spellTable,
    getTemplates() {
        return db.spells.where('isTemplate').anyOf(1, true).toArray();
    },
    async getCharacterSpells(characterId) {
        const characterSpells = await db.characterSpells.where('characterId').equals(characterId).toArray();
        const spells = [];
        for (const charSpell of characterSpells) {
            const spell = await db.spells.get(charSpell.spellId);
            spells.push({
                ...spell,
                prepared: charSpell.prepared,
                characterSpellId: charSpell.id,
                spellDcOverride: charSpell.spellDcOverride,
                spellAttackBonusOverride: charSpell.spellAttackBonusOverride
            });
        }
        return spells;
    },
    addToCharacter(characterId, spellId, customProperties = {}) {
        return characterSpellTable.add({
            characterId,
            spellId,
            prepared: false,
            ...customProperties
        });
    },
    addTemplate(spell) {
        return spellTable.add({
            ...spell,
            isTemplate: 1
        });
    }
};

export const rollHistoryService = {
    ...rollHistoryTable,
    addRoll(rollData) {
        return rollHistoryTable.add({
            ...rollData,
            timestamp: new Date()
        });
    },
    getCharacterRolls(characterId, limit = 10) {
        return db.rollHistory
            .where('characterId')
            .equals(characterId)
            .reverse()
            .limit(limit)
            .toArray();
    }
};

export { createTableApi, defineSchema };
export default db;