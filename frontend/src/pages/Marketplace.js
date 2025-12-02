import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { purchaseAgent } from "../api/backend";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import Notification from "../components/Notification";
import "./Marketplace.css";

function Marketplace() {
  const navigate = useNavigate();
  const { agents, loading, refreshAgents, coins, refreshBalance, showNotification } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("power"); // power, name, rarity, price
  const [filterBy, setFilterBy] = useState("all"); // all, forSale, available
  const [purchasing, setPurchasing] = useState(null);
  const [notification, setNotification] = useState(null);
  const username = localStorage.getItem("username") || "";

  // Filter and sort agents
  const filteredAgents = agents
    .filter((agent) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          agent.name?.toLowerCase().includes(searchLower) ||
          agent.owner?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    })
    .filter((agent) => {
      // Status filter
      if (filterBy === "forSale") {
        return agent.forSale === true;
      }
      if (filterBy === "available") {
        return !agent.owner || agent.owner === "";
      }
      return true; // "all"
    })
    .sort((a, b) => {
      // Sort
      if (sortBy === "power") {
        return (b.power || 0) - (a.power || 0);
      }
      if (sortBy === "name") {
        return (a.name || "").localeCompare(b.name || "");
      }
      if (sortBy === "rarity") {
        const rarityA = calculateRarity(a);
        const rarityB = calculateRarity(b);
        return rarityB - rarityA;
      }
      if (sortBy === "price") {
        return (b.price || 0) - (a.price || 0);
      }
      return 0;
    });

  // Calculate rarity percentage
  function calculateRarity(agent) {
    if (!agent.traits) return 0;
    const weights = Object.values(agent.traits).map((value) => {
      if (value <= 3) return 1;
      if (value <= 6) return 2;
      return 4;
    });
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const maxWeight = 12; // 4 + 4 + 4
    return (totalWeight / maxWeight) * 100;
  }

  const handleViewAgent = (agentId) => {
    navigate(`/agent/${agentId}`);
  };

  const handlePurchase = async (agent, e) => {
    e.stopPropagation();
    
    if (!username) {
      showNotification("Please log in to purchase agents", "error");
      return;
    }

    if (purchasing) return;

    if (coins < (agent.price || 0)) {
      showNotification(`Insufficient coins. Need ${agent.price} coins.`, "error");
      return;
    }

    if (!window.confirm(`Purchase ${agent.name} for ${agent.price} coins?`)) {
      return;
    }

    setPurchasing(agent.id);
    try {
      const result = await purchaseAgent(agent.id, username);
      
      // Update balance
      await refreshBalance();
      await refreshAgents();
      
      showNotification(result.message || "Agent purchased successfully!", "success");
    } catch (error) {
      console.error("[Marketplace] Purchase error:", error);
      showNotification(error.message || "Failed to purchase agent", "error");
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) {
    return <Loader message="Loading marketplace..." />;
  }

  return (
    <div className="marketplace-page">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="marketplace-header">
        <button className="back-button" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
        <h1>🏪 Marketplace</h1>
        <p className="marketplace-subtitle">
          Browse and discover AI agents from all players
        </p>
      </div>

      {/* Filters and Search */}
      <div className="marketplace-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name or owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Agents</option>
            <option value="forSale">For Sale</option>
            <option value="available">Available</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="power">Sort by Power</option>
            <option value="rarity">Sort by Rarity</option>
            <option value="price">Sort by Price</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      {/* Agent Grid */}
      {filteredAgents.length === 0 ? (
        <EmptyState
          message={
            searchTerm || filterBy !== "all"
              ? "No agents match your filters"
              : "No agents in the marketplace yet"
          }
          subtitle={
            searchTerm || filterBy !== "all"
              ? "Try adjusting your search or filters"
              : "Create your first agent to get started!"
          }
        />
      ) : (
        <>
          <div className="results-count">
            Showing {filteredAgents.length} agent{filteredAgents.length !== 1 ? "s" : ""}
          </div>
          <div className="agents-grid">
            {filteredAgents.map((agent) => {
              const rarity = calculateRarity(agent);
              const rarityColor =
                rarity >= 80
                  ? "#ff6b6b"
                  : rarity >= 60
                  ? "#4ecdc4"
                  : rarity >= 40
                  ? "#95e1d3"
                  : "#ffeaa7";

              return (
                <div
                  key={agent.id}
                  className="agent-card"
                  onClick={() => handleViewAgent(agent.id)}
                >
                  <div
                    className="agent-card-header"
                    style={{ borderTopColor: rarityColor }}
                  >
                    <div className="agent-avatar">
                      {agent.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="agent-name">{agent.name || "Unnamed"}</div>
                    {agent.forSale && (
                      <div className="for-sale-badge">
                        💰 {agent.price} Coins
                      </div>
                    )}
                  </div>

                  <div className="agent-card-body">
                    <div className="agent-stats">
                      <div className="stat-item">
                        <span className="stat-label">⚡ Power</span>
                        <span className="stat-value">{agent.power || 0}</span>
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
                        <span className="meta-label">Owner:</span>
                        <span className="meta-value">
                          {agent.owner || "Unclaimed"}
                        </span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Rarity:</span>
                        <span
                          className="meta-value"
                          style={{ color: rarityColor }}
                        >
                          {rarity.toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    {agent.energy !== undefined && (
                      <div className="energy-bar-container">
                        <div className="energy-label">Energy: {agent.energy || 100}/100</div>
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
                    {agent.forSale && agent.owner !== username ? (
                      <button
                        className="buy-button"
                        onClick={(e) => handlePurchase(agent, e)}
                        disabled={purchasing === agent.id || coins < (agent.price || 0)}
                      >
                        {purchasing === agent.id
                          ? "Purchasing..."
                          : `Buy for ${agent.price} Coins`}
                      </button>
                    ) : (
                      <button
                        className="view-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewAgent(agent.id);
                        }}
                      >
                        View Profile
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default Marketplace;
