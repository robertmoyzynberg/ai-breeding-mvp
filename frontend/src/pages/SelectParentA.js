import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAgents } from "../api/backend";
import { formatAgentName } from "../utils/nameUtils";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import "./SelectParent.css";

function SelectParentA() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAgents() {
      try {
        console.log("[SelectParentA] Loading agents from backend...");
        const data = await getAgents();
        console.log("[SelectParentA] Agents loaded:", data);
        setAgents(data || []);
      } catch (error) {
        console.error("[SelectParentA] Error loading agents:", error);
        setAgents([]);
      } finally {
        setLoading(false);
      }
    }
    loadAgents();
  }, []);

  const handleSelect = (agent) => {
    console.log("[SelectParentA] Selected parent A:", agent);
    navigate(`/breed/parentB/${agent.id}`);
  };

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
      <span
        style={{
          display: "inline-block",
          padding: "4px 12px",
          borderRadius: "20px",
          fontSize: "12px",
          fontWeight: "bold",
          background: style.bg,
          color: style.color,
          textTransform: "capitalize",
        }}
      >
        {rarity}
      </span>
    );
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="select-parent-page">
      <div className="select-parent-header">
        <button
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>
        <h1>🧬 Select Parent A</h1>
        <p className="subtitle">Choose the first parent for breeding</p>
      </div>

      {agents.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No Agents Available"
          message="Create an agent first to start breeding!"
        />
      ) : (
        <div className="agents-grid">
          {agents.map((agent) => {
            const power = agent.power || calculatePower(agent);
            return (
              <div
                key={agent.id}
                className="agent-select-card"
                onClick={() => handleSelect(agent)}
              >
                <div className="agent-card-header">
                  <h3 className="agent-name" title={agent.name}>
                    {formatAgentName(agent.name)}
                  </h3>
                  {agent.rareTrait && (
                    <span className="rare-trait-badge">
                      ✨ {agent.rareTrait.name} (+{agent.rareTrait.powerBonus})
                    </span>
                  )}
                </div>

                <div className="agent-stats">
                  {agent.traits && (
                    <div className="traits-row">
                      <span className="trait-item">
                        💪 STR: {agent.traits.strength || 0}
                      </span>
                      <span className="trait-item">
                        ⚡ SPD: {agent.traits.speed || 0}
                      </span>
                      <span className="trait-item">
                        🧠 INT: {agent.traits.intelligence || 0}
                      </span>
                    </div>
                  )}
                  <div className="power-row">
                    <span className="power-value">⚡ Power: {power}</span>
                    {agent.rarity && getRarityBadge(agent.rarity)}
                  </div>
                  <div className="meta-row">
                    <span>⭐ XP: {agent.xp || 0}</span>
                    <span>⚡ Energy: {agent.energy || 100}/100</span>
                  </div>
                </div>

                <button
                  className="select-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(agent);
                  }}
                >
                  ✓ Select as Parent A
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SelectParentA;
