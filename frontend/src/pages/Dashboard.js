import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAgents } from "../api/backend";
import { useApp } from "../context/AppContext";
import Loader from "../components/Loader";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const { coins, balanceLoading } = useApp();
  const username = localStorage.getItem("username") || "User";
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAgents: 0,
    totalPower: 0,
    totalXP: 0,
    averagePower: 0,
  });

  useEffect(() => {
    async function loadAgents() {
      try {
        console.log("[Dashboard] Loading agents from backend...");
        const data = await getAgents();
        console.log("[Dashboard] Agents loaded:", data);
        setAgents(data || []);
        
        // Calculate stats
        const totalPower = data.reduce((sum, agent) => {
          const power = agent.power || (agent.traits ? 
            (agent.traits.strength || 0) * 3 + 
            (agent.traits.speed || 0) * 2 + 
            (agent.traits.intelligence || 0) * 2 : 0);
          return sum + power;
        }, 0);
        
        const totalXP = data.reduce((sum, agent) => sum + (agent.xp || 0), 0);
        
        setStats({
          totalAgents: data.length,
          totalPower,
          totalXP,
          averagePower: data.length > 0 ? Math.round(totalPower / data.length) : 0,
        });
      } catch (error) {
        console.error("[Dashboard] Error loading agents:", error);
        setAgents([]);
      } finally {
        setLoading(false);
      }
    }
    loadAgents();
  }, []);

  const quickActions = [
    {
      icon: "✨",
      title: "Create Agent",
      description: "Generate a new AI agent",
      action: () => navigate("/create-agent"),
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      icon: "👥",
      title: "My Agents",
      description: "View all your agents",
      action: () => navigate("/agents"),
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
    {
      icon: "🧬",
      title: "Breed Agents",
      description: "Create new offspring",
      action: () => navigate("/breed/select"),
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      icon: "⚔️",
      title: "Battle Arena",
      description: "Fight your agents",
      action: () => navigate("/dashboard"),
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    },
    {
      icon: "🏪",
      title: "Marketplace",
      description: "Buy & sell agents",
      action: () => navigate("/marketplace"),
      gradient: "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
    },
    {
      icon: "💰",
      title: "Store",
      description: "Purchase upgrades",
      action: () => navigate("/store"),
      gradient: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
    },
  ];

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Welcome back, <span className="hero-name">{username}</span>! 👋
          </h1>
          <p className="hero-subtitle">
            Manage your AI agents, breed new generations, and dominate the arena
          </p>
        </div>
        <div className="hero-stats">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalAgents}</div>
              <div className="stat-label">Total Agents</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⚡</div>
            <div className="stat-content">
              <div className="stat-value">{stats.averagePower}</div>
              <div className="stat-label">Avg Power</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalXP}</div>
              <div className="stat-label">Total XP</div>
            </div>
          </div>
          <div className="stat-card coin-stat">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <div className="stat-value">
                {balanceLoading ? "..." : coins}
              </div>
              <div className="stat-label">Coins</div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions-grid">
          {quickActions.map((action, index) => (
            <div
              key={index}
              className="action-card"
              onClick={action.action}
              style={{ background: action.gradient }}
            >
              <div className="action-icon">{action.icon}</div>
              <div className="action-content">
                <h3 className="action-title">{action.title}</h3>
                <p className="action-description">{action.description}</p>
              </div>
              <div className="action-arrow">→</div>
            </div>
          ))}
        </div>
      </div>

      {stats.totalAgents > 0 && (
        <div className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Your Agents Overview</h2>
            <button
              className="btn btn-outline"
              onClick={() => navigate("/agents")}
            >
              View All →
            </button>
          </div>
          <div className="agents-preview">
            <div className="preview-stat">
              <span className="preview-label">Total Agents:</span>
              <span className="preview-value">{stats.totalAgents}</span>
            </div>
            <div className="preview-stat">
              <span className="preview-label">Total Power:</span>
              <span className="preview-value">{stats.totalPower}</span>
            </div>
            <div className="preview-stat">
              <span className="preview-label">Average Power:</span>
              <span className="preview-value">{stats.averagePower}</span>
            </div>
          </div>
        </div>
      )}

      {stats.totalAgents === 0 && (
        <div className="empty-dashboard">
          <div className="empty-icon">🧬</div>
          <h2>Get Started</h2>
          <p>Create your first AI agent to begin your breeding journey!</p>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate("/create-agent")}
          >
            Create Your First Agent
          </button>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
