import React, { useState, useEffect } from "react";
import "./BattleArena.css";

function BattleArena({ battleResult = null, onBattleComplete }) {
  const [battlePhase, setBattlePhase] = useState("ready"); // ready, fighting, result
  const [hitAnimation, setHitAnimation] = useState(null);
  const [damageNumbers, setDamageNumbers] = useState([]);

  useEffect(() => {
    if (battleResult) {
      // Animate battle sequence
      setBattlePhase("fighting");
      
      // Simulate hits
      setTimeout(() => {
        setHitAnimation("left");
        setDamageNumbers([{ side: "left", damage: Math.floor(Math.random() * 50) + 20 }]);
      }, 500);

      setTimeout(() => {
        setHitAnimation("right");
        setDamageNumbers(prev => [...prev, { side: "right", damage: Math.floor(Math.random() * 50) + 20 }]);
      }, 1500);

      setTimeout(() => {
        setBattlePhase("result");
        if (onBattleComplete) {
          onBattleComplete();
        }
      }, 2500);
    }
  }, [battleResult, onBattleComplete]);

  if (!battleResult) {
    return (
      <div className="battle-arena-empty">
        <p>No battle to display. Select two agents to battle!</p>
      </div>
    );
  }

  const { agentA, agentB, winner, loser, xpGainA, xpGainB, energyA, energyB, coinRewards } = battleResult;
  const fighter1 = agentA || battleResult.fighter1;
  const fighter2 = agentB || battleResult.fighter2;

  const calculateHealthPercent = (agent) => {
    const maxPower = Math.max(fighter1?.power || 0, fighter2?.power || 0);
    return maxPower > 0 ? ((agent.power || 0) / maxPower) * 100 : 50;
  };

  const calculateEnergyPercent = (energy) => {
    return Math.max(0, Math.min(100, (energy || 0)));
  };

  return (
    <div className="battle-arena">
      <div className="battle-header">
        <h2>⚔️ Battle Arena</h2>
        {battlePhase === "fighting" && <div className="battle-status">FIGHTING...</div>}
        {battlePhase === "result" && winner && (
          <div className="battle-status winner">🏆 {winner.name} WINS!</div>
        )}
      </div>

      <div className="battle-field">
        {/* Fighter 1 */}
        <div className={`fighter fighter-left ${hitAnimation === "left" ? "hit" : ""}`}>
          <div className="fighter-card">
            <div className="fighter-avatar">
              <div className="avatar-circle" style={{ background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` }}>
                {fighter1?.name?.charAt(0)?.toUpperCase() || "A"}
              </div>
            </div>
            <h3 className="fighter-name">{fighter1?.name || "Agent A"}</h3>
            
            {/* Health Bar */}
            <div className="stat-bar-container">
              <div className="stat-label">
                <span>⚡ Power</span>
                <span className="stat-value">{fighter1?.power || 0}</span>
              </div>
              <div className="stat-bar">
                <div
                  className="stat-bar-fill power"
                  style={{ width: `${calculateHealthPercent(fighter1)}%` }}
                />
              </div>
            </div>

            {/* Energy Bar */}
            <div className="stat-bar-container">
              <div className="stat-label">
                <span>⚡ Energy</span>
                <span className="stat-value">{energyA || fighter1?.energy || 0}/100</span>
              </div>
              <div className="stat-bar">
                <div
                  className="stat-bar-fill energy"
                  style={{ width: `${calculateEnergyPercent(energyA || fighter1?.energy || 0)}%` }}
                />
              </div>
            </div>

            {/* Traits */}
            {fighter1?.traits && (
              <div className="fighter-traits">
                <span className="trait">💪 {fighter1.traits.strength || 0}</span>
                <span className="trait">🏃 {fighter1.traits.speed || 0}</span>
                <span className="trait">🧠 {fighter1.traits.intelligence || 0}</span>
              </div>
            )}

            {/* XP Gain */}
            {battlePhase === "result" && xpGainA && (
              <div className="xp-gain">+{xpGainA} XP</div>
            )}

            {/* Coin Reward */}
            {battlePhase === "result" && coinRewards && winner?.id === fighter1?.id && (
              <div className="coin-gain">+{coinRewards.winner} Coins</div>
            )}
            {battlePhase === "result" && coinRewards && loser?.id === fighter1?.id && (
              <div className="coin-gain">+{coinRewards.loser} Coins</div>
            )}

            {/* Winner Badge */}
            {battlePhase === "result" && winner?.id === fighter1?.id && (
              <div className="winner-badge">🏆 WINNER</div>
            )}
          </div>
        </div>

        {/* VS Divider */}
        <div className="vs-divider">
          <div className="vs-text">VS</div>
        </div>

        {/* Fighter 2 */}
        <div className={`fighter fighter-right ${hitAnimation === "right" ? "hit" : ""}`}>
          <div className="fighter-card">
            <div className="fighter-avatar">
              <div className="avatar-circle" style={{ background: `linear-gradient(135deg, #f093fb 0%, #f5576c 100%)` }}>
                {fighter2?.name?.charAt(0)?.toUpperCase() || "B"}
              </div>
            </div>
            <h3 className="fighter-name">{fighter2?.name || "Agent B"}</h3>
            
            {/* Health Bar */}
            <div className="stat-bar-container">
              <div className="stat-label">
                <span>⚡ Power</span>
                <span className="stat-value">{fighter2?.power || 0}</span>
              </div>
              <div className="stat-bar">
                <div
                  className="stat-bar-fill power"
                  style={{ width: `${calculateHealthPercent(fighter2)}%` }}
                />
              </div>
            </div>

            {/* Energy Bar */}
            <div className="stat-bar-container">
              <div className="stat-label">
                <span>⚡ Energy</span>
                <span className="stat-value">{energyB || fighter2?.energy || 0}/100</span>
              </div>
              <div className="stat-bar">
                <div
                  className="stat-bar-fill energy"
                  style={{ width: `${calculateEnergyPercent(energyB || fighter2?.energy || 0)}%` }}
                />
              </div>
            </div>

            {/* Traits */}
            {fighter2?.traits && (
              <div className="fighter-traits">
                <span className="trait">💪 {fighter2.traits.strength || 0}</span>
                <span className="trait">🏃 {fighter2.traits.speed || 0}</span>
                <span className="trait">🧠 {fighter2.traits.intelligence || 0}</span>
              </div>
            )}

            {/* XP Gain */}
            {battlePhase === "result" && xpGainB && (
              <div className="xp-gain">+{xpGainB} XP</div>
            )}

            {/* Coin Reward */}
            {battlePhase === "result" && coinRewards && winner?.id === fighter2?.id && (
              <div className="coin-gain">+{coinRewards.winner} Coins</div>
            )}
            {battlePhase === "result" && coinRewards && loser?.id === fighter2?.id && (
              <div className="coin-gain">+{coinRewards.loser} Coins</div>
            )}

            {/* Winner Badge */}
            {battlePhase === "result" && winner?.id === fighter2?.id && (
              <div className="winner-badge">🏆 WINNER</div>
            )}
          </div>
        </div>
      </div>

      {/* Battle Result Summary */}
      {battlePhase === "result" && winner && (
        <div className="battle-summary">
          <div className="summary-card winner-card">
            <h3>🏆 Winner: {winner.name}</h3>
            <div className="summary-stats">
              <p>Power: {winner.power}</p>
              <p>XP Gained: +{winner === fighter1 ? xpGainA : xpGainB}</p>
              <p>New Energy: {winner.energy || 0}/100</p>
            </div>
          </div>
          {loser && (
            <div className="summary-card loser-card">
              <h3>💔 Loser: {loser.name}</h3>
              <div className="summary-stats">
                <p>Power: {loser.power}</p>
                <p>XP Gained: +{loser === fighter1 ? xpGainA : xpGainB}</p>
                <p>New Energy: {loser.energy || 0}/100</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Damage Numbers Animation */}
      {damageNumbers.map((dmg, idx) => (
        <div
          key={idx}
          className={`damage-number ${dmg.side}`}
          style={{ animationDelay: `${idx * 0.1}s` }}
        >
          -{dmg.damage}
        </div>
      ))}
    </div>
  );
}

export default BattleArena;
