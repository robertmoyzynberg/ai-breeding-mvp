import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAgents } from "../api/backend";

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

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading agents...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Select Parent A</h1>
      <button onClick={() => navigate("/dashboard")}>Back</button>

      {agents.length === 0 ? (
        <p>No agents available. Create an agent first!</p>
      ) : (
        <div style={{ marginTop: "20px" }}>
          <h2>Available Agents:</h2>
          {agents.map((agent) => (
            <div
              key={agent.id}
              style={{
                border: "1px solid #ccc",
                padding: "15px",
                marginBottom: "10px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
              onClick={() => handleSelect(agent)}
            >
              <h3>{agent.name}</h3>
              {agent.traits && (
                <p>
                  Strength: {agent.traits.strength || 0} | Speed:{" "}
                  {agent.traits.speed || 0} | Intelligence:{" "}
                  {agent.traits.intelligence || 0}
                </p>
              )}
              <p>Power: {agent.power || 0}</p>
              <button>Select as Parent A</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SelectParentA;
