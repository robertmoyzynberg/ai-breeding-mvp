import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { createPaymentIntent, confirmPayment, getPaymentHistory, refillEnergy, applyXPBoost, rollRareTrait } from "../api/backend";
import { getAgents } from "../api/backend";
import Loader from "../components/Loader";
import Notification from "../components/Notification";
import "./Store.css";

function Store() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "user";
  const { coins, refreshBalance, updateCoins, agents, refreshAgents } = useApp();
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState(null);

  useEffect(() => {
    loadPaymentHistory();
  }, []);

  const loadPaymentHistory = async () => {
    try {
      const history = await getPaymentHistory(username);
      setPaymentHistory(history || []);
    } catch (error) {
      console.error("[Store] Error loading payment history:", error);
    }
  };

  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handlePurchase = async (coinAmount, price) => {
    if (processing) return;

    setProcessing(true);
    try {
      console.log("[Store] Processing purchase:", { coinAmount, price, username });

      // Step 1: Create payment intent
      const paymentData = await createPaymentIntent({
        userId: username,
        amount: price,
        currency: "USD",
        paymentMethod: "stripe", // Can be changed to 'coinbase', 'metamask', etc.
      });

      console.log("[Store] Payment intent created:", paymentData);

      // Step 2: Simulate payment confirmation (in production, this would be handled by payment provider)
      // TODO: Replace with actual payment provider integration
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate payment processing

      // Step 3: Confirm payment and add coins
      const result = await confirmPayment({
        paymentId: paymentData.paymentId,
        transactionId: paymentData.paymentIntent.id,
        userId: username,
        coins: coinAmount,
      });

      console.log("[Store] Payment confirmed:", result);

      // Update global state
      updateCoins(result.coins);
      await refreshBalance();

      // Reload payment history
      await loadPaymentHistory();

      // Redirect to success page
      navigate("/payment/success");
    } catch (error) {
      console.error("[Store] Payment error:", error);
      showNotification(
        `Payment failed: ${error.message}`,
        "error"
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleRedeemAction = async (action, agentId) => {
    if (processing || !agentId) {
      if (!agentId) {
        showNotification("Please select an agent first", "error");
      }
      return;
    }

    setProcessing(true);
    try {
      let result;
      let actionName;

      switch (action) {
        case "refill-energy":
          result = await refillEnergy(agentId, username);
          actionName = "Energy Refill";
          break;
        case "xp-boost":
          result = await applyXPBoost(agentId, username);
          actionName = "XP Boost";
          break;
        case "rare-trait-roll":
          result = await rollRareTrait(agentId, username);
          actionName = "Rare Trait Roll";
          break;
        default:
          throw new Error("Unknown action");
      }

      // Update global state
      updateCoins(result.coins);
      await refreshBalance();
      await refreshAgents();

      showNotification(result.message || `${actionName} successful!`, "success");
    } catch (error) {
      console.error("[Store] Redeem error:", error);
      showNotification(
        error.message || `Failed to redeem ${action}`,
        "error"
      );
    } finally {
      setProcessing(false);
    }
  };

  const coinPackages = [
    {
      id: 1,
      coins: 50,
      price: 0.99,
      bonus: 0,
      popular: false,
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
    {
      id: 2,
      coins: 100,
      price: 1.99,
      bonus: 10,
      popular: true,
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      id: 3,
      coins: 250,
      price: 4.99,
      bonus: 50,
      popular: false,
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      id: 4,
      coins: 500,
      price: 9.99,
      bonus: 150,
      popular: false,
      gradient: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
    },
  ];


  return (
    <div className="store-page">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="store-header">
        <button className="back-button" onClick={() => navigate("/dashboard")}>
          ← Back
        </button>
        <h1>💰 Store</h1>
        <div className="balance-display">
          <span className="balance-label">Your Balance:</span>
          <span className="balance-amount">{coins} Coins</span>
        </div>
      </div>

      <div className="store-content">
        {/* Coin Packages */}
        <div className="packages-section">
          <h2>Purchase Coins</h2>
          <p className="section-description">
            Buy coins to create agents, mint NFTs, and purchase energy!
          </p>

          <div className="packages-grid">
            {coinPackages.map((pkg) => (
              <div
                key={pkg.id}
                className={`package-card ${pkg.popular ? "popular" : ""} ${
                  processing ? "disabled" : ""
                }`}
              >
                {pkg.popular && (
                  <div className="popular-badge">🔥 BEST VALUE</div>
                )}
                <div
                  className="package-header"
                  style={{ background: pkg.gradient }}
                >
                  <div className="package-icon">💰</div>
                  <div className="package-coins">
                    {pkg.coins + pkg.bonus} Coins
                    {pkg.bonus > 0 && (
                      <span className="bonus-badge">+{pkg.bonus} Bonus</span>
                    )}
                  </div>
                </div>
                <div className="package-body">
                  <div className="package-price">
                    <span className="price-amount">${pkg.price.toFixed(2)}</span>
                    <span className="price-per-coin">
                      ${(pkg.price / (pkg.coins + pkg.bonus)).toFixed(4)} per coin
                    </span>
                  </div>
                  <button
                    className="purchase-button"
                    onClick={() => handlePurchase(pkg.coins + pkg.bonus, pkg.price)}
                    disabled={processing}
                    style={{ background: pkg.gradient }}
                  >
                    {processing ? "Processing..." : "Purchase"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Redeem Coins Section */}
        <div className="redeem-section">
          <h2>Redeem Coins</h2>
          <p className="section-description">
            Spend your coins to enhance your agents!
          </p>

          {/* Agent Selector */}
          <div className="agent-selector">
            <label htmlFor="agent-select">Select Agent:</label>
            <select
              id="agent-select"
              value={selectedAgentId || ""}
              onChange={(e) => setSelectedAgentId(e.target.value ? parseInt(e.target.value) : null)}
              className="agent-select"
            >
              <option value="">-- Select an agent --</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} (Energy: {agent.energy || 100}, XP: {agent.xp || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Action Items */}
          <div className="action-items-grid">
            <div className="action-item-card">
              <div className="action-icon">⚡</div>
              <h3>Energy Refill</h3>
              <p className="action-description">Restore agent energy to 100</p>
              <div className="action-cost">50 Coins</div>
              <button
                className="action-button"
                onClick={() => handleRedeemAction("refill-energy", selectedAgentId)}
                disabled={processing || !selectedAgentId || coins < 50}
                style={{
                  background: coins >= 50 && selectedAgentId
                    ? "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                    : "#ccc",
                }}
              >
                {processing ? "Processing..." : "Refill Energy"}
              </button>
            </div>

            <div className="action-item-card">
              <div className="action-icon">🚀</div>
              <h3>XP Boost</h3>
              <p className="action-description">+20% XP on next battle</p>
              <div className="action-cost">100 Coins</div>
              <button
                className="action-button"
                onClick={() => handleRedeemAction("xp-boost", selectedAgentId)}
                disabled={processing || !selectedAgentId || coins < 100}
                style={{
                  background: coins >= 100 && selectedAgentId
                    ? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                    : "#ccc",
                }}
              >
                {processing ? "Processing..." : "Apply Boost"}
              </button>
            </div>

            <div className="action-item-card">
              <div className="action-icon">✨</div>
              <h3>Rare Trait Roll</h3>
              <p className="action-description">Re-roll one stat to 8-10</p>
              <div className="action-cost">200 Coins</div>
              <button
                className="action-button"
                onClick={() => handleRedeemAction("rare-trait-roll", selectedAgentId)}
                disabled={processing || !selectedAgentId || coins < 200}
                style={{
                  background: coins >= 200 && selectedAgentId
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    : "#ccc",
                }}
              >
                {processing ? "Processing..." : "Roll Trait"}
              </button>
            </div>
          </div>
        </div>

        {/* Payment Methods Info */}
        <div className="payment-info-section">
          <h3>💳 Payment Methods</h3>
          <div className="payment-methods">
            <div className="payment-method-card">
              <div className="method-icon">💳</div>
              <div className="method-name">Credit/Debit Card</div>
              <div className="method-status">Coming Soon</div>
            </div>
            <div className="payment-method-card">
              <div className="method-icon">🪙</div>
              <div className="method-name">Crypto (Coinbase Pay)</div>
              <div className="method-status">Coming Soon</div>
            </div>
            <div className="payment-method-card">
              <div className="method-icon">🦊</div>
              <div className="method-name">MetaMask</div>
              <div className="method-status">Coming Soon</div>
            </div>
          </div>
          <p className="info-note">
            💡 Currently using simulated payments. Real payment integration coming soon!
          </p>
        </div>

        {/* Payment History */}
        <div className="history-section">
          <div className="history-header">
            <h3>📜 Payment History</h3>
            <button
              className="toggle-history-button"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? "Hide" : "Show"} History
            </button>
          </div>

          {showHistory && (
            <div className="history-content">
              {paymentHistory.length === 0 ? (
                <div className="empty-history">
                  <p>No payment history yet.</p>
                  <p>Make your first purchase to see it here!</p>
                </div>
              ) : (
                <div className="history-list">
                  {paymentHistory.map((payment) => (
                    <div key={payment.id} className="history-item">
                      <div className="history-main">
                        <div className="history-amount">
                          ${payment.amount.toFixed(2)} {payment.currency.toUpperCase()}
                        </div>
                        <div className="history-status">
                          <span className={`status-badge status-${payment.status}`}>
                            {payment.status}
                          </span>
                        </div>
                      </div>
                      <div className="history-details">
                        <span className="history-date">
                          {new Date(payment.created_at).toLocaleString()}
                        </span>
                        {payment.transaction_id && (
                          <span className="history-tx">
                            TX: {payment.transaction_id.slice(0, 20)}...
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Store;

