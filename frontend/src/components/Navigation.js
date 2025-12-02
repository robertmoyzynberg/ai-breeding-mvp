import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import "./Navigation.css";

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { coins } = useApp();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="main-navigation">
      <div className="nav-container">
        <div className="nav-logo" onClick={() => navigate("/dashboard")}>
          🧬 AI Breeding
        </div>
        <div className="nav-balance">
          <span className="balance-icon">💰</span>
          <span className="balance-amount">{coins}</span>
        </div>
        <div className="nav-links">
          <button
            className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}
            onClick={() => navigate("/dashboard")}
          >
            <span className="nav-icon">🏠</span>
            <span className="nav-text">Dashboard</span>
          </button>
          <button
            className={`nav-link ${isActive("/agents") ? "active" : ""}`}
            onClick={() => navigate("/agents")}
          >
            <span className="nav-icon">👥</span>
            <span className="nav-text">Agents</span>
          </button>
          <button
            className={`nav-link ${isActive("/breed/select") ? "active" : ""}`}
            onClick={() => navigate("/breed/select")}
          >
            <span className="nav-icon">🧬</span>
            <span className="nav-text">Breed</span>
          </button>
          <button
            className={`nav-link ${isActive("/marketplace") ? "active" : ""}`}
            onClick={() => navigate("/marketplace")}
          >
            <span className="nav-icon">🏪</span>
            <span className="nav-text">Marketplace</span>
          </button>
          <button
            className={`nav-link ${isActive("/store") ? "active" : ""}`}
            onClick={() => navigate("/store")}
          >
            <span className="nav-icon">💰</span>
            <span className="nav-text">Store</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;

