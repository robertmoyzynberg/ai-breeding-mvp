import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAgents } from "../api/backend";

function Dashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "User";
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAgents() {
      try {
        console.log("[Dashboard] Loading agents from backend...");
        const data = await getAgents();
        console.log("[Dashboard] Agents loaded:", data);
        setAgents(data || []);
      } catch (error) {
        console.error("[Dashboard] Error loading agents:", error);
        setAgents([]);
      } finally {
        setLoading(false);
      }
    }
    loadAgents();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Dashboard</h1>
      <p>Welcome, {username}!</p>
      
      {loading ? (
        <p>Loading agents...</p>
      ) : (
        <div>
          <p>Total Agents: {agents.length}</p>
        </div>
      )}

      <div style={{ marginTop: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button onClick={() => navigate("/create-agent")}>
          Create New Agent
        </button>
        <button onClick={() => navigate("/agents")}>View My Agents</button>
        <button onClick={() => navigate("/breed/select")}>Start Breeding</button>
        <button onClick={() => navigate("/marketplace")}>Marketplace</button>
        <button onClick={() => navigate("/store")}>💰 Store</button>
      </div>
    </div>
  );
}

export default Dashboard;
