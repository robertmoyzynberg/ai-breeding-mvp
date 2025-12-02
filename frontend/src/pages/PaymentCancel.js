import React from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import "./PaymentCancel.css";

function PaymentCancel() {
  const navigate = useNavigate();
  const { showNotification } = useApp();

  const handleGoToStore = () => {
    navigate("/store");
  };

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="payment-cancel-page">
      <div className="cancel-container">
        <div className="cancel-icon">❌</div>
        <h1>Payment Cancelled</h1>
        <p className="cancel-message">
          Your payment was cancelled. No charges were made to your account.
        </p>
        
        <div className="action-buttons">
          <button className="primary-button" onClick={handleGoToStore}>
            Try Again
          </button>
          <button className="secondary-button" onClick={handleGoToDashboard}>
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentCancel;

