import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { weaponService } from '../services/db';

export default function EditWeaponPage() {
  const navigate = useNavigate();
  const { id } = useParams();
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWeapon = async () => {
      try {
        const weaponData = await weaponService.getById(parseInt(id));
        if (weaponData) {
          setWeapon({
            ...weaponData,
            properties: weaponData.properties?.join(', ') || ''
          });
        }
      } catch (error) {
        console.error('Error loading weapon:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWeapon();
  }, [id]);

  const handleChange = (field, value) => {
    setWeapon(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await weaponService.update(parseInt(id), {
        ...weapon,
        properties: weapon.properties.split(',').map(p => p.trim()),
        isTemplate: 1
      });
      navigate('/weapons/library');
    } catch (error) {
      console.error('Error updating weapon:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-12">
          <p>Loading weapon...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="mb-6">Edit Weapon</h1>
      <form onSubmit={handleSubmit} className="space-y-4 card bg-white/90 p-6">
        <div>
          <input 
            className="input w-full" 
            placeholder="Name" 
            value={weapon.name} 
            onChange={e => handleChange('name', e.target.value)} 
            required 
          />
        </div>
        <div>
          <input 
            className="input w-full" 
            placeholder="Weapon Type" 
            value={weapon.weaponType} 
            onChange={e => handleChange('weaponType', e.target.value)} 
            required 
          />
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
          <input 
            className="input w-full" 
            placeholder="Damage Type" 
            value={weapon.damageType} 
            onChange={e => handleChange('damageType', e.target.value)} 
            required 
          />
        </div>
        <div>
          <input 
            className="input w-full" 
            placeholder="Range (e.g., 5ft, 20/60 ft)" 
            value={weapon.range} 
            onChange={e => handleChange('range', e.target.value)} 
          />
        </div>
        <div>
          <input 
            className="input w-full" 
            placeholder="Properties (comma-separated)" 
            value={weapon.properties} 
            onChange={e => handleChange('properties', e.target.value)} 
          />
        </div>
        <div>
          <input 
            className="input w-full" 
            placeholder="Ability Score (STR or DEX)" 
            value={weapon.abilityScore} 
            onChange={e => handleChange('abilityScore', e.target.value)} 
          />
        </div>
        <div>
          <input 
            type="number" 
            className="input w-full" 
            placeholder="Magical Bonus" 
            value={weapon.magicalBonus} 
            onChange={e => handleChange('magicalBonus', parseInt(e.target.value))} 
          />
        </div>
        <div className="flex justify-end space-x-4">
          <button 
            type="button" 
            onClick={() => navigate('/weapons/library')} 
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
} 