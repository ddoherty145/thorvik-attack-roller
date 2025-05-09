import Dexie from 'dexie';

const db = new Dexie('ThorvikAttackRollerDB');

// Define the database schema
db.version(1).stores({
    characters: '++id, name, class, level',
    weapons: '++id, name, weaponType, isTemplate',
    characterWeapons: '++id, characterId, weaponId, isEquipped',
    spells: '++id, name, level, school, isTemplate',
    characterSpells: '++id, characterId, spellId, prepared',
    rollHistory: '++id, characterId, characterWeaponId, characterSpellId, timestamp'
});

// Initialize with sample data
db.on('populate', async () => {
    console.log('Initializing database with sample data...');
    // Weapon template
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
            isTemplate: true
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
            isTemplate: true
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
            isTemplate: true
        }
    ]);
    console.log('Sample weapons added successfully');

    // Spell template
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
            isTemplate: true
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
            isTemplate: true
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
            isTemplate: true
        }
    ]);
});

// Helpers 
export const characterService = {
    async getAll() {
        return await db.characters.toArray();
    },
    async getById(id) {
        return await db.characters.get(id);
    },
    async add(character) {
        return await db.characters.add(character);
    },
    async update(id, character) {
        return await db.characters.put(id, character);
    },
    async delete(id) {
        return await db.characters.delete(id);
    }
};

export const weaponService = {
    async getTemplates() {
        console.log('Fetching weapon templates...');
        const templates = await db.weapons.where('isTemplate').equals(1).toArray();
        console.log('Found templates:', templates);
        return templates;
    },

    async getCharacterWeapons(characterId) {
        const characterWeapons = await db.characterWeapons
          .where('characterId').equals(characterId).toArray();

          // Weapon Details
          const weapons = [];
          for (const charWeapon of characterWeapons) {
            const weapon = await db.weapons.get(charWeapon.weaponId);
            weapons.push({
                ...weapon,
                isEquipped: charWeapon.isEquipped,
                characterWeaponId: charWeapon.id,
                customName: charWeapon.customName || weapon.name,
                attackBonusOverride: charWeapon.attackBonusOverride,
                damageBonusOverride: charWeapon.damageBonusOverride
            });
          }
            return weapons;
    },

    async addToCharacter(characterId, weaponId, customProperties = {}) {
        return await db.characterWeapons.add({
            characterId,
            weaponId,
            isEquipped: 0,
            ...customProperties
        });
    },

    async addTemplate(weapon) {
        return await db.weapons.add({
            ...weapon,
            isTemplate: 1
        });
    },

    getById: (id) => db.weapons.get(id),
    update: (id, weapon) => db.weapons.update(id, weapon)
};

export const spellService = {
    async getTemplates() {
      return await db.spells.where('isTemplate').equals(1).toArray();
    },
    
    async getCharacterSpells(characterId) {
      const characterSpells = await db.characterSpells
        .where('characterId').equals(characterId).toArray();
        
      // Get full spell details for each character spell
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
    
    async addToCharacter(characterId, spellId, customProperties = {}) {
      return await db.characterSpells.add({
        characterId,
        spellId,
        prepared: false,
        ...customProperties
      });
    }
  };
  
  export const rollHistoryService = {
    async addRoll(rollData) {
      return await db.rollHistory.add({
        ...rollData,
        timestamp: new Date()
      });
    },
    
    async getCharacterRolls(characterId, limit = 10) {
      return await db.rollHistory
        .where('characterId').equals(characterId)
        .reverse() // Get newest first
        .limit(limit)
        .toArray();
    }
  };
  
  export default db;