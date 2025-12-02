import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getAgents, getAgent, battleAgents } from "../api/backend";
import { useApp } from "../context/AppContext";
import { formatAgentName } from "../utils/nameUtils";
import BattleArena from "../components/BattleArena";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import Notification from "../components/Notification";
import "./Battle.css";

function Battle() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshAgents, refreshBalance } = useApp();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgentA, setSelectedAgentA] = useState(null);
  const [selectedAgentB, setSelectedAgentB] = useState(null);
  const [battleResult, setBattleResult] = useState(null);
  const [battling, setBattling] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    async function loadAgents() {
      try {
        const data = await getAgents();
        setAgents(data || []);
        
        // If agent ID is in query params, pre-select it
        const agentId = searchParams.get("agent");
        if (agentId) {
          const agent = data.find((a) => a.id === parseInt(agentId));
          if (agent) {
            setSelectedAgentA(agent);
          }
        }
      } catch (error) {
        console.error("[Battle] Error loading agents:", error);
        setAgents([]);
      } finally {
        setLoading(false);
      }
    }
    loadAgents();
  }, [searchParams]);

  const calculatePower = (agent) => {
    if (!agent.traits) return 0;
    const { strength = 0, speed = 0, intelligence = 0 } = agent.traits;
    const basePower = strength * 3 + speed * 2 + intelligence * 2;
    const rareBonus = agent.rareTrait?.powerBonus || 0;
    return basePower + rareBonus;
  };

  const getRarityBadge = (rarity) => {
    const colors = {
      common: { bg: "#e0e0e0", color: "#333" },
      uncommon: { bg: "#4caf50", color: "#fff" },
      rare: { bg: "#f6d365", color: "#333" },
    };
    const style = colors[rarity] || colors.common;
    return (
      <span className="rarity-badge" style={style}>
        {rarity}
      </span>
    );
  };

  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSelectAgentA = (agent) => {
    if (selectedAgentB?.id === agent.id) {
      showNotification("Cannot select the same agent for both sides!", "error");
      return;
    }
    setSelectedAgentA(agent);
    setBattleResult(null);
  };

  const handleSelectAgentB = (agent) => {
    if (selectedAgentA?.id === agent.id) {
      showNotification("Cannot select the same agent for both sides!", "error");
      return;
    }
    setSelectedAgentB(agent);
    setBattleResult(null);
  };

  const handleBattle = async () => {
    if (!selectedAgentA || !selectedAgentB) {
      showNotification("Please select both agents to battle!", "error");
      return;
    }

    if (selectedAgentA.id === selectedAgentB.id) {
      showNotification("Cannot battle an agent against itself!", "error");
      return;
    }

    setBattling(true);
    setBattleResult(null);

    try {
      const result = await battleAgents(selectedAgentA.id, selectedAgentB.id);
      setBattleResult(result);
      
      // Refresh agents and balance after battle
      await refreshAgents();
      await refreshBalance();
      
      showNotification("Battle complete! Check the results below.", "success");
    } catch (error) {
      console.error("[Battle] Error during battle:", error);
      showNotification(`Battle failed: ${error.message}`, "error");
    } finally {
      setBattling(false);
    }
  };

  const handleRandomOpponent = () => {
    if (!selectedAgentA) {
      showNotification("Please select your agent first!", "error");
      return;
    }

    const availableOpponents = agents.filter(
      (a) => a.id !== selectedAgentA.id
    );
    
    if (availableOpponents.length === 0) {
      showNotification("No other agents available to battle!", "error");
      return;
    }

    const randomOpponent =
      availableOpponents[Math.floor(Math.random() * availableOpponents.length)];
    setSelectedAgentB(randomOpponent);
    setBattleResult(null);
  };

  const handleReset = () => {
    setSelectedAgentA(null);
    setSelectedAgentB(null);
    setBattleResult(null);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="battle-page">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      
      <div className="battle-header">
        <button className="back-button" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
        <h1 className="page-title">⚔️ Battle Arena</h1>
        <p className="page-subtitle">
          Select two agents to battle and see who wins!
        </p>
      </div>

      {agents.length < 2 ? (
        <EmptyState
          icon="⚔️"
          title="Not Enough Agents"
          message="You need at least 2 agents to battle. Create more agents first!"
        />
      ) : (
        <>
          {/* Agent Selection Section */}
          <div className="battle-selection-section">
            <div className="selection-grid">
              {/* Your Agent (Agent A) */}
              <div className="selection-column">
                <h2 className="selection-title">
                  {selectedAgentA ? "✓ Your Agent" : "Select Your Agent"}
                </h2>
                {selectedAgentA ? (
                  <div className="selected-agent-card">
                    <div className="agent-card-header">
                      <div className="agent-avatar">
                        {selectedAgentA.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <h3 className="agent-name" title={selectedAgentA.name}>
                        {formatAgentName(selectedAgentA.name)}
                      </h3>
                      {selectedAgentA.rareTrait && (
                        <span className="rare-trait-badge">
                          ✨ {selectedAgentA.rareTrait.name}
                        </span>
                      )}
                    </div>
                    <div className="agent-stats-grid">
                      <div className="stat-item">
                        <span className="stat-label">Power</span>
                        <span className="stat-value">
                          {selectedAgentA.power || calculatePower(selectedAgentA)}
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">STR</span>
                        <span className="stat-value">
                          {selectedAgentA.traits?.strength || 0}
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">SPD</span>
                        <span className="stat-value">
                          {selectedAgentA.traits?.speed || 0}
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">INT</span>
                        <span className="stat-value">
                          {selectedAgentA.traits?.intelligence || 0}
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Energy</span>
                        <span className="stat-value">
                          {selectedAgentA.energy || 100}/100
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">XP</span>
                        <span className="stat-value">
                          {selectedAgentA.xp || 0}
                        </span>
                      </div>
                    </div>
                    <button
                      className="change-agent-button"
                      onClick={() => setSelectedAgentA(null)}
                    >
                      Change Agent
                    </button>
                  </div>
                ) : (
                  <div className="agent-selector-grid">
                    {agents.map((agent) => (
                      <div
                        key={agent.id}
                        className="agent-select-card"
                        onClick={() => handleSelectAgentA(agent)}
                      >
                        <div className="select-card-header">
                          <h4 className="select-card-name" title={agent.name}>
                            {formatAgentName(agent.name)}
                          </h4>
                          {getRarityBadge(agent.rarity)}
                        </div>
                        <div className="select-card-stats">
                          <span>⚡ {calculatePower(agent)}</span>
                          <span>⚡ {agent.energy || 100}/100</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* VS Divider */}
              <div className="vs-divider">
                <div className="vs-circle">VS</div>
              </div>

              {/* Opponent (Agent B) */}
              <div className="selection-column">
                <h2 className="selection-title">
                  {selectedAgentB ? "✓ Opponent" : "Select Opponent"}
                </h2>
                {selectedAgentB ? (
                  <div className="selected-agent-card opponent">
                    <div className="agent-card-header">
                      <div className="agent-avatar">
                        {selectedAgentB.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <h3 className="agent-name" title={selectedAgentB.name}>
                        {formatAgentName(selectedAgentB.name)}
                      </h3>
                      {selectedAgentB.rareTrait && (
                        <span className="rare-trait-badge">
                          ✨ {selectedAgentB.rareTrait.name}
                        </span>
                      )}
                    </div>
                    <div className="agent-stats-grid">
                      <div className="stat-item">
                        <span className="stat-label">Power</span>
                        <span className="stat-value">
                          {selectedAgentB.power || calculatePower(selectedAgentB)}
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">STR</span>
                        <span className="stat-value">
                          {selectedAgentB.traits?.strength || 0}
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">SPD</span>
                        <span className="stat-value">
                          {selectedAgentB.traits?.speed || 0}
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">INT</span>
                        <span className="stat-value">
                          {selectedAgentB.traits?.intelligence || 0}
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Energy</span>
                        <span className="stat-value">
                          {selectedAgentB.energy || 100}/100
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">XP</span>
                        <span className="stat-value">
                          {selectedAgentB.xp || 0}
                        </span>
                      </div>
                    </div>
                    <button
                      className="change-agent-button"
                      onClick={() => setSelectedAgentB(null)}
                    >
                      Change Opponent
                    </button>
                  </div>
                ) : (
                  <div className="agent-selector-grid">
                    {agents
                      .filter((a) => a.id !== selectedAgentA?.id)
                      .map((agent) => (
                        <div
                          key={agent.id}
                          className="agent-select-card"
                          onClick={() => handleSelectAgentB(agent)}
                        >
                          <div className="select-card-header">
                            <h4 className="select-card-name" title={agent.name}>
                              {formatAgentName(agent.name)}
                            </h4>
                            {getRarityBadge(agent.rarity)}
                          </div>
                          <div className="select-card-stats">
                            <span>⚡ {calculatePower(agent)}</span>
                            <span>⚡ {agent.energy || 100}/100</span>
                          </div>
                        </div>
                      ))}
                    {selectedAgentA && (
                      <button
                        className="random-opponent-button"
                        onClick={handleRandomOpponent}
                      >
                        🎲 Random Opponent
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Battle Actions */}
            <div className="battle-actions">
              {selectedAgentA && selectedAgentB ? (
                <div className="action-buttons">
                  <button
                    className="btn btn-primary btn-lg battle-button"
                    onClick={handleBattle}
                    disabled={battling}
                  >
                    {battling ? "⚔️ Battling..." : "⚔️ Start Battle"}
                  </button>
                  <button
                    className="btn btn-outline reset-button"
                    onClick={handleReset}
                    disabled={battling}
                  >
                    🔄 Reset Selection
                  </button>
                </div>
              ) : (
                <div className="selection-prompt">
                  <p>
                    {!selectedAgentA && !selectedAgentB
                      ? "👈 Select both agents to begin"
                      : !selectedAgentA
                      ? "👈 Select your agent"
                      : "👉 Select an opponent"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Battle Result */}
          {battleResult && (
            <div className="battle-result-section">
              <BattleArena battleResult={battleResult} />
              <div className="result-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setBattleResult(null);
                    setSelectedAgentA(null);
                    setSelectedAgentB(null);
                  }}
                >
                  🆕 New Battle
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => navigate("/dashboard")}
                >
                  🏠 Back to Dashboard
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Battle;

