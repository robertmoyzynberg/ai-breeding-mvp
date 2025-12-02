import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAgents, getAgent } from "../api/backend";

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

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Select Parent B</h1>
      <button onClick={() => navigate("/breed/select")}>Back</button>

      {parentA && (
        <div style={{ marginTop: "20px", padding: "15px", background: "#e3f2fd", borderRadius: "8px" }}>
          <h2>Parent A (Selected):</h2>
          <p><strong>{parentA.name}</strong></p>
          {parentA.traits && (
            <p>
              Strength: {parentA.traits.strength || 0} | Speed:{" "}
              {parentA.traits.speed || 0} | Intelligence:{" "}
              {parentA.traits.intelligence || 0}
            </p>
          )}
        </div>
      )}

      {agents.length === 0 ? (
        <p style={{ marginTop: "20px" }}>No other agents available. Create another agent first!</p>
      ) : (
        <div style={{ marginTop: "20px" }}>
          <h2>Select Parent B:</h2>
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
              <button>Select as Parent B & Breed</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SelectParentB;
