import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { characterService, weaponService, spellService, rollHistoryService } from '../services/db';
import { rollDice, calculateAbilityModifier } from '../utils/diceRoller';
import { PencilIcon, TrashIcon, PlusIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

function CharacterDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [character, setCharacter] = useState(null);
  const [weapons, setWeapons] = useState([]);
  const [spells, setSpells] = useState([]);
  const [rollHistory, setRollHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCharacter, setEditedCharacter] = useState(null);
  const [activeTab, setActiveTab] = useState('weapons');
  const [showAddWeapon, setShowAddWeapon] = useState(false);
  const [showAddSpell, setShowAddSpell] = useState(false);
  const [weaponTemplates, setWeaponTemplates] = useState([]);
  const [spellTemplates, setSpellTemplates] = useState([]);

  useEffect(() => {
    const loadCharacterData = async () => {
      try {
        // Load character
        const characterData = await characterService.getById(parseInt(id));
        if (!characterData) {
          navigate('/characters');
          return;
        }
        setCharacter(characterData);
        setEditedCharacter({...characterData});

        // Load weapons
        const weaponsData = await weaponService.getCharacterWeapons(parseInt(id));
        setWeapons(weaponsData);

        // Load spells
        const spellsData = await spellService.getCharacterSpells(parseInt(id));
        setSpells(spellsData);

        // Load roll history
        const rollHistoryData = await rollHistoryService.getCharacterRolls(parseInt(id), 10);
        setRollHistory(rollHistoryData);

        // Load templates for add modal
        const weapTemplates = await weaponService.getTemplates();
        setWeaponTemplates(weapTemplates);

        const spellTemps = await spellService.getTemplates();
        setSpellTemplates(spellTemps);
      } catch (error) {
        console.error('Error loading character data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCharacterData();
  }, [id, navigate]);

  const formatModifier = (score) => {
    const mod = calculateAbilityModifier(score);
    return mod >= 0 ? `+${mod}` : mod;
  };

  const getProficiencyBonus = () => {
    return character ? Math.ceil(1 + character.level / 4) : 2;
  };

  const handleSaveCharacter = async () => {
    try {
      await characterService.update(editedCharacter.id, editedCharacter);
      setCharacter(editedCharacter);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating character:', error);
    }
  };

  const handleAttackRoll = async (weapon) => {
    // Calculate attack bonus
    console.log('Weapon:', weapon);
    console.log('Character:', character);
    console.log('Weapon Ability Score:', weapon.abilityScore);
    
    // Map the weapon's ability score to the character's property name
    const abilityScoreMap = {
      'STR': 'strength',
      'DEX': 'dexterity',
      'CON': 'constitution',
      'INT': 'intelligence',
      'WIS': 'wisdom',
      'CHA': 'charisma'
    };
    
    const abilityScore = abilityScoreMap[weapon.abilityScore] || 'strength';
    console.log('Mapped Ability Score:', abilityScore);
    console.log('Character Stats:', {
      strength: character.strength,
      dexterity: character.dexterity,
      constitution: character.constitution,
      intelligence: character.intelligence,
      wisdom: character.wisdom,
      charisma: character.charisma
    });
    
    // Get the ability score value directly from the character object
    const abilityScoreValue = character[abilityScore];
    console.log('Character Ability Score Value:', abilityScoreValue);
    const abilityMod = calculateAbilityModifier(abilityScoreValue);
    console.log('Ability Modifier:', abilityMod);
    const profBonus = getProficiencyBonus();
    console.log('Proficiency Bonus:', profBonus);
    const magicalBonus = weapon.magicalBonus || 0;
    console.log('Magical Bonus:', magicalBonus);
    const attackBonus = abilityMod + profBonus + magicalBonus;
    console.log('Total Attack Bonus:', attackBonus);
    
    // Roll attack with the bonus included in the notation
    const attackRoll = rollDice(`1d20+${attackBonus}`);
    const attackTotal = attackRoll.total;
    
    // Roll damage
    const damageOptions = { critical: attackRoll.rolls[0] === 20 };
    const damageRoll = rollDice(weapon.damageDice, damageOptions);
    const damageBonus = abilityMod + magicalBonus;
    const damageTotal = damageRoll.total + (damageBonus || 0);
    
    // Save roll to history
    await rollHistoryService.addRoll({
      characterId: character.id,
      characterWeaponId: weapon.characterWeaponId,
      rollType: 'Attack',
      diceNotation: `1d20 + ${attackBonus}`,
      rollResult: attackRoll.rolls[0],
      modifiers: attackBonus,
      finalResult: attackTotal,
      isCritical: attackRoll.rolls[0] === 20,
      damageRoll: damageTotal,
      timestamp: new Date()
    });
    
    // Refresh roll history
    const updatedHistory = await rollHistoryService.getCharacterRolls(parseInt(id), 10);
    setRollHistory(updatedHistory);
    
    // Show result (in a real app, you might use a modal or toast)
    alert(`Attack Roll: ${attackTotal} (d20 roll: ${attackRoll.rolls[0]} + ${attackBonus})\n${attackRoll.rolls[0] === 20 ? 'CRITICAL HIT! ' : ''}Damage: ${damageTotal} (${damageRoll.rolls.join(' + ')} + ${damageBonus})`);
  };

  const handleSpellAttack = async (spell) => {
    // Calculate spell attack bonus
    const abilityScore = character.spellcastingAbility || 'INT';
    const abilityMod = calculateAbilityModifier(character[abilityScore.toLowerCase()]);
    const profBonus = getProficiencyBonus();
    const spellAttackBonus = abilityMod + profBonus + (spell.spellAttackBonusOverride || 0);
    
    // Roll spell attack
    const attackRoll = rollDice(`1d20+${spellAttackBonus}`);
    const attackTotal = attackRoll.total;
    
    // Roll damage if applicable
    let damageTotal = 0;
    if (spell.damageDice) {
      const damageRoll = rollDice(spell.damageDice);
      damageTotal = damageRoll.total;
    }
    
    // Save roll to history
    await rollHistoryService.addRoll({
      characterId: character.id,
      characterSpellId: spell.characterSpellId,
      rollType: 'Spell Attack',
      diceNotation: `1d20 + ${spellAttackBonus}`,
      rollResult: attackRoll.rolls[0],
      modifiers: spellAttackBonus,
      finalResult: attackTotal,
      isCritical: attackRoll.rolls[0] === 20,
      damageRoll: damageTotal,
      timestamp: new Date()
    });
    
    // Refresh roll history
    const updatedHistory = await rollHistoryService.getCharacterRolls(parseInt(id), 10);
    setRollHistory(updatedHistory);
    
    // Show result
    alert(`Spell Attack Roll: ${attackTotal} (d20 roll: ${attackRoll.rolls[0]} + ${spellAttackBonus})\n${attackRoll.rolls[0] === 20 ? 'CRITICAL HIT! ' : ''}${spell.damageDice ? `Damage: ${damageTotal}` : ''}`);
  };

  const handleAddWeapon = async (weaponTemplateId) => {
    try {
      await weaponService.addToCharacter(character.id, weaponTemplateId);
      const updatedWeapons = await weaponService.getCharacterWeapons(character.id);
      setWeapons(updatedWeapons);
      setShowAddWeapon(false);
    } catch (error) {
      console.error('Error adding weapon:', error);
    }
  };

  const handleAddSpell = async (spellTemplateId) => {
    try {
      await spellService.addToCharacter(character.id, spellTemplateId);
      const updatedSpells = await spellService.getCharacterSpells(character.id);
      setSpells(updatedSpells);
      setShowAddSpell(false);
    } catch (error) {
      console.error('Error adding spell:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p>Loading character...</p>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="text-center py-12">
        <p>Character not found.</p>
        <Link to="/characters" className="btn btn-primary mt-4">Back to Characters</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link to="/characters" className="text-primary-600 hover:text-primary-800">
          &larr; Back to Characters
        </Link>
      </div>

      {/* Character Header */}
      <div className="card bg-white/90 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="mb-1">{character.name}</h1>
            <p className="text-lg">Level {character.level} {character.race} {character.class}</p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="btn btn-secondary flex items-center"
          >
            {isEditing ? (
              <>Cancel</>
            ) : (
              <>
                <PencilIcon className="h-4 w-4 mr-1" />
                Edit
              </>
            )}
          </button>
        </div>

        {isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Name</label>
              <input
                type="text"
                value={editedCharacter.name}
                onChange={(e) => setEditedCharacter({...editedCharacter, name: e.target.value})}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Level</label>
              <input
                type="number"
                value={editedCharacter.level}
                onChange={(e) => setEditedCharacter({...editedCharacter, level: parseInt(e.target.value)})}
                className="input w-full"
                min="1"
                max="20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Race</label>
              <input
                type="text"
                value={editedCharacter.race}
                onChange={(e) => setEditedCharacter({...editedCharacter, race: e.target.value})}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Class</label>
              <input
                type="text"
                value={editedCharacter.class}
                onChange={(e) => setEditedCharacter({...editedCharacter, class: e.target.value})}
                className="input w-full"
              />
            </div>
            {/* Ability Scores */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-secondary-700 mb-1">Ability Scores</label>
              <div className="grid grid-cols-6 gap-2">
                {['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].map(ability => (
                  <div key={ability}>
                    <label className="block text-xs text-center text-secondary-600 uppercase">{ability.substring(0, 3)}</label>
                    <input
                      type="number"
                      value={editedCharacter[ability]}
                      onChange={(e) => setEditedCharacter({...editedCharacter, [ability]: parseInt(e.target.value)})}
                      className="input w-full text-center"
                      min="1"
                      max="30"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">HP</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={editedCharacter.currentHP}
                  onChange={(e) => setEditedCharacter({...editedCharacter, currentHP: parseInt(e.target.value)})}
                  className="input w-full"
                  min="0"
                />
                <span className="flex items-center">/</span>
                <input
                  type="number"
                  value={editedCharacter.maxHP}
                  onChange={(e) => setEditedCharacter({...editedCharacter, maxHP: parseInt(e.target.value)})}
                  className="input w-full"
                  min="1"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Armor Class</label>
              <input
                type="number"
                value={editedCharacter.armorClass}
                onChange={(e) => setEditedCharacter({...editedCharacter, armorClass: parseInt(e.target.value)})}
                className="input w-full"
                min="1"
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button onClick={handleSaveCharacter} className="btn btn-primary flex items-center">
                <CheckIcon className="h-4 w-4 mr-1" />
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Character Stats Display */}
            <div className="grid grid-cols-6 gap-2 mb-4">
              <div className="text-center p-2 bg-secondary-100 rounded">
                <div className="text-xs text-secondary-600 uppercase">STR</div>
                <div className="font-bold">{character.strength}</div>
                <div className="text-sm">{formatModifier(character.strength)}</div>
              </div>
              <div className="text-center p-2 bg-secondary-100 rounded">
                <div className="text-xs text-secondary-600 uppercase">DEX</div>
                <div className="font-bold">{character.dexterity}</div>
                <div className="text-sm">{formatModifier(character.dexterity)}</div>
              </div>
              <div className="text-center p-2 bg-secondary-100 rounded">
                <div className="text-xs text-secondary-600 uppercase">CON</div>
                <div className="font-bold">{character.constitution}</div>
                <div className="text-sm">{formatModifier(character.constitution)}</div>
              </div>
              <div className="text-center p-2 bg-secondary-100 rounded">
                <div className="text-xs text-secondary-600 uppercase">INT</div>
                <div className="font-bold">{character.intelligence}</div>
                <div className="text-sm">{formatModifier(character.intelligence)}</div>
              </div>
              <div className="text-center p-2 bg-secondary-100 rounded">
                <div className="text-xs text-secondary-600 uppercase">WIS</div>
                <div className="font-bold">{character.wisdom}</div>
                <div className="text-sm">{formatModifier(character.wisdom)}</div>
              </div>
              <div className="text-center p-2 bg-secondary-100 rounded">
                <div className="text-xs text-secondary-600 uppercase">CHA</div>
                <div className="font-bold">{character.charisma}</div>
                <div className="text-sm">{formatModifier(character.charisma)}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-2 bg-secondary-100 rounded text-center">
                <div className="text-xs text-secondary-600 uppercase">HP</div>
                <div className="font-bold">{character.currentHP} / {character.maxHP}</div>
              </div>
              <div className="p-2 bg-secondary-100 rounded text-center">
                <div className="text-xs text-secondary-600 uppercase">AC</div>
                <div className="font-bold">{character.armorClass}</div>
              </div>
              <div className="p-2 bg-secondary-100 rounded text-center">
                <div className="text-xs text-secondary-600 uppercase">Prof. Bonus</div>
                <div className="font-bold">+{getProficiencyBonus()}</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Tabs for Weapons and Spells */}
      <div className="mb-6">
        <div className="flex border-b border-secondary-200">
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'weapons' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-secondary-600 hover:text-secondary-800'}`}
            onClick={() => setActiveTab('weapons')}
          >
            Weapons
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'spells' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-secondary-600 hover:text-secondary-800'}`}
            onClick={() => setActiveTab('spells')}
          >
            Spells
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'history' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-secondary-600 hover:text-secondary-800'}`}
            onClick={() => setActiveTab('history')}
          >
            Roll History
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'weapons' && (
        <div className="card bg-white/90">
          <div className="flex justify-between items-center mb-4">
            <h2 className="mb-0">Weapons</h2>
            <button 
              onClick={() => setShowAddWeapon(true)}
              className="btn btn-primary flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Weapon
            </button>
          </div>

          {weapons.length > 0 ? (
            <div className="space-y-4">
              {weapons.map(weapon => (
                <div key={weapon.characterWeaponId} className="p-4 bg-secondary-100 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="mb-0">{weapon.customName || weapon.name}</h3>
                    <button 
                      onClick={() => handleAttackRoll(weapon)}
                      className="btn btn-secondary text-sm"
                    >
                      Roll Attack
                    </button>
                  </div>
                  <div className="text-sm text-secondary-600 mb-2">{weapon.weaponType}</div>
                  <div className="grid md:grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Damage:</span> {weapon.damageDice} {weapon.damageType}
                    </div>
                    <div>
                      <span className="font-medium">Properties:</span> {weapon.properties ? weapon.properties.join(', ') : 'None'}
                    </div>
                    <div>
                      <span className="font-medium">Range:</span> {weapon.range}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="mb-4">No weapons added yet.</p>
              <button 
                onClick={() => setShowAddWeapon(true)}
                className="btn btn-primary"
              >
                Add Your First Weapon
              </button>
            </div>
          )}

          {/* Add Weapon Modal */}
          {showAddWeapon && (
            <div className="fixed inset-0 bg-secondary-900/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">Add Weapon</h3>
                  <button onClick={() => setShowAddWeapon(false)} className="text-secondary-500 hover:text-secondary-700">
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <div className="space-y-4">
                  {weaponTemplates.map(weapon => (
                    <div key={weapon.id} className="p-3 bg-secondary-100 hover:bg-secondary-200 rounded flex justify-between items-center cursor-pointer" onClick={() => handleAddWeapon(weapon.id)}>
                      <div>
                        <div className="font-medium">{weapon.name}</div>
                        <div className="text-sm text-secondary-600">{weapon.damageDice} {weapon.damageType}, {weapon.weaponType}</div>
                      </div>
                      <PlusIcon className="h-5 w-5 text-primary-600" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'spells' && (
        <div className="card bg-white/90">
          <div className="flex justify-between items-center mb-4">
            <h2 className="mb-0">Spells</h2>
            <button 
              onClick={() => setShowAddSpell(true)}
              className="btn btn-primary flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Spell
            </button>
          </div>

          {spells.length > 0 ? (
            <div className="space-y-4">
              {spells.map(spell => (
                <div key={spell.characterSpellId} className="p-4 bg-secondary-100 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="mb-0">{spell.name}</h3>
                      <div className="text-sm text-secondary-600">Level {spell.level} {spell.school}</div>
                    </div>
                    {spell.attackType !== 'none' && (
                      <button 
                        onClick={() => handleSpellAttack(spell)}
                        className="btn btn-secondary text-sm"
                      >
                        Roll Spell
                      </button>
                    )}
                  </div>
                  <div className="text-sm mb-2">
                    <p><strong>Casting Time:</strong> {spell.castingTime}</p>
                    <p><strong>Range:</strong> {spell.range}</p>
                    <p><strong>Components:</strong> {spell.components?.join(', ')}</p>
                    <p><strong>Duration:</strong> {spell.duration}</p>
                    {spell.damageDice && (
                      <p><strong>Damage:</strong> {spell.damageDice} {spell.damageType}</p>
                    )}
                  </div>
                  <p className="text-sm">{spell.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="mb-4">No spells added yet.</p>
              <button 
                onClick={() => setShowAddSpell(true)}
                className="btn btn-primary"
              >
                Add Your First Spell
              </button>
            </div>
          )}

          {/* Add Spell Modal */}
          {showAddSpell && (
            <div className="fixed inset-0 bg-secondary-900/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">Add Spell</h3>
                  <button onClick={() => setShowAddSpell(false)} className="text-secondary-500 hover:text-secondary-700">
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <div className="space-y-4">
                  {spellTemplates
                    .sort((a, b) => {
                      // First sort by level
                      if (a.level !== b.level) {
                        return a.level - b.level;
                      }
                      // Then sort alphabetically by name
                      return a.name.localeCompare(b.name);
                    })
                    .map(spell => (
                      <div 
                        key={spell.id} 
                        className="p-3 bg-secondary-100 hover:bg-secondary-200 rounded flex justify-between items-center cursor-pointer" 
                        onClick={() => handleAddSpell(spell.id)}
                      >
                        <div>
                          <div className="font-medium">{spell.name}</div>
                          <div className="text-sm text-secondary-600">
                            Level {spell.level} {spell.school}
                          </div>
                        </div>
                        <PlusIcon className="h-5 w-5 text-primary-600" />
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="card bg-white/90">
          <h2>Roll History</h2>
          {rollHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-secondary-200">
                    <th className="text-left py-2">Time</th>
                    <th className="text-left py-2">Roll Type</th>
                    <th className="text-left py-2">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {rollHistory.map(roll => (
                    <tr key={roll.id} className="border-b border-secondary-100">
                      <td className="py-2 text-sm">{new Date(roll.timestamp).toLocaleString()}</td>
                      <td className="py-2">{roll.rollType} {roll.spellName ? `(${roll.spellName})` : ''}</td>
                      <td className="py-2 font-bold">{roll.finalResult}{roll.isCritical ? ' (Critical!)' : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p>No roll history yet. Try attacking with a weapon or casting a spell!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CharacterDetailPage;