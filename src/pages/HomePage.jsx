import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { characterService, rollHistoryService } from '../services/db';

function HomePage() {
    const [recentCharacters, setRecentCharacters] = useState([]);
    const [recentRolls, setRecentRolls] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                // Get the Characters
                const characters = await characterService.getAll();
                setRecentCharacters(characters.slice(0, 3));

                // Iff have character, get recent rolls for said character
                if (characters.length > 0) {
                    const rolls = await rollHistoryService.getCharacterRolls(characters[0].id, 5);
                    setRecentRolls(rolls);
                }
            } catch (error) {
                console.error('Error loading dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    return (
        <div className='max-w-4xl mx-auto'>
          <div className='text-center mb-12'>
            <h1 className='text-4xl md:text-5xl font-medieval mb-4'>Thorvik Shatterhorn's Attack Roller</h1>
            <p className='text-xl font-fantasy'>Thorvik says hit things hard with this</p>
          </div>
    
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Quick actions */}
            <div className="card bg-white/90">
              <h2>Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <Link to="/characters/new" className="btn btn-primary text-center">Create Character</Link>
                <Link to="/roll" className="btn btn-secondary text-center">Quick Roll</Link>
                <Link to="/weapons/library" className="btn btn-primary text-center">Browse Weapons</Link>
                <Link to="/spells/library" className="btn btn-secondary text-center">Browse Spells</Link>
              </div>
            </div>
    
            {/* Recent characters */}
            <div className="card bg-white/90">
              <div className="flex justify-between items-center mb-4">
                <h2 className="mb-0">Your Characters</h2>
                <Link to="/characters" className="text-primary-600 hover:text-primary-800 text-sm">View All</Link>
              </div>
              {loading ? (
                <p>Loading characters...</p>
              ) : recentCharacters.length > 0 ? (
                <ul className="space-y-2">
                  {recentCharacters.map(character => (
                    <li key={character.id} className="p-3 bg-secondary-100 rounded flex justify-between items-center">
                      <div>
                        <p className="font-bold">{character.name}</p>
                        <p className="text-sm">Level {character.level} {character.race} {character.class}</p>
                      </div>
                      <Link to={`/characters/${character.id}`} className="px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 text-sm">Select</Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-6">
                  <p className="mb-4">You haven't created any characters yet!</p>
                  <Link to="/characters/new" className="btn btn-primary">Create Your First Character</Link>
                </div>
              )}
            </div>
          </div>
    
          {/* Recent rolls */}
          <div className="card bg-white/90">
            <h2>Recent Rolls</h2>
            {loading ? (
              <p>Loading roll history...</p>
            ) : recentRolls.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-secondary-200">
                      <th className="text-left py-2">Time</th>
                      <th className="text-left py-2">Character</th>
                      <th className="text-left py-2">Roll Type</th>
                      <th className="text-left py-2">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRolls.map(roll => (
                      <tr key={roll.id} className="border-b border-secondary-100">
                        <td className="py-2 text-sm">{new Date(roll.timestamp).toLocaleTimeString()}</td>
                        <td className="py-2">{recentCharacters.find(c => c.id === roll.characterId)?.name || 'Unknown'}</td>
                        <td className="py-2">{roll.rollType}</td>
                        <td className="py-2 font-bold">{roll.finalResult}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6">
                <p>No roll history yet. Start rolling some dice!</p>
                <Link to="/roll" className="btn btn-primary mt-4">Roll Some Dice</Link>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    export default HomePage;
    