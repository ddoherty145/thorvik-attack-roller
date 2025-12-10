import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { characterService } from '../services/db';
import { useAuth } from '../context/AuthContext';

export default function CreateCharacterPage() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [character, setCharacter] = useState({
        name: '',
        race: '',
        class: '',
        level: 1,
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
        currentHP: 10,
        maxHP: 10,
        armorClass: 10,
        spellcastingAbility: 'INT'
    });

    const handleChange = (field, value) => {
        setCharacter(prev => ({...prev, [field]: value}));

    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            navigate('/login');
            return;
        }
        await characterService.addForUser(currentUser.id, character);
        navigate('/characters');
    };
    return (
        <div className="max-w-3xl mx-auto">
          <h1 className="mb-6">Create New Character</h1>
          <form onSubmit={handleSubmit} className="space-y-6 card bg-white/90 p-6">
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Name" value={character.name} onChange={e => handleChange('name', e.target.value)} className="input w-full" required />
              <input type="text" placeholder="Race" value={character.race} onChange={e => handleChange('race', e.target.value)} className="input w-full" required />
              <input type="text" placeholder="Class" value={character.class} onChange={e => handleChange('class', e.target.value)} className="input w-full" required />
              <input type="number" placeholder="Level" value={character.level} onChange={e => handleChange('level', parseInt(e.target.value))} className="input w-full" required />
            </div>
            <div className="grid grid-cols-6 gap-2">
              {['strength','dexterity','constitution','intelligence','wisdom','charisma'].map(attr => (
                <input key={attr} type="number" min="1" max="30" placeholder={attr.toUpperCase().slice(0, 3)} value={character[attr]} onChange={e => handleChange(attr, parseInt(e.target.value))} className="input text-center" required />
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <input type="number" placeholder="Current HP" value={character.currentHP} onChange={e => handleChange('currentHP', parseInt(e.target.value))} className="input w-full" required />
              <input type="number" placeholder="Max HP" value={character.maxHP} onChange={e => handleChange('maxHP', parseInt(e.target.value))} className="input w-full" required />
              <input type="number" placeholder="Armor Class" value={character.armorClass} onChange={e => handleChange('armorClass', parseInt(e.target.value))} className="input w-full" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-secondary-700">Spellcasting Ability</label>
                    <select
                        className="input w-full"
                        value={character.spellcastingAbility}
                        onChange={e => handleChange('spellcastingAbility', e.target.value)}
                    >
                        <option value="INT">Intelligence</option>
                        <option value="WIS">Wisdom</option>
                        <option value="CHA">Charisma</option>
                    </select>
                </div>
            </div>
            <button type="submit" className="btn btn-primary">Create Character</button>
          </form>
        </div>
      );
    }
