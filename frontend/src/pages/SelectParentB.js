import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAgents, getAgent } from "../api/backend";
import { formatAgentName } from "../utils/nameUtils";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import "./SelectParent.css";

function SelectParentB() {
  const navigate = useNavigate();
  const { parentAId } = useParams();
  const [parentA, setParentA] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        console.log("[SelectParentB] Loading parent A and agents...");
        
        // Load parent A
        if (parentAId) {
          const parentAData = await getAgent(parseInt(parentAId));
          console.log("[SelectParentB] Parent A loaded:", parentAData);
          setParentA(parentAData);
        }

        // Load all agents (excluding parent A)
        const allAgents = await getAgents();
        const filteredAgents = allAgents.filter(
          (a) => a.id !== parseInt(parentAId)
        );
        console.log("[SelectParentB] Available agents for parent B:", filteredAgents);
        setAgents(filteredAgents);
      } catch (error) {
        console.error("[SelectParentB] Error loading data:", error);
        setAgents([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [parentAId]);

  const handleSelect = (agent) => {
    console.log("[SelectParentB] Selected parent B:", agent);
    navigate(`/breed/run/${parentAId}/${agent.id}`);
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
          onClick={() => navigate("/breed/select")}
        >
          ← Back
        </button>
        <h1>🧬 Select Parent B</h1>
        <p className="subtitle">Choose the second parent to breed with Parent A</p>
      </div>

      {parentA && (
        <div className="selected-parent-a">
          <h3>✓ Parent A (Selected):</h3>
          <div className="parent-a-card">
            <div className="parent-a-header">
              <h4 title={parentA.name}>{formatAgentName(parentA.name)}</h4>
              {parentA.rareTrait && (
                <span className="rare-trait-badge">
                  ✨ {parentA.rareTrait.name}
                </span>
              )}
            </div>
            {parentA.traits && (
              <div className="parent-a-stats">
                <span>STR: {parentA.traits.strength || 0}</span>
                <span>SPD: {parentA.traits.speed || 0}</span>
                <span>INT: {parentA.traits.intelligence || 0}</span>
                <span>Power: {parentA.power || calculatePower(parentA)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {agents.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No Other Agents Available"
          message="Create another agent first to start breeding!"
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
                  className="select-button breed-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(agent);
                  }}
                >
                  🧬 Select & Breed
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SelectParentB;
