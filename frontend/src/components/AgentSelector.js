import React from "react";
import { formatAgentName } from "../utils/nameUtils";
import "./AgentSelector.css";

function AgentSelector({ agents = [], onSelect, selected = [] }) {
  const handleSelect = (agent) => {
    if (onSelect) {
      onSelect(agent);
    }
  };

  const isSelected = (agentId) => {
    return selected.some((a) => a.id === agentId);
  };

  if (agents.length === 0) {
    return (
      <div className="agent-selector-container">
        <h2 className="agent-selector-title">Select Agent</h2>
        <p className="agent-selector-empty">No agents available.</p>
      </div>
    );
  }

  return (
    <div className="agent-selector-container">
      <h2 className="agent-selector-title">Select Agent</h2>
      <div className="agent-selector-grid">
        {agents.map((agent) => {
          const selected = isSelected(agent.id);
          return (
            <button
              key={agent.id}
              className={`agent-selector-button ${selected ? "selected" : ""}`}
              onClick={() => handleSelect(agent)}
            >
              <span className="agent-selector-name" title={agent.name}>
                {formatAgentName(agent.name)}
              </span>
              {agent.traits && (
                <span className="agent-selector-stats">
                  ⚡ {agent.traits.strength || 0} | {agent.traits.speed || 0} |{" "}
                  {agent.traits.intelligence || 0}
                </span>
              )}
              {selected && <span className="agent-selector-check">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default AgentSelector;
