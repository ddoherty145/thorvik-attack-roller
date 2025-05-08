import { useState } from 'react';
import { rollDice, formatRollResult } from '../utils/diceRoller';

function QuickRollPage() {
    const [diceNotation, setDiceNotation] = useState('1d20');
    const [rollHistory, setRollHistory] = useState([]);
    const [advantage, setAdvantage] = useState(false);
    const [disadvantage, setDisadvantage] = useState(false);
    const [critical, setCritical] = useState(false);

    const commonDice = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];

    const handleRoll = () => {
        const rollResult = rollDice(diceNotation, advantage, disadvantage, critical);

        if (rollResult.success) {
            const newRoll = {
                id: Date.now(),
                result: rollResult,
                timestamp: new Date(),
                formatted: formatRollResult(rollResult),
            };

            setRollHistory([newRoll, ...rollHistory].slice(0, 10));
        } else {
            alert('Failed to roll the dice. Please try again.');
        }
    };

    const handleQuickRoll = (diceType) => {
        setDiceNotation(`1${diceType}`);
        const rollResult = rollDice(`1${diceType}`, { advantage, disadvantage, critical });

        const newRoll = {
            id: Date.now(),
            result: rollResult,
            timestamp: new Date(),
            formatted: formatRollResult(rollResult),
        };

        setRollHistory([newRoll, ...rollHistory].slice(0, 10));
    };

    const handleAdvantageChange = (e) => {
        const isChecked = e.target.checked;
        setAdvantage(isChecked);
        if (isChecked) {
            setDisadvantage(false);
        }
    };

    const handleDisadvantageChange = (e) => {
        const isChecked = e.target.checked;
        setDisadvantage(isChecked);
        if (isChecked) {
            setAdvantage(false);
        }
    };

    const clearHistory = () => {
        setRollHistory([]);
    };

    return (
        <div className="max-w-4xl mx-auto">
          <h1>Dice Roller</h1>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card bg-white/90">
              <h2>Roll Dice</h2>
              
              <div className="mb-4">
                <label htmlFor="diceNotation" className="block text-sm font-medium text-secondary-700 mb-1">
                  Dice Notation
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="diceNotation"
                    value={diceNotation}
                    onChange={(e) => setDiceNotation(e.target.value)}
                    className="input flex-1 mr-2"
                    placeholder="1d20, 2d6+3, etc."
                  />
                  <button onClick={handleRoll} className="btn btn-primary">
                    Roll!
                  </button>
                </div>
                <p className="text-sm text-secondary-600 mt-1">
                  Format: [number of dice]d[die type]+[modifier]
                </p>
              </div>
              
              <div className="mb-6">
                <div className="flex flex-wrap space-x-2">
                  {commonDice.map(die => (
                    <button
                      key={die}
                      onClick={() => handleQuickRoll(die)}
                      className="dice-btn"
                    >
                      {die}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="advantage"
                    checked={advantage}
                    onChange={handleAdvantageChange}
                    className="mr-2 h-4 w-4"
                  />
                  <label htmlFor="advantage" className="text-sm">Advantage</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="disadvantage"
                    checked={disadvantage}
                    onChange={handleDisadvantageChange}
                    className="mr-2 h-4 w-4"
                  />
                  <label htmlFor="disadvantage" className="text-sm">Disadvantage</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="critical"
                    checked={critical}
                    onChange={(e) => setCritical(e.target.checked)}
                    className="mr-2 h-4 w-4"
                  />
                  <label htmlFor="critical" className="text-sm">Critical Hit</label>
                </div>
              </div>
            </div>
            
            <div className="card bg-white/90">
              <div className="flex justify-between items-center mb-4">
                <h2 className="mb-0">Roll History</h2>
                <button 
                  onClick={clearHistory} 
                  className="text-sm text-secondary-600 hover:text-secondary-800"
                  disabled={rollHistory.length === 0}
                >
                  Clear
                </button>
              </div>
              
              {rollHistory.length > 0 ? (
                <div className="space-y-3">
                  {rollHistory.map(roll => (
                    <div key={roll.id} className="p-3 bg-secondary-100 rounded">
                      <div className="flex justify-between items-start">
                        <div className="font-bold text-lg">
                          {roll.result.total}
                        </div>
                        <div className="text-xs text-secondary-600">
                          {roll.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="text-sm">{roll.formatted}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-secondary-600">
                  <p>Roll some dice to see your history!</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="card bg-white/90 mt-6">
            <h2>Dice Notation Help</h2>
            <p className="mb-4">
              Dice notation is a system used to represent different dice rolls in tabletop role-playing games.
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h3 className="text-lg mb-2">Basic Format</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>1d20</strong>: Roll one 20-sided die</li>
                  <li><strong>2d6</strong>: Roll two 6-sided dice</li>
                  <li><strong>3d8+5</strong>: Roll three 8-sided dice and add 5</li>
                  <li><strong>1d4-1</strong>: Roll one 4-sided die and subtract 1</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg mb-2">Options</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Advantage</strong>: Roll twice and take the higher result</li>
                  <li><strong>Disadvantage</strong>: Roll twice and take the lower result</li>
                  <li><strong>Critical Hit</strong>: Double the number of dice rolled</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    export default QuickRollPage;