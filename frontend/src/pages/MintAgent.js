import React from "react";
import { useNavigate } from "react-router-dom";

function MintAgent() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Mint Agent as NFT</h1>
      <button onClick={() => navigate("/agents")}>Back</button>
      <p>NFT minting interface will be displayed here.</p>
    </div>
  );
}

export default MintAgent;

