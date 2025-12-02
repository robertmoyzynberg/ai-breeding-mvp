import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { getBalance } from "../api/backend";
import "./PaymentSuccess.css";

function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshBalance, showNotification } = useApp();
  const [loading, setLoading] = useState(true);
  const username = localStorage.getItem("username") || "user";

  useEffect(() => {
    async function handleSuccess() {
      try {
        // Fetch new balance from backend
        await refreshBalance();
        
        // Show success notification
        if (showNotification) {
          showNotification("Payment successful! Coins have been added to your account.", "success");
        }
        
        // Auto-redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate("/dashboard");
        }, 3000);
      } catch (error) {
        console.error("[PaymentSuccess] Error:", error);
      } finally {
        setLoading(false);
      }
    }

    handleSuccess();
  }, [navigate, refreshBalance, showNotification]);

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  const handleGoToStore = () => {
    navigate("/store");
  };

  return (
    <div className="payment-success-page">
      <div className="success-container">
        <div className="success-icon">✅</div>
        <h1>Payment Successful!</h1>
        <p className="success-message">
          Your payment has been processed successfully. Coins have been added to your account.
        </p>
        
        {loading ? (
          <div className="loading-message">Updating your balance...</div>
        ) : (
          <div className="action-buttons">
            <button className="primary-button" onClick={handleGoToDashboard}>
              Go to Dashboard
            </button>
            <button className="secondary-button" onClick={handleGoToStore}>
              Back to Store
            </button>
          </div>
        )}
        
        <p className="auto-redirect">
          Redirecting to dashboard in 3 seconds...
        </p>
      </div>
    </div>
  );
}

export default PaymentSuccess;

