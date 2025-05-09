import { useEffect, useState } from 'react';
import { spellService } from '../services/db';

export default function SpellLibraryPage() {
  const [spellsByLevel, setSpellsByLevel] = useState({});
  const [activeTab, setActiveTab] = useState('0');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSpells = async () => {
      try {
        // First try to load from our database
        const dbSpells = await spellService.getTemplates();
        
        if (dbSpells.length === 0) {
          // If no spells in DB, fetch from API and save them
          const response = await fetch("https://www.dnd5eapi.co/api/spells");
          const data = await response.json();
          
          const results = await Promise.all(
            data.results.map(spell => fetch(`https://www.dnd5eapi.co${spell.url}`).then(res => res.json()))
          );

          // Save spells to database
          for (const spell of results) {
            await spellService.addTemplate({
              name: spell.name,
              level: spell.level,
              school: spell.school.name,
              description: spell.desc?.[0] || '',
              attackType: spell.attack_type || 'none',
              damageType: spell.damage?.damage_type?.name || '',
              damageDice: spell.damage?.damage_at_slot_level?.[spell.level] || '',
              range: spell.range,
              components: spell.components,
              duration: spell.duration,
              castingTime: spell.casting_time,
              isTemplate: true
            });
          }

          // Reload from database
          const updatedSpells = await spellService.getTemplates();
          groupSpellsByLevel(updatedSpells);
        } else {
          groupSpellsByLevel(dbSpells);
        }
      } catch (err) {
        console.error('Failed to fetch spells', err);
      } finally {
        setLoading(false);
      }
    };

    loadSpells();
  }, []);

  const groupSpellsByLevel = (spells) => {
    const grouped = {};
    spells.forEach(spell => {
      const level = spell.level?.toString() || '0';
      if (!grouped[level]) grouped[level] = [];
      grouped[level].push(spell);
    });
    setSpellsByLevel(grouped);
  };

  const sortedLevels = Object.keys(spellsByLevel).sort((a, b) => parseInt(a) - parseInt(b));

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="text-center py-12">
          <p>Loading spells...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="mb-6">Spell Library</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {sortedLevels.map(level => (
          <button
            key={level}
            className={`btn ${activeTab === level ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab(level)}
          >
            Level {level}
          </button>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Level {activeTab}</h2>
        <div className="space-y-2">
          {spellsByLevel[activeTab]?.map(spell => (
            <div key={spell.id} className="card bg-white/90 p-4">
              <h3 className="font-semibold">{spell.name}</h3>
              <p className="text-sm italic">{spell.school}</p>
              <div className="mt-2 text-sm">
                <p><strong>Casting Time:</strong> {spell.castingTime}</p>
                <p><strong>Range:</strong> {spell.range}</p>
                <p><strong>Components:</strong> {spell.components?.join(', ')}</p>
                <p><strong>Duration:</strong> {spell.duration}</p>
                {spell.damageDice && (
                  <p><strong>Damage:</strong> {spell.damageDice} {spell.damageType}</p>
                )}
              </div>
              <p className="text-sm mt-2">{spell.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

