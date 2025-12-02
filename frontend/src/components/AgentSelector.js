import React from "react";

function AgentSelector({ agents = [], onSelect, selected = [] }) {
  return (
    <div>
      <h2>Select Agent</h2>
      {agents.length === 0 ? (
        <p>No agents available.</p>
      ) : (
        <ul>
          {agents.map((agent) => (
            <li key={agent.id}>
              <button onClick={() => onSelect && onSelect(agent)}>
                {agent.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AgentSelector;

