import React from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { deleteAgent } from "../api/backend";
import { formatAgentName } from "../utils/nameUtils";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import "./MyAgents.css";

function MyAgents() {
  const navigate = useNavigate();
  const { agents, loading, removeAgent } = useApp();

  const calculatePower = (agent) => {
    if (!agent.traits) return 0;
    const { strength = 0, speed = 0, intelligence = 0 } = agent.traits;
    const basePower = strength * 3 + speed * 2 + intelligence * 2;
    const rareBonus = agent.rareTrait?.powerBonus || 0;
    return basePower + rareBonus;
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this agent?")) {
      return;
    }
    try {
      console.log("[MyAgents] Deleting agent:", id);
      await deleteAgent(id);
      removeAgent(id);
      console.log("[MyAgents] Agent deleted successfully");
    } catch (error) {
      console.error("[MyAgents] Error deleting agent:", error);
      alert("Failed to delete agent");
    }
  };

  if (loading) {
    return <Loader message="Loading agents..." />;
  }

  return (
    <div className="my-agents-page">
      <div className="page-header">
        <button className="back-button" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
        <h1 className="page-title">👥 My Agents</h1>
        <p className="page-subtitle">Manage and view all your AI agents</p>
      </div>

      {agents.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No Agents Yet"
          message="Create your first agent to start breeding and battling!"
        >
          <button
            className="btn btn-primary"
            onClick={() => navigate("/create-agent")}
          >
            Create Agent
          </button>
        </EmptyState>
      ) : (
        <div className="agents-grid">
          {agents.map((agent) => {
            const power = agent.power || calculatePower(agent);
            return (
              <div key={agent.id} className="agent-card">
                <div className="agent-card-header">
                  <div className="agent-avatar">
                    {agent.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <h3 className="agent-name" title={agent.name}>
                    {formatAgentName(agent.name)}
                  </h3>
                  {agent.rareTrait && (
                    <span className="rare-trait-badge">
                      ✨ {agent.rareTrait.name} (+{agent.rareTrait.powerBonus})
                    </span>
                  )}
                </div>

                <div className="agent-card-body">
                  <div className="agent-stats-grid">
                    <div className="stat-item">
                      <span className="stat-label">⚡ Power</span>
                      <span className="stat-value">{power}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">💪 Strength</span>
                      <span className="stat-value">
                        {agent.traits?.strength || 0}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">🏃 Speed</span>
                      <span className="stat-value">
                        {agent.traits?.speed || 0}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">🧠 Intelligence</span>
                      <span className="stat-value">
                        {agent.traits?.intelligence || 0}
                      </span>
                    </div>
                  </div>

                  <div className="agent-meta">
                    <div className="meta-item">
                      <span className="meta-label">XP</span>
                      <span className="meta-value">{agent.xp || 0}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Energy</span>
                      <span className="meta-value">
                        {agent.energy || 100}/100
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">GENE</span>
                      <span className="meta-value">{agent.gene || 0}</span>
                    </div>
                  </div>

                  {agent.energy !== undefined && (
                    <div className="energy-bar-container">
                      <div className="energy-label">
                        Energy: {agent.energy || 100}/100
                      </div>
                      <div className="energy-bar">
                        <div
                          className="energy-fill"
                          style={{
                            width: `${agent.energy || 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="agent-card-footer">
                  <div className="footer-buttons">
                    <button
                      className="view-button"
                      onClick={() => navigate(`/agent/${agent.id}`)}
                    >
                      View Profile
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(agent.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyAgents;
