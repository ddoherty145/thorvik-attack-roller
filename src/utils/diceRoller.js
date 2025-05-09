/**
 * Parse a dice roll string and return the results
 * @param {string} notation - Dice notation
 * @param {object} options - Options for the dice roll
 * @param {boolean} options.advantage - Roll with advantage
 * @param {boolean} options.disadvantage - Roll with disadvantage
 * @param {boolean} options.critical - Roll with critical success (double damage)
 * @param {object} Result of dice roll
 */

export function rollDice(notation, options ={}) {
    const { advantage = false, disadvantage = false, critical = false } = options;

    // Parse the dice notation
    const parseNotation = parseDiceNotation(notation);

    // Handle invalid notation
    if (!parseNotation) {
        return {
            success: false,
            error: 'Invalid dice notation',
            total: 0,
            rolls: [],
            notation
         };
    }

    const { diceCount, diceType, modifier } = parseNotation;

    // For advantage/disadvantage (rol twice)
    let rolls = [];
    let roll1 = [];
    let roll2 = [];

    //Determine the number of rolls to make
    const actualDiceCount = critical ? diceCount * 2 : diceCount;

    // Roll the dice
    roll1 = rollDiceOfType(actualDiceCount, diceType);

    // If advantage or disadvantage is selected, roll again
   const hasAdvantage = advantage && !disadvantage;
   const hasDisadvantage = disadvantage && !advantage;
   const hasBoth = advantage && disadvantage;

   if (hasBoth) {
        rolls = roll1;
   } else if (hasAdvantage || hasDisadvantage) {
        roll2 = rollDiceOfType(actualDiceCount, diceType);

        const sum1 = roll1.reduce((a, b) => a + b, 0);
        const sum2 = roll2.reduce((a, b) => a + b, 0);

        if ((hasAdvantage && sum1 > sum2) || (hasDisadvantage && sum1 < sum2)) {
            rolls = roll2;
        } else {
            rolls = roll1;
        }
   } else {
      rolls = roll1;
   }

    const diceSum = rolls.reduce((a, b) => a + b, 0);
    const total = diceSum + modifier;

    return {
        success: true,
        total,
        rolls,
        modifier,
        diceSum,
        notation,
        critical,
        advantage,
        disadvantage,
        roll1: advantage || disadvantage ? roll1 : null,
        roll2: advantage || disadvantage ? roll2 : null
    };
}

/**
 * Parse a dice notation string and return the components
 * @param {string} notation - Dice notation
 * @returns {object|null} Parsed components of the dice notation
 */

function parseDiceNotation(notation) {
    // Split the notation into parts (e.g., "2d6+1d4" becomes ["2d6", "1d4"])
    const parts = notation.toLowerCase().replace(/\s+/g, '').split(/[+-]/);
    const operators = notation.match(/[+-]/g) || [];
    
    let totalDiceCount = 0;
    let totalModifier = 0;
    let diceType = 0;
    
    // Process each part
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isNegative = i > 0 && operators[i - 1] === '-';
        
        // Check if it's a dice roll (e.g., "2d6")
        const diceMatch = part.match(/^(\d+)d(\d+)$/);
        if (diceMatch) {
            const count = parseInt(diceMatch[1], 10);
            const type = parseInt(diceMatch[2], 10);
            totalDiceCount += count;
            diceType = type; // We'll use the last dice type for simplicity
        } else {
            // It's a modifier (e.g., "+5")
            const modifier = parseInt(part, 10);
            if (!isNaN(modifier)) {
                totalModifier += isNegative ? -modifier : modifier;
            }
        }
    }
    
    if (totalDiceCount === 0) return null;
    
    return {
        diceCount: totalDiceCount,
        diceType: diceType,
        modifier: totalModifier
    };
}

/**
 * Roll multiple dice of a specific type
 * @param {number} count - Number of dice to roll
 * @param {number} type - Type of dice (e.g., 6 for d6)
 * @returns {number[]} Array of rolled values
 */
function rollDiceOfType(count, type) {
    const results = [];
    for (let i = 0; i < count; i++) {
        results.push(Math.floor(Math.random() * type) + 1);
    }

    return results;
}

/**
 * Calculate attack bonus based on the character's stats
 * @param {object} character - Character object
 * @param {object} weapon - Weapon object
 * @param {number} Attack Bonus
 */
export function calculateAttackBonus(character, weapon) {
    if (!character || !weapon) return 0;

    // Determine which ability modifier to use
    const abilityScore = weapon.abilityScore || 'STR';
    let abilityMod = calculateAbilityModifier(character[abilityScore.toLowerCase()]);

    // For finesse weapons, allow using DEX instead of STR if it's higher
    if (weapon.properties && weapon.properties.includes('finesse')) {
        const dexMod = calculateAbilityModifier(character.dexterity);
        if (dexMod > abilityMod) {
            abilityMod = dexMod;
        }
    }

    // Add magical bonus from the weapon
    const magicalBonus = weapon.magicalBonus || 0;

    // Add any override specified for the specific character-weapon
    const overrideBonus = weapon.damageBonusOverride || 0;

    return abilityMod + magicalBonus + overrideBonus;
}

/**
 * Calculate ability modifier from ability score
 * @param {number} score - Ability score
 * @returns {number} Ability Modifier
 */
export function calculateAbilityModifier(score) {
    return Math.floor((score - 10) / 2);
}

/**
 * Format dice roll results for display
 * @param {object} rollResult - Result from rollDice function
 * @returns {string} Formatted string with dice results
 */
export function formatRollResult(rollResult) {
    if (!rollResult.success) {
        return `Error: ${rollResult.error}`;
    }

    let resultText = `Roll: ${rollResult.notation} = ${rollResult.total}`;

    if (rollResult.rolls.length > 0) {
        resultText += ` (${rollResult.rolls.join(', ')}`;
        if (rollResult.modifier !== 0) {
            resultText += ` ${rollResult.modifier >= 0 ? '+' : ''}${rollResult.modifier}`;
        }
        resultText += ')';
    }

    if (rollResult.critical) {
        resultText += ' [CRITICAL HIT!]';
    }

    if (rollResult.advantage) {
        resultText += '[ Advantage]';
        resultText += ` (Rolled ${rollResult.roll1.join(', ')} and ${rollResult.roll2.join(', ')})`;
    } else if (rollResult.disadvantage) {
        resultText += ' [Disadvantage]';
        resultText += ` (Rolled ${rollResult.roll1.join(', ')} and ${rollResult.roll2.join(', ')})`;
    }

    return resultText;
}