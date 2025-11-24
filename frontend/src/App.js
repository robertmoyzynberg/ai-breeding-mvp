import React from "react";
import agents from "./agents.json";

function App() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>AI Breeding MVP</h1>
      {agents.map((agent) => (
        <div
          key={agent.id}
          style={{ border: "1px solid black", margin: "10px", padding: "10px" }}
        >
          <h3>{agent.name}</h3>
          <ul>
            {Object.entries(agent.traits).map(([key, value]) => (
              <li key={key}>
                {key}: {value}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default App;
