import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAgent, deleteAgent, updateAgent, listAgentForSale, removeAgentFromSale, purchaseAgent } from "../api/backend";
import { useApp } from "../context/AppContext";
import Chat from "../components/Chat";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import Notification from "../components/Notification";
import "./AgentProfile.css";

function AgentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { coins, refreshBalance, refreshAgents, showNotification } = useApp();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [showListSale, setShowListSale] = useState(false);
  const [salePrice, setSalePrice] = useState("");
  const [processing, setProcessing] = useState(false);
  const username = localStorage.getItem("username") || "";
  const isOwner = agent && agent.owner === username;

  useEffect(() => {
    loadAgent();
  }, [id]);

  const loadAgent = async () => {
    try {
      setLoading(true);
      console.log("[AgentProfile] Loading agent:", id);
      const data = await getAgent(parseInt(id));
      console.log("[AgentProfile] Agent loaded:", data);
      setAgent(data);
    } catch (err) {
      console.error("[AgentProfile] Error loading agent:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${agent?.name}?`)) {
      return;
    }
    try {
      await deleteAgent(parseInt(id));
      navigate("/agents");
    } catch (err) {
      console.error("[AgentProfile] Error deleting agent:", err);
      alert("Failed to delete agent");
    }
  };

  const handleListForSale = async () => {
    if (!salePrice || parseInt(salePrice) <= 0) {
      showNotification("Please enter a valid price", "error");
      return;
    }

    setProcessing(true);
    try {
      const result = await listAgentForSale(parseInt(id), username, parseInt(salePrice));
      setAgent(result.agent);
      setShowListSale(false);
      setSalePrice("");
      showNotification(result.message || "Agent listed for sale!", "success");
      await refreshAgents();
    } catch (err) {
      console.error("[AgentProfile] Error listing for sale:", err);
      showNotification(err.message || "Failed to list agent for sale", "error");
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveFromSale = async () => {
    setProcessing(true);
    try {
      const result = await removeAgentFromSale(parseInt(id), username);
      setAgent(result.agent);
      showNotification(result.message || "Agent removed from sale", "success");
      await refreshAgents();
    } catch (err) {
      console.error("[AgentProfile] Error removing from sale:", err);
      showNotification(err.message || "Failed to remove from sale", "error");
    } finally {
      setProcessing(false);
    }
  };

  const handlePurchase = async () => {
    if (!window.confirm(`Purchase ${agent?.name} for ${agent?.price} coins?`)) {
      return;
    }

    if (coins < (agent?.price || 0)) {
      showNotification(`Insufficient coins. Need ${agent?.price} coins.`, "error");
      return;
    }

    setProcessing(true);
    try {
      const result = await purchaseAgent(parseInt(id), username);
      setAgent(result.agent);
      await refreshBalance();
      await refreshAgents();
      showNotification(result.message || "Agent purchased successfully!", "success");
    } catch (err) {
      console.error("[AgentProfile] Error purchasing agent:", err);
      showNotification(err.message || "Failed to purchase agent", "error");
    } finally {
      setProcessing(false);
    }
  };

  const calculatePower = (agent) => {
    if (!agent) return 0;
    const basePower =
      (agent.traits?.strength || 0) * 2 +
      (agent.traits?.speed || 0) * 2 +
      (agent.traits?.intelligence || 0) * 3 +
      Math.floor((agent.xp || 0) / 5);
    const rareTraitBonus = agent.rareTrait ? agent.rareTrait.powerBonus : 0;
    return basePower + rareTraitBonus;
  };

  if (loading) {
    return <Loader message="Loading agent..." />;
  }

  if (error || !agent) {
    return (
      <EmptyState
        icon="❌"
        title="Agent Not Found"
        message="This agent doesn't exist or has been deleted."
        actionLabel="Back to Agents"
        onAction={() => navigate("/agents")}
      />
    );
  }

  const power = calculatePower(agent);

  return (
    <div className="agent-profile">
      <div className="profile-header">
        <button className="back-button" onClick={() => navigate("/agents")}>
          ← Back
        </button>
        <h1>Agent Profile</h1>
      </div>

      <div className="profile-content">
        {/* Agent Card */}
        <div className="profile-card">
          <div className="agent-avatar-large">
            <div
              className="avatar-circle-large"
              style={{
                background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
              }}
            >
              {agent.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
          </div>

          <h2 className="agent-name">{agent.name}</h2>
          {agent.rarity && (
            <span className={`rarity-badge rarity-${agent.rarity}`}>
              {agent.rarity.toUpperCase()}
            </span>
          )}

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-icon">⚡</div>
              <div className="stat-info">
                <div className="stat-label">Power</div>
                <div className="stat-value">{power}</div>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon">🔋</div>
              <div className="stat-info">
                <div className="stat-label">Energy</div>
                <div className="stat-value">{agent.energy || 0}/100</div>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon">⭐</div>
              <div className="stat-info">
                <div className="stat-label">XP</div>
                <div className="stat-value">{agent.xp || 0}</div>
              </div>
            </div>

            <div className="stat-item">
              <div className="stat-icon">🧬</div>
              <div className="stat-info">
                <div className="stat-label">GENE</div>
                <div className="stat-value">{agent.gene || 0}</div>
              </div>
            </div>
          </div>

          {/* Traits */}
          {agent.traits && (
            <div className="traits-section">
              <h3>Traits</h3>
              <div className="traits-grid">
                <div className="trait-card">
                  <div className="trait-icon">💪</div>
                  <div className="trait-name">Strength</div>
                  <div className="trait-value">{agent.traits.strength || 0}</div>
                  <div className="trait-bar">
                    <div
                      className="trait-bar-fill"
                      style={{
                        width: `${((agent.traits.strength || 0) / 10) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="trait-card">
                  <div className="trait-icon">🏃</div>
                  <div className="trait-name">Speed</div>
                  <div className="trait-value">{agent.traits.speed || 0}</div>
                  <div className="trait-bar">
                    <div
                      className="trait-bar-fill"
                      style={{
                        width: `${((agent.traits.speed || 0) / 10) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="trait-card">
                  <div className="trait-icon">🧠</div>
                  <div className="trait-name">Intelligence</div>
                  <div className="trait-value">
                    {agent.traits.intelligence || 0}
                  </div>
                  <div className="trait-bar">
                    <div
                      className="trait-bar-fill"
                      style={{
                        width: `${((agent.traits.intelligence || 0) / 10) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rare Trait */}
          {agent.rareTrait && (
            <div className="rare-trait-section">
              <h3>✨ Rare Trait</h3>
              <div className="rare-trait-card">
                <div className="rare-trait-name">{agent.rareTrait.name}</div>
                <div className="rare-trait-bonus">
                  +{agent.rareTrait.powerBonus} Power Bonus
                </div>
              </div>
            </div>
          )}

          {/* Sale Status */}
          {agent.forSale && (
            <div className="sale-status-banner">
              <div className="sale-info">
                <span className="sale-label">💰 For Sale:</span>
                <span className="sale-price">{agent.price} Coins</span>
              </div>
              {isOwner ? (
                <button
                  className="remove-sale-button"
                  onClick={handleRemoveFromSale}
                  disabled={processing}
                >
                  Remove from Sale
                </button>
              ) : (
                <button
                  className="purchase-button"
                  onClick={handlePurchase}
                  disabled={processing || coins < (agent.price || 0)}
                >
                  {processing ? "Processing..." : `Buy for ${agent.price} Coins`}
                </button>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="actions-section">
            <h3>Actions</h3>
            <div className="actions-grid">
              <button
                className="action-button chat-button"
                onClick={() => setShowChat(!showChat)}
              >
                💬 Chat
              </button>
              <button
                className="action-button battle-button"
                onClick={() => navigate(`/battle?agent=${id}`)}
              >
                ⚔️ Battle
              </button>
              <button
                className="action-button breed-button"
                onClick={() => navigate(`/breed/select?selected=${id}`)}
              >
                🧬 Breed
              </button>
              {isOwner && !agent.forSale && (
                <button
                  className="action-button sale-button"
                  onClick={() => setShowListSale(true)}
                >
                  💰 List for Sale
                </button>
              )}
              {isOwner && (
                <button
                  className="action-button delete-button"
                  onClick={handleDelete}
                >
                  🗑️ Delete
                </button>
              )}
            </div>
          </div>

          {/* List for Sale Modal */}
          {showListSale && (
            <div className="modal-overlay" onClick={() => setShowListSale(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>List Agent for Sale</h3>
                <p>Set a price for {agent?.name}</p>
                <input
                  type="number"
                  placeholder="Enter price in coins"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  min="1"
                  className="price-input"
                />
                <div className="modal-buttons">
                  <button
                    className="cancel-button"
                    onClick={() => {
                      setShowListSale(false);
                      setSalePrice("");
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="confirm-button"
                    onClick={handleListForSale}
                    disabled={processing || !salePrice || parseInt(salePrice) <= 0}
                  >
                    {processing ? "Listing..." : "List for Sale"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Section */}
        {showChat && (
          <div className="chat-section">
            <Chat agentId={parseInt(id)} agent={agent} />
          </div>
        )}
      </div>
    </div>
  );
}

export default AgentProfile;

