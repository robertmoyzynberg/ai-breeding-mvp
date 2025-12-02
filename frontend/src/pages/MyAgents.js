import React from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { deleteAgent } from "../api/backend";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";

function MyAgents() {
  const navigate = useNavigate();
  const { agents, loading, removeAgent } = useApp();

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
    <div style={{ padding: "20px" }}>
      <h1>My Agents</h1>
      <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
      
      {agents.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No Agents Yet"
          message="Create your first agent to start breeding and battling!"
          actionLabel="Create Agent"
          onAction={() => navigate("/create-agent")}
        />
      ) : (
        <div style={{ marginTop: "20px" }}>
          {agents.map((agent) => (
            <div
              key={agent.id}
              style={{
                border: "1px solid #ccc",
                padding: "15px",
                marginBottom: "10px",
                borderRadius: "8px",
              }}
            >
              <h3>{agent.name}</h3>
              <p>ID: {agent.id}</p>
              {agent.traits && (
                <div>
                  <p>
                    Strength: {agent.traits.strength || 0} | Speed:{" "}
                    {agent.traits.speed || 0} | Intelligence:{" "}
                    {agent.traits.intelligence || 0}
                  </p>
                </div>
              )}
              <p>Power: {agent.power || 0}</p>
              <p>Energy: {agent.energy || 0}</p>
              <p>XP: {agent.xp || 0}</p>
              <p>GENE: {agent.gene || 0}</p>
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  onClick={() => navigate(`/agent/${agent.id}`)}
                  style={{
                    padding: "8px 16px",
                    background: "#667eea",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  View Profile
                </button>
                <button
                  onClick={() => handleDelete(agent.id)}
                  style={{
                    padding: "8px 16px",
                    background: "#f44336",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyAgents;
