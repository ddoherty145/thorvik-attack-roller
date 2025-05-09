import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { weaponService } from '../services/db';

export default function NewWeaponPage() {
  const navigate = useNavigate();
  const [weapon, setWeapon] = useState({
    name: '',
    weaponType: '',
    damageDice: '',
    damageType: '',
    range: '',
    properties: '',
    abilityScore: 'STR',
    magicalBonus: 0
  });

  const handleChange = (field, value) => {
    setWeapon(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await weaponService.addTemplate({
      ...weapon,
      properties: weapon.properties.split(',').map(p => p.trim()),
      isTemplate: true
    });
    navigate('/weapons/library');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="mb-6">Add New Weapon</h1>
      <form onSubmit={handleSubmit} className="space-y-4 card bg-white/90 p-6">
        <div>
          <input className="input w-full" placeholder="Name" value={weapon.name} onChange={e => handleChange('name', e.target.value)} required />
        </div>
        <div>
          <input className="input w-full" placeholder="Weapon Type" value={weapon.weaponType} onChange={e => handleChange('weaponType', e.target.value)} required />
        </div>
        <div>
          <input 
            className="input w-full" 
            placeholder="Damage Dice (e.g., 1d8, 2d6+1d4, 3d8+5)" 
            value={weapon.damageDice} 
            onChange={e => handleChange('damageDice', e.target.value)} 
            required 
          />
          <p className="text-sm text-secondary-600 mt-1">
            You can combine multiple dice types (e.g., 2d6+1d4) or add modifiers (e.g., 1d8+5)
          </p>
        </div>
        <div>
          <input className="input w-full" placeholder="Damage Type" value={weapon.damageType} onChange={e => handleChange('damageType', e.target.value)} required />
        </div>
        <div>
          <input className="input w-full" placeholder="Range (e.g., 5ft, 20/60 ft)" value={weapon.range} onChange={e => handleChange('range', e.target.value)} />
        </div>
        <div>
          <input className="input w-full" placeholder="Properties (comma-separated)" value={weapon.properties} onChange={e => handleChange('properties', e.target.value)} />
        </div>
        <div>
          <input className="input w-full" placeholder="Ability Score (STR or DEX)" value={weapon.abilityScore} onChange={e => handleChange('abilityScore', e.target.value)} />
        </div>
        <div>
          <input type="number" className="input w-full" placeholder="Magical Bonus" value={weapon.magicalBonus} onChange={e => handleChange('magicalBonus', parseInt(e.target.value))} />
        </div>
        <button type="submit" className="btn btn-primary">Save Weapon</button>
      </form>
    </div>
  );
}