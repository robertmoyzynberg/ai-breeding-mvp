import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { breedAgents, getAgent } from "../api/backend";

function BreedingResult() {
  const navigate = useNavigate();
  const { parentAId, parentBId } = useParams();
  const [parentA, setParentA] = useState(null);
  const [parentB, setParentB] = useState(null);
  const [baby, setBaby] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function performBreeding() {
      try {
        console.log("[BreedingResult] Starting breeding process...");
        console.log("[BreedingResult] Parent A ID:", parentAId);
        console.log("[BreedingResult] Parent B ID:", parentBId);

        // Load parent details
        const [parentAData, parentBData] = await Promise.all([
          getAgent(parseInt(parentAId)),
          getAgent(parseInt(parentBId)),
        ]);

        console.log("[BreedingResult] Parent A:", parentAData);
        console.log("[BreedingResult] Parent B:", parentBData);

        setParentA(parentAData);
        setParentB(parentBData);

        // Perform breeding
        const babyData = await breedAgents(
          parseInt(parentAId),
          parseInt(parentBId)
        );
        console.log("[BreedingResult] Baby created:", babyData);
        setBaby(babyData);
      } catch (err) {
        console.error("[BreedingResult] Breeding error:", err);
        setError(err.message || "Breeding failed");
      } finally {
        setLoading(false);
      }
    }

    if (parentAId && parentBId) {
      performBreeding();
    } else {
      setError("Missing parent IDs");
      setLoading(false);
    }
  }, [parentAId, parentBId]);

  if (loading) {
    return (
      <div style={{ padding: "20px" }}>
        <h1>Breeding in Progress...</h1>
        <p>Creating your new agent...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "20px" }}>
        <h1>Breeding Failed</h1>
        <p>Error: {error}</p>
        <button onClick={() => navigate("/breed/select")}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Breeding Result</h1>

      {parentA && parentB && (
        <div style={{ marginBottom: "30px" }}>
          <h2>Parents:</h2>
          <div style={{ display: "flex", gap: "20px" }}>
            <div style={{ padding: "15px", border: "1px solid #ccc", borderRadius: "8px" }}>
              <h3>Parent A: {parentA.name}</h3>
              {parentA.traits && (
                <p>
                  S: {parentA.traits.strength} | Sp: {parentA.traits.speed} | I:{" "}
                  {parentA.traits.intelligence}
                </p>
              )}
            </div>
            <div style={{ padding: "15px", border: "1px solid #ccc", borderRadius: "8px" }}>
              <h3>Parent B: {parentB.name}</h3>
              {parentB.traits && (
                <p>
                  S: {parentB.traits.strength} | Sp: {parentB.traits.speed} | I:{" "}
                  {parentB.traits.intelligence}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {baby && (
        <div
          style={{
            padding: "20px",
            background: "#e8f5e9",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          <h2>🎉 New Baby Agent Created!</h2>
          <h3>{baby.name}</h3>
          {baby.traits && (
            <div>
              <p>
                <strong>Traits:</strong>
              </p>
              <p>
                Strength: {baby.traits.strength || 0} | Speed:{" "}
                {baby.traits.speed || 0} | Intelligence:{" "}
                {baby.traits.intelligence || 0}
              </p>
            </div>
          )}
          <p>
            <strong>Power:</strong> {baby.power || 0}
          </p>
          <p>
            <strong>Rarity:</strong> {baby.rarity || "common"}
          </p>
          {baby.rareTrait && (
            <p>
              <strong>Rare Trait:</strong> {baby.rareTrait.name} (+
              {baby.rareTrait.powerBonus} power)
            </p>
          )}
          <p>
            <strong>Energy:</strong> {baby.energy || 100}
          </p>
        </div>
      )}

      <div style={{ display: "flex", gap: "10px" }}>
        <button onClick={() => navigate("/agents")}>View My Agents</button>
        <button onClick={() => navigate("/breed/select")}>Breed Again</button>
        <button onClick={() => navigate("/dashboard")}>Dashboard</button>
      </div>
    </div>
  );
}

export default BreedingResult;
