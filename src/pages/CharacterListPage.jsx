import {useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { characterService } from '../services/db';
import { calculateAbilityModifier } from '../utils/diceRoller';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

function CharacterListPage() {
    const [characters, setCharacters] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    useEffect(() => {
        const loadCharacters = async () => {
            try {
                if (!currentUser) {
                    navigate('/login');
                    return;
                }
                const characterData = await characterService.getAllByUser(currentUser.id);
                setCharacters(characterData || []);
            } catch (error) {
                console.error('Error loading characters:', error)
            } finally {
                setLoading(false);
            }
        };

        loadCharacters();
    }, [currentUser, navigate]);

    const handleDeleteCharacter = async (id , name , event) => {
        event.preventDefault();
        event.stopPropagation();

        if (window.confirm(`Are you sure you want to delete ${name}? This cannot be undone.`)) {
            try {
                if (!currentUser) {
                    navigate('/login');
                    return;
                }
                await characterService.deleteForUser(id, currentUser.id);
                setCharacters(characters.filter(character => character.id != id));
            } catch (error) {
                console.error('Error deleting character:', error);
            }
        }
    };

    const formatModifier = (score) => {
        const mod = calculateAbilityModifier(score);
        return mod >= 0 ? `${mod}` : mod;
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1>Your Characters</h1>
                <Link to="/characters/new" className="btn btn-primary flex items-center">
                <PlusIcon className="h-5 w-5 mr-1" />
                New Character
                </Link>
            </div>

            {loading ? (
        <div className="text-center py-12">
          <p>Loading characters...</p>
        </div>
      ) : characters.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {characters.map(character => (
            <Link 
              key={character.id} 
              to={`/characters/${character.id}`}
              className="card bg-white/90 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between">
                <h2 className="mb-1">{character.name}</h2>
                <button 
                  onClick={(e) => handleDeleteCharacter(character.id, character.name, e)}
                  className="text-secondary-500 hover:text-red-600 transition-colors"
                  aria-label="Delete character"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
              <p className="text-lg mb-4">Level {character.level} {character.race} {character.class}</p>
              
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
              
              <div className="flex justify-between text-sm">
                <div>
                  <span className="font-bold">HP:</span> {character.currentHP}/{character.maxHP}
                </div>
                <div>
                  <span className="font-bold">AC:</span> {character.armorClass}
                </div>
                <div>
                  <span className="font-bold">Prof:</span> +{character.proficiencyBonus || Math.ceil(1 + character.level / 4)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card bg-white/90 text-center py-12">
          <h2>No Characters Yet</h2>
          <p className="mb-6">Create your first character to get started with the D&D Attack Roller!</p>
          <Link to="/characters/new" className="btn btn-primary inline-flex items-center">
            <PlusIcon className="h-5 w-5 mr-1" />
            Create Character
          </Link>
        </div>
      )}
    </div>
  );
}

export default CharacterListPage;