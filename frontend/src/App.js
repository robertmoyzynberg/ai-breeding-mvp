import React, { useState, useEffect } from "react";
import agents from "./agents.json";

function breed(agent1, agent2) {
  if (!agent1 || !agent2) return null;

  const offspring = {
    id: Math.floor(Math.random() * 100000),
    name: `Offspring of ${agent1.name} & ${agent2.name}`,
    traits: {},
    rarity: "common",
  };

  Object.keys(agent1.traits).forEach((trait) => {
    const variation = Math.floor(Math.random() * 3) - 1; // -1,0,+1
    offspring.traits[trait] = Math.max(
      1,
      Math.round((agent1.traits[trait] + agent2.traits[trait]) / 2 + variation)
    );
  });

  // Assign simple rarity based on total traits
  const total = Object.values(offspring.traits).reduce((a, b) => a + b, 0);
  if (total > 20) offspring.rarity = "rare";
  else if (total > 15) offspring.rarity = "uncommon";

  return offspring;
}

function App() {
  const [offspringList, setOffspringList] = useState(() => {
    const saved = localStorage.getItem("offspring");
    return saved ? JSON.parse(saved) : [];
  });

  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem("coins");
    return saved ? parseInt(saved, 10) : 50; // start with 50 coins
  });

  // Save to localStorage whenever offspringList changes
  useEffect(() => {
    localStorage.setItem("offspring", JSON.stringify(offspringList));
  }, [offspringList]);

  // Save to localStorage whenever coins change
  useEffect(() => {
    localStorage.setItem("coins", coins.toString());
  }, [coins]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>AI Breeding MVP</h1>
      <h2>Coins: {coins}</h2>

      <h2>Parent Agents</h2>
      {agents.map((agent) => (
        <div
          key={agent.id}
          style={{ border: "1px solid black", margin: "10px", padding: "10px" }}
        >
          <h3>{agent.name}</h3>
          <ul>
            {Object.entries(agent.traits).map(([key, value]) => (
              <li key={key}>
                {key}: {value}
              </li>
            ))}
          </ul>
        </div>
      ))}

      <button
        onClick={() => {
          if (agents.length < 2) {
            alert("Need at least 2 agents to breed");
            return;
          }
          
          // Calculate breeding cost (1-10 coins random)
          const breedCost = Math.floor(Math.random() * 10) + 1;
          
          // Check if user has enough coins
          if (coins < breedCost) {
            alert(`Not enough coins to breed! Need ${breedCost} coins, but you only have ${coins}.`);
            return;
          }
          
          // Deduct coins
          setCoins((c) => c - breedCost);
          
          // Breed the agents
          const child = breed(agents[0], agents[1]);
          if (child) {
            const newList = [...offspringList, child];
            setOffspringList(newList);
            
            // Reward rare offspring
            if (child.rarity === 'uncommon') {
              setCoins((c) => c + 5);
            }
            if (child.rarity === 'rare') {
              setCoins((c) => c + 15);
            }
          }
        }}
        style={{ marginTop: "20px", padding: "10px 20px" }}
      >
        Breed First Two Agents (Cost: 1-10 coins)
      </button>

      <h2>Offspring</h2>
      {offspringList.map((agent) => (
        <div
          key={agent.id}
          style={{ border: "1px solid green", margin: "10px", padding: "10px" }}
        >
          <h3>{agent.name}</h3>
          <h4>Rarity: {agent.rarity}</h4>
          <ul>
            {Object.entries(agent.traits).map(([key, value]) => (
              <li key={key}>
                {key}: {value}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default App;
