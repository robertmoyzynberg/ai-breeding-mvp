import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function CreateAccount() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    const existingUsername = localStorage.getItem("username");
    if (existingUsername) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      console.log("[CreateAccount] Creating account for:", username);
      localStorage.setItem("username", username);
      navigate("/dashboard");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
      <h1>Create Account</h1>
      <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
        <div style={{ marginBottom: "15px" }}>
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              padding: "10px",
              fontSize: "16px",
              width: "100%",
              boxSizing: "border-box",
            }}
          />
        </div>
        <button
          type="submit"
          disabled={!username.trim()}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            width: "100%",
          }}
        >
          Create Account
        </button>
      </form>
    </div>
  );
}

export default CreateAccount;

