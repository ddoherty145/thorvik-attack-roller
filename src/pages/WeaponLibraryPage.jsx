import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { weaponService } from '../services/db';
import { PencilIcon } from '@heroicons/react/24/outline';

export default function WeaponLibraryPage() {
  const [weapons, setWeapons] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadWeapons = async () => {
      try {
        const templates = await weaponService.getTemplates();
        console.log('Loaded weapon templates:', templates);
        setWeapons(templates);
      } catch (error) {
        console.error('Error loading weapons:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWeapons();
  }, []);

  const handleEdit = (weaponId) => {
    navigate(`/weapons/edit/${weaponId}`);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1>Weapon Library</h1>
          <Link to="/weapons/new" className="btn btn-primary">
            Add New Weapon
          </Link>
        </div>
        <div className="text-center py-12">
          <p>Loading weapons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1>Weapon Library</h1>
        <Link to="/weapons/new" className="btn btn-primary">
          Add New Weapon
        </Link>
      </div>
      <div className="space-y-4">
        {weapons.length === 0 ? (
          <div className="text-center py-12">
            <p>No weapons found. Create your first weapon!</p>
          </div>
        ) : (
          weapons.map(weapon => (
            <div key={weapon.id} className="card bg-white/90 p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2>{weapon.name}</h2>
                  <p className="text-sm italic">{weapon.weaponType}</p>
                  <div className="mt-2 text-sm">
                    <p><strong>Damage:</strong> {weapon.damageDice} {weapon.damageType}</p>
                    <p><strong>Properties:</strong> {weapon.properties?.join(', ') || 'None'}</p>
                    <p><strong>Range:</strong> {weapon.range}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleEdit(weapon.id)}
                  className="btn btn-secondary flex items-center"
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Edit
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}