import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAgent } from "../api/backend";

function CreateAgent() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please enter an agent name");
      return;
    }

    setLoading(true);
    try {
      console.log("[CreateAgent] Creating agent:", name);
      
      // Generate random traits (1-10)
      const traits = {
        strength: Math.floor(Math.random() * 10) + 1,
        speed: Math.floor(Math.random() * 10) + 1,
        intelligence: Math.floor(Math.random() * 10) + 1,
      };

      const agentData = {
        name: name.trim(),
        traits,
        energy: 100,
        xp: 0,
        gene: 0,
        rarity: "common",
      };

      const created = await createAgent(agentData);
      console.log("[CreateAgent] Agent created:", created);
      
      alert(`Agent "${created.name}" created successfully!`);
      navigate("/agents");
    } catch (error) {
      console.error("[CreateAgent] Error creating agent:", error);
      alert(`Failed to create agent: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Create Agent</h1>
      <button onClick={() => navigate("/dashboard")}>Back</button>
      
      <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
        <div style={{ marginBottom: "15px" }}>
          <label>
            Agent Name:
            <input
              type="text"
              placeholder="Enter agent name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              style={{
                marginLeft: "10px",
                padding: "8px",
                fontSize: "16px",
                width: "300px",
              }}
            />
          </label>
        </div>
        <button type="submit" disabled={loading || !name.trim()}>
          {loading ? "Creating..." : "Create Agent"}
        </button>
      </form>
    </div>
  );
}

export default CreateAgent;
