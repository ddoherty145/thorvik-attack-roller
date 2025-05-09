import { useEffect, useState } from 'react';
import { spellService } from '../services/db';

export default function SpellLibraryPage() {
  const [spells, setSpells] = useState([]);

  useEffect(() => {
    spellService.getTemplates().then(setSpells);
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="mb-6">Spell Library</h1>
      <div className="space-y-4">
        {spells.map(spell => (
          <div key={spell.id} className="card bg-white/90 p-4">
            <h2>{spell.name} (Level {spell.level})</h2>
            <p className="text-sm italic">{spell.school}</p>
            <p className="mt-2">{spell.description}</p>
            <div className="mt-2 text-sm">
              <p><strong>Components:</strong> {spell.components?.join(', ')}</p>
              {spell.damageDice && <p><strong>Damage:</strong> {spell.damageDice} {spell.damageType}</p>}
              <p><strong>Duration:</strong> {spell.duration}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}