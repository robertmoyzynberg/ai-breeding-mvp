import React, { useState, useEffect, useRef } from "react";
import { Routes, Route } from "react-router-dom";
import { mintAgentOnChain } from "./blockchain/nft";
import { connectWallet } from "./blockchain/wallet";
import OffspringList from "./components/OffspringList";
import AgentSelector from "./components/AgentSelector";
import BattleArena from "./components/BattleArena";
import Navigation from "./components/Navigation";
import CreateAccount from "./pages/CreateAccount";
import Dashboard from "./pages/Dashboard";
import CreateAgent from "./pages/CreateAgent";
import MyAgents from "./pages/MyAgents";
import SelectParentA from "./pages/SelectParentA";
import SelectParentB from "./pages/SelectParentB";
import BreedingResult from "./pages/BreedingResult";
import MintAgent from "./pages/MintAgent";
import Marketplace from "./pages/Marketplace";
import AgentProfile from "./pages/AgentProfile";
import Store from "./pages/Store";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import { useApp } from "./context/AppContext";
import {
  getAgents as apiGetAgents,
  createAgent as apiCreateAgent,
  updateAgent as apiUpdateAgent,
  deleteAgent as apiDeleteAgent,
  battleAgents as apiBattleAgents,
  breedAgents as apiBreedAgents,
  getChatHistory as apiGetChatHistory,
  sendChatMessage as apiSendChatMessage,
  checkHealth,
  API_URL,
} from "./api/backend";

// Rarity weights for traits (1-10 scale, higher = rarer)
const rarityWeights = {
  strength: {
    // 1-3: common (weight 1), 4-6: uncommon (weight 2), 7-10: rare (weight 4)
    getWeight: (value) => {
      if (value <= 3) return 1;
      if (value <= 6) return 2;
      return 4;
    },
  },
  speed: {
    getWeight: (value) => {
      if (value <= 3) return 1;
      if (value <= 6) return 2;
      return 4;
    },
  },
  intelligence: {
    getWeight: (value) => {
      if (value <= 3) return 1;
      if (value <= 6) return 2;
      return 4;
    },
  },
};

// Rare traits with power bonuses
export const rareTraits = [
  { name: "winged", powerBonus: 5 },
  { name: "telepathic", powerBonus: 7 },
  { name: "invisible", powerBonus: 10 },
];

// Random mutation function (10% chance to increase stat by 1)
function randomMutation() {
  return Math.random() < 0.1 ? 1 : 0;
}

// Maybe rare trait function (5% chance to get a rare trait)
function maybeRareTrait() {
  if (Math.random() < 0.05) {
    return rareTraits[Math.floor(Math.random() * rareTraits.length)];
  }
  return null;
}

// Calculate rarity percentage (0-100%)
function calculateRarity(agent) {
  const weights = Object.entries(agent.traits).map(([trait, value]) => {
    const traitRarity = rarityWeights[trait];
    return traitRarity ? traitRarity.getWeight(value) : 1;
  });

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const maxWeight = 12; // 4 + 4 + 4 (all traits at max)
  return (totalWeight / maxWeight) * 100;
}

// Check if agent has enough energy to breed
function canBreed(agent) {
  return (agent.energy || 100) >= 20; // minimum 20 energy required
}

// Regenerate energy for an agent (+5 per tick, max 100)
function regenerateEnergy(agent) {
  agent.energy = Math.min((agent.energy || 100) + 5, 100);
}

// breed function moved inside App component to access state

// Update power calculation to include rare trait bonus
function updatePower(agent) {
  const basePower =
    (agent.traits.strength || 0) * 2 +
    (agent.traits.speed || 0) * 2 +
    (agent.traits.intelligence || 0) * 3 +
    Math.floor((agent.xp || 0) / 5); // XP bonus

  const rareTraitBonus = agent.rareTrait ? agent.rareTrait.powerBonus : 0;
  agent.power = basePower + rareTraitBonus;
}

function randomTxId() {
  return [...Array(64)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("");
}

function App() {
  const { addCoins, refreshBalance } = useApp();
  const [agents, setAgents] = useState([]);

  const [offspringList, setOffspringList] = useState(() => {
    const saved = localStorage.getItem("offspring");
    return saved ? JSON.parse(saved) : [];
  });

  const [mintedNFTs, setMintedNFTs] = useState(() => {
    const saved = localStorage.getItem("mintedNFTs");
    return saved ? JSON.parse(saved) : [];
  });

  const [coins, setCoins] = useState(() => {
    const savedCoins = localStorage.getItem("coins");
    return savedCoins ? JSON.parse(savedCoins) : 50;
  });

  const [selectedParents, setSelectedParents] = useState([]);

  const [wallet, setWallet] = useState(null);

  const [autoBreeding, setAutoBreeding] = useState(false);
  const autoRef = useRef(null);

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("history");
    return saved ? JSON.parse(saved) : [];
  });

  const [lastBattle, setLastBattle] = useState(null);

  const [autoBattling, setAutoBattling] = useState(false);
  const battleRef = useRef(null);

  // Validate and normalize agent structure
  function validateAgent(agent) {
    if (!agent || !agent.id) return null;

    // Ensure traits exist with default values
    if (!agent.traits) {
      agent.traits = {
        strength: 1,
        speed: 1,
        intelligence: 1,
      };
    } else {
      // Ensure all required traits exist
      agent.traits = {
        strength: agent.traits.strength ?? 1,
        speed: agent.traits.speed ?? 1,
        intelligence: agent.traits.intelligence ?? 1,
      };
    }

    // Ensure other required fields exist
    agent.energy = agent.energy ?? 100;
    agent.xp = agent.xp ?? 0;
    agent.rarity = agent.rarity ?? "common";
    agent.gene = agent.gene ?? 0; // GENE token currency

    return agent;
  }

  // Breed function that calls the backend API
  const breed = async (parent1 = null, parent2 = null) => {
    // Use provided parameters or fall back to selectedParents
    const selectedParent1 = parent1 || selectedParents[0];
    const selectedParent2 = parent2 || selectedParents[1];

    if (!selectedParent1 || !selectedParent2) {
      if (!autoBreeding) {
        alert("Please select two agents to breed.");
      }
      return null;
    }

    try {
      const babyData = await apiBreedAgents(
        selectedParent1.id,
        selectedParent2.id
      );

      // Use the child from backend response if available, otherwise transform
      let baby;
      if (babyData.child) {
        // Backend already returned a properly formatted child
        baby = babyData.child;
      } else {
        // Transform backend response to frontend agent format
        // Backend returns: intelligence, creativity, speed, energy
        // Frontend expects: traits.strength, traits.speed, traits.intelligence
        baby = {
          // Temporary ID - will be replaced with backend-assigned ID when saved
          id: Date.now(), // Temporary ID for local use
          name: babyData.name || `Baby-${Math.floor(Math.random() * 999)}`,
          traits: {
            strength: Math.max(
              1,
              Math.min(10, Math.floor((babyData.intelligence || 50) / 10))
            ), // Use intelligence for strength
            speed: Math.max(
              1,
              Math.min(10, Math.floor((babyData.speed || 50) / 10))
            ),
            intelligence: Math.max(
              1,
              Math.min(10, Math.floor((babyData.creativity || 50) / 10))
            ), // Use creativity for intelligence
          },
          xp: 0,
          energy: Math.min(100, babyData.energy || 100),
          gene: 0,
          rarity: "common", // Default, can be calculated later
          rareTrait: null,
          power: 0, // Will be calculated
        };
      }

      // Calculate power
      updatePower(baby);

      return baby;
    } catch (err) {
      console.error("Breed error:", err);
      if (!autoBreeding) {
        alert("Breeding failed. Please try again.");
      }
      return null;
    }
  };

  // Check backend health on startup
  useEffect(() => {
    async function checkBackendHealth() {
      try {
        const health = await checkHealth();
        console.log("[App] Backend health check:", health);
      } catch (err) {
        console.warn(
          "[App] Backend not available, using local fallback:",
          err.message
        );
      }
    }
    checkBackendHealth();
  }, []);

  // Fetch agents from backend (initial load + real-time polling)
  useEffect(() => {
    async function getAgents() {
      try {
        const data = await apiGetAgents();
        // Validate and normalize all agents
        const validatedAgents = data.map(validateAgent).filter(Boolean);
        setAgents(validatedAgents);
      } catch (err) {
        console.error("[App] Error fetching agents:", err);
        // No fallback - use empty array if backend fails
        setAgents([]);
      }
    }
    // Initial load
    getAgents();

    // Real-time polling every 5 seconds
    const interval = setInterval(() => {
      getAgents();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem("offspring", JSON.stringify(offspringList));
    localStorage.setItem("mintedNFTs", JSON.stringify(mintedNFTs));
    localStorage.setItem("coins", JSON.stringify(coins));
    localStorage.setItem("history", JSON.stringify(history));
  }, [offspringList, mintedNFTs, coins, history]);

  // Cleanup battle interval on unmount
  useEffect(() => {
    return () => {
      if (battleRef.current) {
        clearInterval(battleRef.current);
        battleRef.current = null;
      }
    };
  }, []);

  const toggleParent = (agent) => {
    setSelectedParents((prev) => {
      if (prev.find((a) => a.id === agent.id))
        return prev.filter((a) => a.id !== agent.id);
      if (prev.length < 2) return [...prev, agent];
      return prev;
    });
  };

  // Save child to backend
  async function saveChild(child) {
    try {
      const data = await apiCreateAgent(child);
      // Update agents list to include the new child with backend-assigned ID
      setAgents((prev) => [...prev, data]);
      // Return the saved child with backend-assigned ID
      return data;
    } catch (err) {
      console.error("Error saving child to backend:", err);
      return null; // Return null if save fails
    }
  }

  // Delete agent from backend
  async function deleteAgent(id) {
    if (!window.confirm("Are you sure you want to delete this agent?")) {
      return;
    }

    // Check if agent exists in backend before trying to delete
    const agentInBackend = agents.find((a) => a.id === id);

    if (agentInBackend) {
      try {
        await apiDeleteAgent(id);
      } catch (err) {
        console.error("Error deleting agent:", err);
      }
    }

    // Always remove from local state (whether it was in backend or not)
    setAgents((prev) => prev.filter((a) => a.id !== id));
    // Also remove from offspringList if it's there
    setOffspringList((prev) => prev.filter((a) => a.id !== id));
  }

  // Update agent (example: +1 strength)
  async function updateAgent(id) {
    const agent = agents.find((a) => a.id === id);
    if (!agent) return;

    const updated = {
      ...agent,
      traits: {
        ...agent.traits,
        strength: Math.min(10, (agent.traits.strength || 0) + 1),
      },
    };
    updated.power =
      updated.traits.strength * 2 +
      updated.traits.speed * 2 +
      updated.traits.intelligence * 3;

    try {
      const data = await apiUpdateAgent(id, updated);
      setAgents((prev) => prev.map((a) => (a.id === id ? data : a)));
    } catch (err) {
      console.error("Error updating agent:", err);
    }
  }

  const handleBreed = async (agentA = null, agentB = null) => {
    // For auto-breeding, use provided agents; otherwise use selected parents
    const parentA = agentA || selectedParents[0];
    const parentB = agentB || selectedParents[1];

    if (!parentA || !parentB) {
      if (!autoBreeding) {
        alert("Select 2 agents to breed");
      }
      return;
    }

    // Validate agents have required structure
    const validatedParentA = validateAgent({ ...parentA });
    const validatedParentB = validateAgent({ ...parentB });

    if (!validatedParentA || !validatedParentB) {
      console.error("Invalid agents for breeding:", { parentA, parentB });
      if (!autoBreeding) {
        alert("Invalid agents selected. Please try again.");
      }
      return;
    }

    // Check energy before breeding
    if (!canBreed(validatedParentA) || !canBreed(validatedParentB)) {
      if (!autoBreeding) {
        alert(
          `Not enough energy! ${validatedParentA.name}: ${
            validatedParentA.energy || 100
          }/100, ${validatedParentB.name}: ${
            validatedParentB.energy || 100
          }/100. Need at least 20 energy each.`
        );
      }
      return;
    }

    const breedCost = Math.floor(Math.random() * 10) + 1;
    if (coins < breedCost) {
      if (!autoBreeding) {
        alert(`Not enough coins! Breed cost: ${breedCost}`);
      }
      return;
    }

    const child = await breed(validatedParentA, validatedParentB);
    if (!child) {
      if (!autoBreeding) {
        alert("Breeding failed!");
      }
      return;
    }

    // Check if GENE rewards were triggered
    const parentAGeneReward =
      validatedParentA.gene === 0 && (parentA.gene || 0) >= 10;
    const parentBGeneReward =
      validatedParentB.gene === 0 && (parentB.gene || 0) >= 10;

    if (parentAGeneReward && !autoBreeding) {
      alert(`🎉 ${validatedParentA.name} earned a GENE reward! +50 Energy!`);
    }
    if (parentBGeneReward && !autoBreeding) {
      alert(`🎉 ${validatedParentB.name} earned a GENE reward! +50 Energy!`);
    }

    // Save energy changes to backend for both parents (only if they exist in backend)
    // Check if parent exists in agents array (means it's saved to backend)
    const parentAInBackend = agents.find((a) => a.id === validatedParentA.id);
    const parentBInBackend = agents.find((a) => a.id === validatedParentB.id);

    if (parentAInBackend) {
      await saveBattle(validatedParentA);
    }
    if (parentBInBackend) {
      await saveBattle(validatedParentB);
    }

    // Update local state with energy and GENE changes
    setAgents((prev) =>
      prev.map((a) =>
        a.id === validatedParentA.id
          ? {
              ...a,
              energy: validatedParentA.energy,
              gene: validatedParentA.gene || 0,
            }
          : a.id === validatedParentB.id
          ? {
              ...a,
              energy: validatedParentB.energy,
              gene: validatedParentB.gene || 0,
            }
          : a
      )
    );
    setOffspringList((prev) =>
      prev.map((a) =>
        a.id === validatedParentA.id
          ? {
              ...a,
              energy: validatedParentA.energy,
              gene: validatedParentA.gene || 0,
            }
          : a.id === validatedParentB.id
          ? {
              ...a,
              energy: validatedParentB.energy,
              gene: validatedParentB.gene || 0,
            }
          : a
      )
    );

    let reward = 0;
    if (child.rarity === "uncommon") reward = 5;
    if (child.rarity === "rare") reward = 15;

    setCoins((prev) => prev - breedCost + reward);

    // Save to backend FIRST, then use the backend-assigned ID
    const savedChild = await saveChild(child);
    if (savedChild) {
      // Use the child with backend-assigned ID
      setOffspringList((prev) => [...prev, savedChild]);
      // Also update agents list (saveChild already does this, but ensure it's in sync)
    } else {
      // Fallback: use local child if backend save fails
      setOffspringList((prev) => [...prev, child]);
    }

    // Only clear selection if manual breeding
    if (!autoBreeding) {
      setSelectedParents([]);
    }

    // Record history
    setHistory((prev) => [
      {
        tx: randomTxId(),
        wallet: wallet?.address || "no-wallet",
        timestamp: Date.now(),
        agentA: validatedParentA.name,
        agentB: validatedParentB.name,
        offspringId: child.id,
        rarity: child.rarity,
        rarityPercent: child.rarityPercent,
      },
      ...prev,
    ]);
  };

  const startAutoBreed = () => {
    if (autoBreeding) return;
    setAutoBreeding(true);

    autoRef.current = setInterval(() => {
      // Get all available agents (parent agents + offspring)
      const allAgents = [...agents, ...offspringList];

      if (allAgents.length < 2) return;

      // Select two random agents
      const a = allAgents[Math.floor(Math.random() * allAgents.length)];
      const b = allAgents[Math.floor(Math.random() * allAgents.length)];

      // Make sure they're different
      if (a && b && a.id !== b.id) {
        handleBreed(a, b);
      }
    }, 1000);
  };

  const stopAutoBreed = () => {
    setAutoBreeding(false);
    if (autoRef.current) {
      clearInterval(autoRef.current);
      autoRef.current = null;
    }
  };

  // Energy regeneration timer (every 10 seconds)
  useEffect(() => {
    const energyInterval = setInterval(() => {
      setAgents((prev) =>
        prev.map((agent) => {
          const updated = { ...agent };
          regenerateEnergy(updated);
          return updated;
        })
      );
      setOffspringList((prev) =>
        prev.map((agent) => {
          const updated = { ...agent };
          regenerateEnergy(updated);
          return updated;
        })
      );
    }, 10000); // Regenerate every 10 seconds

    return () => clearInterval(energyInterval);
  }, []);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (autoRef.current) {
        clearInterval(autoRef.current);
      }
    };
  }, []);

  const handleConnectWallet = async () => {
    const result = await connectWallet();
    if (result) setWallet(result);
  };

  // Purchase energy for an agent
  const purchaseEnergy = (agent, amount) => {
    const energyCost = amount === 20 ? 10 : amount === 50 ? 20 : 35; // 20 energy = 10 coins, 50 = 20 coins, 100 = 35 coins

    if (coins < energyCost) {
      alert(
        `Not enough coins! Need ${energyCost} coins to buy ${amount} energy.`
      );
      return;
    }

    // Deduct coins
    setCoins((prev) => prev - energyCost);

    // Add energy (cap at 100)
    const newEnergy = Math.min(100, (agent.energy || 0) + amount);
    const updatedAgent = { ...agent, energy: newEnergy };

    // Update in state
    setAgents((prev) =>
      prev.map((a) => (a.id === agent.id ? updatedAgent : a))
    );
    setOffspringList((prev) =>
      prev.map((a) => (a.id === agent.id ? updatedAgent : a))
    );

    // Save to backend if agent exists there
    const agentInBackend = agents.find((a) => a.id === agent.id);
    if (agentInBackend) {
      saveBattle(updatedAgent);
    }

    console.log(
      `Purchased ${amount} energy for ${agent.name} (cost: ${energyCost} coins)`
    );
  };

  // Purchase coins (simulated - in production, integrate payment gateway)
  const purchaseCoins = (amount) => {
    // In production: integrate Stripe, Coinbase Pay, or MetaMask
    // For now, simulate purchase
    const cost = amount === 50 ? 0.99 : amount === 100 ? 1.99 : 4.99; // USD prices

    if (
      window.confirm(
        `Purchase ${amount} coins for $${cost.toFixed(2)}? (Simulated)`
      )
    ) {
      setCoins((prev) => prev + amount);
      console.log(`Purchased ${amount} coins for $${cost.toFixed(2)}`);
      // TODO: Integrate real payment processing
    }
  };

  const mintNFT = async (child) => {
    // 1 - get expected cost
    let mintCost = 5;
    if (child.rarity === "uncommon") mintCost = 10;
    if (child.rarity === "rare") mintCost = 20;

    // 2 - check balance
    if (coins < mintCost) {
      alert("Not enough coins to mint NFT!");
      return;
    }

    // 3 - Check if MetaMask is installed before attempting to mint
    if (!window.ethereum) {
      alert(
        "MetaMask is not installed!\n\n" +
          "To mint NFTs, please install MetaMask:\n" +
          "1. Visit https://metamask.io\n" +
          "2. Install the browser extension\n" +
          "3. Refresh this page and try again"
      );
      return;
    }

    // 4 - remove coins & save (optimistic update)
    setCoins((prev) => prev - mintCost);

    // 5 - add to minted list (optimistic update)
    setMintedNFTs((prev) => [...prev, child]);

    try {
      // 6 - Attempt to mint on blockchain
      console.log("Minting NFT:", child);
      const result = await mintAgentOnChain(child);

      if (result.success) {
        alert(
          `✅ NFT Minted Successfully!\n\n` +
            `Agent: ${child.name}\n` +
            `Transaction: ${result.tx}\n\n` +
            `View on Etherscan: https://goerli.etherscan.io/tx/${result.tx}`
        );
      } else {
        throw new Error("Minting failed");
      }
    } catch (error) {
      // Revert optimistic updates on error
      setCoins((prev) => prev + mintCost);
      setMintedNFTs((prev) => prev.filter((nft) => nft.id !== child.id));

      // Show user-friendly error message
      if (error.message.includes("MetaMask")) {
        alert(
          "MetaMask Error!\n\n" +
            "Please make sure:\n" +
            "1. MetaMask is installed and unlocked\n" +
            "2. You're connected to the correct network\n" +
            "3. You have enough ETH for gas fees"
        );
      } else if (
        error.message.includes("user rejected") ||
        error.message.includes("User denied")
      ) {
        alert("Minting cancelled. You rejected the transaction in MetaMask.");
        // Don't revert coins since user cancelled
        setCoins((prev) => prev + mintCost);
      } else {
        alert(
          `Failed to mint NFT:\n\n${error.message}\n\n` +
            "Please try again or check your MetaMask connection."
        );
      }
      console.error("Error minting NFT:", error);
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case "rare":
        return {
          bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          text: "#fff",
          border: "#764ba2",
        };
      case "uncommon":
        return {
          bg: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
          text: "#fff",
          border: "#f5576c",
        };
      default:
        return {
          bg: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
          text: "#fff",
          border: "#00f2fe",
        };
    }
  };

  const getRarityBadge = (rarity) => {
    const colors = getRarityColor(rarity);
    return (
      <span
        style={{
          display: "inline-block",
          padding: "4px 12px",
          borderRadius: "20px",
          fontSize: "12px",
          fontWeight: "bold",
          textTransform: "uppercase",
          background: colors.bg,
          color: colors.text,
          marginLeft: "10px",
        }}
      >
        {rarity}
      </span>
    );
  };

  // Calculate power for an agent (includes XP bonus and rare trait bonus)
  const calculatePower = (agent) => {
    const basePower =
      (agent.traits?.strength || 0) * 2 +
      (agent.traits?.speed || 0) * 2 +
      (agent.traits?.intelligence || 0) * 3;
    const xpBonus = Math.floor((agent.xp || 0) / 5); // every 5 XP adds 1 power
    const rareTraitBonus = agent.rareTrait ? agent.rareTrait.powerBonus : 0;
    return basePower + xpBonus + rareTraitBonus;
  };

  // Create leaderboard from all agents (parents + offspring) - deduplicate by ID
  const agentsMap = new Map();
  // First add all agents from backend
  agents.forEach((a) => {
    agentsMap.set(a.id, { ...a, power: calculatePower(a) });
  });
  // Then add offspring that aren't already in agents (to avoid duplicates)
  offspringList.forEach((a) => {
    if (!agentsMap.has(a.id)) {
      agentsMap.set(a.id, { ...a, power: calculatePower(a) });
    }
  });
  const allAgents = Array.from(agentsMap.values());
  const leaderboard = [...allAgents].sort((a, b) => b.power - a.power);

  // GENE Leaderboard - sort by GENE tokens
  const geneLeaderboard = [...allAgents].sort(
    (a, b) => (b.gene || 0) - (a.gene || 0)
  );

  // Save battle results to backend (only if agent exists in backend)
  async function saveBattle(agent) {
    // Check if agent exists in backend before trying to update
    const agentInBackend = agents.find((a) => a.id === agent.id);
    if (!agentInBackend) {
      // Agent not in backend yet, skip update
      return;
    }
    try {
      await apiUpdateAgent(agent.id, agent);
    } catch (err) {
      // Silently fail if agent doesn't exist in backend
      if (err.message && !err.message.includes("404")) {
        console.error("Error saving battle result:", err);
      }
    }
  }

  // Battle function
  function battle(a, b) {
    if (!a || !b) return null;

    // Ensure both agents have power calculated
    const powerA = calculatePower(a);
    const powerB = calculatePower(b);

    // RNG luck boost (0-19)
    const luckA = Math.floor(Math.random() * 20);
    const luckB = Math.floor(Math.random() * 20);

    const scoreA = powerA + luckA;
    const scoreB = powerB + luckB;

    let winner = null;
    if (scoreA > scoreB) winner = a;
    else if (scoreB > scoreA) winner = b;
    else winner = Math.random() > 0.5 ? a : b;

    // Reward XP
    const winnerAgent = { ...winner };
    const loserAgent = { ...(winner === a ? b : a) };

    // Winner gains 10 XP
    winnerAgent.xp = (winnerAgent.xp || 0) + 10;
    winnerAgent.power = calculatePower(winnerAgent);

    // Loser gains 2 XP
    loserAgent.xp = (loserAgent.xp || 0) + 2;
    loserAgent.power = calculatePower(loserAgent);

    return { winner: winnerAgent, loser: loserAgent };
  }

  // Battle function that calls the backend API
  const handleBattle = async (p1 = null, p2 = null) => {
    const selectedParent1 = p1 || selectedParents[0];
    const selectedParent2 = p2 || selectedParents[1];

    if (!selectedParent1 || !selectedParent2) {
      if (!autoBattling) {
        alert("Select two agents to battle.");
      }
      return;
    }

    // Check if agents exist in backend before trying to battle
    const agentAInBackend = agents.find((a) => a.id === selectedParent1.id);
    const agentBInBackend = agents.find((a) => a.id === selectedParent2.id);

    // If agents exist in backend, try backend API first
    if (agentAInBackend && agentBInBackend) {
      try {
        const data = await apiBattleAgents(
          selectedParent1.id,
          selectedParent2.id
        );
        setLastBattle(data);

        // Award coins from battle
        if (data.coinRewards) {
          const username = localStorage.getItem("username");
          if (username) {
            // Winner gets +5 coins, loser gets +1 coin
            if (data.winner) {
              addCoins(data.coinRewards.winner);
            }
            if (data.loser) {
              addCoins(data.coinRewards.loser);
            }
            await refreshBalance();
          }
        }

        // Update energy + XP locally
        setAgents((prev) =>
          prev.map((a) =>
            a.id === data.agentA?.id
              ? data.agentA
              : a.id === data.agentB?.id
              ? data.agentB
              : a
          )
        );
        setOffspringList((prev) =>
          prev.map((a) =>
            a.id === data.agentA?.id
              ? data.agentA
              : a.id === data.agentB?.id
              ? data.agentB
              : a
          )
        );
        return; // Success - exit early
      } catch (err) {
        // Network error - fall back to local logic
        if (
          err.message &&
          !err.message.includes("404") &&
          !err.message.includes("Failed to fetch")
        ) {
          console.error("Backend battle error, falling back to local:", err);
        }
        // Fall through to local battle logic
      }
    } else {
      // Agents don't exist in backend - use local battle logic directly (no API call)
      if (!autoBattling) {
        console.log("Agents not in backend, using local battle logic");
      }
    }

    // Local battle logic (fallback or primary if agents not in backend)
    // Use local battle function since agents aren't in backend or API failed

    // Fallback to local battle logic if backend fails
    const fighter1 = selectedParent1;
    const fighter2 = selectedParent2;

    const battleResult = battle(fighter1, fighter2);
    if (!battleResult) return;

    const { winner, loser } = battleResult;

    // Save both agents to backend (only if they exist in backend)
    await saveBattle(winner);
    await saveBattle(loser);

    // Update local state
    const updateAgentInState = (updatedAgent) => {
      // Update in agents array
      setAgents((prev) =>
        prev.map((a) => (a.id === updatedAgent.id ? updatedAgent : a))
      );
      // Update in offspringList
      setOffspringList((prev) =>
        prev.map((a) => (a.id === updatedAgent.id ? updatedAgent : a))
      );
    };

    updateAgentInState(winner);
    updateAgentInState(loser);

    // Calculate XP gains (winner gets 10, loser gets 2)
    const xpGainA = winner === fighter1 ? 10 : 2;
    const xpGainB = winner === fighter2 ? 10 : 2;

    // Ensure agents have power calculated for display
    const agentAWithPower = { ...fighter1, power: calculatePower(fighter1) };
    const agentBWithPower = { ...fighter2, power: calculatePower(fighter2) };

    // Set lastBattle in format expected by BattleArena component and old display
    setLastBattle({
      // New format for BattleArena component
      agentA: agentAWithPower,
      agentB: agentBWithPower,
      winner: winner,
      xpGainA,
      xpGainB,
      energyA: fighter1.energy || 100,
      energyB: fighter2.energy || 100,
      // Old format for backward compatibility
      fighter1: agentAWithPower,
      fighter2: agentBWithPower,
      loser: loser,
    });
  };

  // Random battle function
  const handleRandomBattle = () => {
    const all = [...agents, ...offspringList];
    if (all.length < 2) {
      if (!autoBattling) {
        alert("Need at least 2 agents to battle!");
      }
      return;
    }

    let a = all[Math.floor(Math.random() * all.length)];
    let b = all[Math.floor(Math.random() * all.length)];

    // Make sure they're different
    while (a.id === b.id && all.length > 1) {
      b = all[Math.floor(Math.random() * all.length)];
    }

    handleBattle(a, b);
  };

  // Auto-battle mode
  const startAutoBattle = () => {
    if (autoBattling) return;

    setAutoBattling(true);

    battleRef.current = setInterval(() => {
      handleRandomBattle();
    }, 2000); // battle every 2 seconds
  };

  const stopAutoBattle = () => {
    setAutoBattling(false);
    if (battleRef.current) {
      clearInterval(battleRef.current);
      battleRef.current = null;
    }
  };

  const username = localStorage.getItem("username");

  return (
    <>
      {username && <Navigation />}
      <Routes>
        <Route path="/" element={<CreateAccount />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-agent" element={<CreateAgent />} />
        <Route path="/agents" element={<MyAgents />} />
        <Route path="/breed/select" element={<SelectParentA />} />
        <Route path="/breed/parentB/:parentAId" element={<SelectParentB />} />
        <Route
          path="/breed/run/:parentAId/:parentBId"
          element={<BreedingResult />}
        />
        <Route path="/mint" element={<MintAgent />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/store" element={<Store />} />
        <Route path="/agent/:id" element={<AgentProfile />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />
        <Route
          path="*"
          element={
            <div
              style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                padding: "20px",
                fontFamily:
                  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              }}
            >
              <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                {/* Header */}
                <div
                  style={{
                    textAlign: "center",
                    marginBottom: "40px",
                    padding: "30px",
                    background: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "20px",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <h1
                    style={{
                      fontSize: "48px",
                      fontWeight: "800",
                      color: "#fff",
                      margin: "0 0 10px 0",
                      textShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    🧬 AI Breeding MVP
                  </h1>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "20px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "12px 24px",
                        background: "rgba(255, 255, 255, 0.2)",
                        borderRadius: "50px",
                        fontSize: "24px",
                        fontWeight: "bold",
                        color: "#fff",
                        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
                      }}
                    >
                      💰 {coins} Coins
                    </div>
                    <button
                      onClick={() => purchaseCoins(50)}
                      style={{
                        padding: "10px 20px",
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#fff",
                        background:
                          "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
                        border: "none",
                        borderRadius: "25px",
                        cursor: "pointer",
                        boxShadow: "0 4px 15px rgba(246, 211, 101, 0.4)",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow =
                          "0 6px 20px rgba(246, 211, 101, 0.5)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                          "0 4px 15px rgba(246, 211, 101, 0.4)";
                      }}
                    >
                      💳 Buy Coins
                    </button>
                    <div>
                      {wallet ? (
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "12px 24px",
                            background: "rgba(76, 175, 80, 0.3)",
                            borderRadius: "50px",
                            fontSize: "14px",
                            fontWeight: "600",
                            color: "#fff",
                            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
                          }}
                        >
                          ✅ Wallet Connected: {wallet.address.slice(0, 6)}...
                          {wallet.address.slice(-4)}
                        </div>
                      ) : (
                        <button
                          onClick={handleConnectWallet}
                          style={{
                            padding: "12px 24px",
                            fontSize: "16px",
                            fontWeight: "700",
                            color: "#fff",
                            background:
                              "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                            border: "none",
                            borderRadius: "50px",
                            cursor: "pointer",
                            boxShadow: "0 4px 15px rgba(79, 172, 254, 0.4)",
                            transition: "all 0.3s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform =
                              "translateY(-2px)";
                            e.currentTarget.style.boxShadow =
                              "0 6px 20px rgba(79, 172, 254, 0.5)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 15px rgba(79, 172, 254, 0.4)";
                          }}
                        >
                          🔗 Connect Wallet
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Shop Section */}
                <div style={{ marginBottom: "40px" }}>
                  <h2
                    style={{
                      color: "#fff",
                      fontSize: "28px",
                      fontWeight: "700",
                      marginBottom: "20px",
                      textShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    🛒 Shop
                  </h2>
                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.95)",
                      borderRadius: "16px",
                      padding: "30px",
                      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "20px",
                        fontWeight: "700",
                        color: "#333",
                        marginBottom: "20px",
                      }}
                    >
                      💰 Purchase Coins
                    </h3>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "15px",
                        marginBottom: "30px",
                      }}
                    >
                      <button
                        onClick={() => purchaseCoins(50)}
                        style={{
                          padding: "20px",
                          background:
                            "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                          border: "none",
                          borderRadius: "12px",
                          color: "#fff",
                          fontSize: "16px",
                          fontWeight: "700",
                          cursor: "pointer",
                          boxShadow: "0 4px 15px rgba(79, 172, 254, 0.4)",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow =
                            "0 6px 20px rgba(79, 172, 254, 0.5)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow =
                            "0 4px 15px rgba(79, 172, 254, 0.4)";
                        }}
                      >
                        <div style={{ fontSize: "24px", marginBottom: "5px" }}>
                          💰
                        </div>
                        <div>50 Coins</div>
                        <div style={{ fontSize: "12px", opacity: 0.9 }}>
                          $0.99
                        </div>
                      </button>
                      <button
                        onClick={() => purchaseCoins(100)}
                        style={{
                          padding: "20px",
                          background:
                            "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                          border: "none",
                          borderRadius: "12px",
                          color: "#fff",
                          fontSize: "16px",
                          fontWeight: "700",
                          cursor: "pointer",
                          boxShadow: "0 4px 15px rgba(245, 87, 108, 0.4)",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow =
                            "0 6px 20px rgba(245, 87, 108, 0.5)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow =
                            "0 4px 15px rgba(245, 87, 108, 0.4)";
                        }}
                      >
                        <div style={{ fontSize: "24px", marginBottom: "5px" }}>
                          💰
                        </div>
                        <div>100 Coins</div>
                        <div style={{ fontSize: "12px", opacity: 0.9 }}>
                          $1.99
                        </div>
                        <div
                          style={{
                            fontSize: "10px",
                            marginTop: "5px",
                            background: "rgba(255,255,255,0.2)",
                            padding: "2px 6px",
                            borderRadius: "8px",
                          }}
                        >
                          BEST VALUE
                        </div>
                      </button>
                      <button
                        onClick={() => purchaseCoins(250)}
                        style={{
                          padding: "20px",
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          border: "none",
                          borderRadius: "12px",
                          color: "#fff",
                          fontSize: "16px",
                          fontWeight: "700",
                          cursor: "pointer",
                          boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow =
                            "0 6px 20px rgba(102, 126, 234, 0.5)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow =
                            "0 4px 15px rgba(102, 126, 234, 0.4)";
                        }}
                      >
                        <div style={{ fontSize: "24px", marginBottom: "5px" }}>
                          💰
                        </div>
                        <div>250 Coins</div>
                        <div style={{ fontSize: "12px", opacity: 0.9 }}>
                          $4.99
                        </div>
                        <div
                          style={{
                            fontSize: "10px",
                            marginTop: "5px",
                            background: "rgba(255,255,255,0.2)",
                            padding: "2px 6px",
                            borderRadius: "8px",
                          }}
                        >
                          PREMIUM
                        </div>
                      </button>
                    </div>
                    <div
                      style={{
                        padding: "15px",
                        background: "rgba(0, 0, 0, 0.05)",
                        borderRadius: "12px",
                        fontSize: "12px",
                        color: "#666",
                        textAlign: "center",
                      }}
                    >
                      💡 Note: Payment processing is simulated. In production,
                      integrate Stripe, Coinbase Pay, or MetaMask for real
                      transactions.
                    </div>
                  </div>
                </div>

                {/* Battle Section */}
                <div style={{ marginBottom: "40px", textAlign: "center" }}>
                  <h2
                    style={{
                      color: "#fff",
                      fontSize: "28px",
                      fontWeight: "700",
                      marginBottom: "20px",
                      textShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    ⚔️ Battle Arena
                  </h2>
                  <button
                    onClick={handleRandomBattle}
                    disabled={allAgents.length < 2}
                    style={{
                      padding: "16px 40px",
                      fontSize: "18px",
                      fontWeight: "700",
                      color: "#fff",
                      background:
                        allAgents.length < 2
                          ? "rgba(255, 255, 255, 0.3)"
                          : "linear-gradient(135deg, #f5576c 0%, #f093fb 100%)",
                      border: "none",
                      borderRadius: "50px",
                      cursor: allAgents.length < 2 ? "not-allowed" : "pointer",
                      boxShadow: "0 6px 20px rgba(245, 87, 108, 0.4)",
                      transition: "all 0.3s ease",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      opacity: allAgents.length < 2 ? 0.6 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (allAgents.length >= 2) {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow =
                          "0 8px 25px rgba(245, 87, 108, 0.5)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (allAgents.length >= 2) {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                          "0 6px 20px rgba(245, 87, 108, 0.4)";
                      }
                    }}
                  >
                    ⚔️ Battle Random Agents
                  </button>

                  {lastBattle && (
                    <div
                      style={{
                        marginTop: "30px",
                        padding: "30px",
                        background: "rgba(255, 255, 255, 0.95)",
                        borderRadius: "16px",
                        boxShadow: "0 8px 25px rgba(0, 0, 0, 0.2)",
                        maxWidth: "600px",
                        margin: "30px auto 0",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "24px",
                          fontWeight: "800",
                          color: "#333",
                          marginBottom: "20px",
                          textAlign: "center",
                        }}
                      >
                        🏆 Battle Result
                      </h3>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr auto 1fr",
                          gap: "20px",
                          alignItems: "center",
                          marginBottom: "20px",
                        }}
                      >
                        <div
                          style={{
                            textAlign: "center",
                            padding: "15px",
                            background: "rgba(0, 0, 0, 0.05)",
                            borderRadius: "12px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "18px",
                              fontWeight: "700",
                              marginBottom: "5px",
                            }}
                          >
                            {lastBattle.agentA?.name ||
                              lastBattle.fighter1?.name ||
                              "Unknown"}
                          </div>
                          <div style={{ fontSize: "14px", color: "#666" }}>
                            Power:{" "}
                            {calculatePower(
                              lastBattle.agentA || lastBattle.fighter1 || {}
                            )}
                          </div>
                        </div>
                        <div style={{ fontSize: "32px" }}>⚔️</div>
                        <div
                          style={{
                            textAlign: "center",
                            padding: "15px",
                            background: "rgba(0, 0, 0, 0.05)",
                            borderRadius: "12px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "18px",
                              fontWeight: "700",
                              marginBottom: "5px",
                            }}
                          >
                            {lastBattle.agentB?.name ||
                              lastBattle.fighter2?.name ||
                              "Unknown"}
                          </div>
                          <div style={{ fontSize: "14px", color: "#666" }}>
                            Power:{" "}
                            {calculatePower(
                              lastBattle.agentB || lastBattle.fighter2 || {}
                            )}
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          textAlign: "center",
                          padding: "20px",
                          background:
                            "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
                          borderRadius: "12px",
                          border: "3px solid #fda085",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "20px",
                            fontWeight: "700",
                            color: "#fff",
                            marginBottom: "10px",
                          }}
                        >
                          🏆 Winner
                        </div>
                        <div
                          style={{
                            fontSize: "28px",
                            fontWeight: "800",
                            color: "#fff",
                            marginBottom: "5px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "10px",
                            flexWrap: "wrap",
                          }}
                        >
                          {lastBattle.winner?.name || "Unknown"}
                          {lastBattle.winner?.rareTrait && (
                            <span
                              style={{
                                display: "inline-block",
                                padding: "4px 12px",
                                borderRadius: "20px",
                                fontSize: "12px",
                                fontWeight: "bold",
                                background: "rgba(255, 255, 255, 0.3)",
                                backdropFilter: "blur(10px)",
                                color: "#fff",
                                textTransform: "capitalize",
                              }}
                            >
                              ✨ {lastBattle.winner.rareTrait.name}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: "16px", color: "#fff" }}>
                          Power: {calculatePower(lastBattle.winner || {})} | XP:{" "}
                          {lastBattle.winner?.xp || 0}
                        </div>
                        <div
                          style={{
                            fontSize: "14px",
                            color: "#fff",
                            marginTop: "8px",
                            padding: "8px",
                            background: "rgba(76, 175, 80, 0.3)",
                            borderRadius: "8px",
                          }}
                        >
                          ⬆️ +10 XP gained!
                        </div>
                        {lastBattle.loser && (
                          <div
                            style={{
                              fontSize: "12px",
                              color: "rgba(255, 255, 255, 0.8)",
                              marginTop: "8px",
                            }}
                          >
                            {lastBattle.loser.name} gained +2 XP (XP:{" "}
                            {lastBattle.loser.xp || 0})
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* GENE Leaderboard Section */}
                {geneLeaderboard.length > 0 && (
                  <div style={{ marginBottom: "40px" }}>
                    <h2
                      style={{
                        color: "#fff",
                        fontSize: "28px",
                        fontWeight: "700",
                        marginBottom: "20px",
                        textShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
                      }}
                    >
                      🧬 GENE Leaderboard (Top 10)
                    </h2>
                    <div
                      style={{
                        background: "rgba(255, 255, 255, 0.95)",
                        borderRadius: "16px",
                        padding: "20px",
                        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <ol
                        style={{
                          listStyle: "none",
                          padding: 0,
                          margin: 0,
                          counterReset: "geneLeaderboard",
                        }}
                      >
                        {geneLeaderboard.slice(0, 10).map((agent, index) => {
                          return (
                            <li
                              key={agent.id}
                              style={{
                                counterIncrement: "geneLeaderboard",
                                padding: "15px",
                                marginBottom: "10px",
                                background:
                                  index === 0
                                    ? "linear-gradient(135deg, #f6d365 0%, #fda085 100%)"
                                    : index === 1
                                    ? "linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%)"
                                    : index === 2
                                    ? "linear-gradient(135deg, #cd7f32 0%, #e6a857 100%)"
                                    : "rgba(0, 0, 0, 0.05)",
                                borderRadius: "12px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                border:
                                  index < 3
                                    ? "2px solid rgba(255, 255, 255, 0.5)"
                                    : "none",
                                transition: "all 0.2s ease",
                              }}
                              onMouseEnter={(e) => {
                                if (index >= 3) {
                                  e.currentTarget.style.background =
                                    "rgba(0, 0, 0, 0.08)";
                                  e.currentTarget.style.transform =
                                    "translateX(5px)";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (index >= 3) {
                                  e.currentTarget.style.background =
                                    "rgba(0, 0, 0, 0.05)";
                                  e.currentTarget.style.transform =
                                    "translateX(0)";
                                }
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "15px",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "24px",
                                    fontWeight: "bold",
                                    color: index < 3 ? "#fff" : "#333",
                                    minWidth: "30px",
                                  }}
                                >
                                  {index === 0
                                    ? "🥇"
                                    : index === 1
                                    ? "🥈"
                                    : index === 2
                                    ? "🥉"
                                    : `#${index + 1}`}
                                </span>
                                <div>
                                  <div
                                    style={{
                                      fontSize: "18px",
                                      fontWeight: "700",
                                      color: index < 3 ? "#fff" : "#333",
                                      marginBottom: "5px",
                                    }}
                                  >
                                    {agent.name}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "12px",
                                      color:
                                        index < 3
                                          ? "rgba(255,255,255,0.9)"
                                          : "#666",
                                    }}
                                  >
                                    Power: {calculatePower(agent)} | Energy:{" "}
                                    {agent.energy || 100}/100
                                  </div>
                                </div>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "flex-end",
                                  gap: "5px",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: "28px",
                                    fontWeight: "800",
                                    color: index < 3 ? "#fff" : "#333",
                                  }}
                                >
                                  {agent.gene || 0}
                                </div>
                                <div
                                  style={{
                                    fontSize: "11px",
                                    color:
                                      index < 3
                                        ? "rgba(255,255,255,0.8)"
                                        : "#666",
                                    textTransform: "uppercase",
                                  }}
                                >
                                  GENE
                                </div>
                                {(agent.gene || 0) >= 10 && (
                                  <div
                                    style={{
                                      fontSize: "10px",
                                      color: index < 3 ? "#fff" : "#4caf50",
                                      fontWeight: "bold",
                                      marginTop: "5px",
                                      padding: "2px 6px",
                                      background:
                                        index < 3
                                          ? "rgba(255,255,255,0.3)"
                                          : "rgba(76, 175, 80, 0.2)",
                                      borderRadius: "8px",
                                    }}
                                  >
                                    Reward Ready!
                                  </div>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                  </div>
                )}

                {/* Power Leaderboard Section */}
                {leaderboard.length > 0 && (
                  <div style={{ marginBottom: "40px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "20px",
                        flexWrap: "wrap",
                        gap: "15px",
                      }}
                    >
                      <h2
                        style={{
                          color: "#fff",
                          fontSize: "28px",
                          fontWeight: "700",
                          margin: 0,
                          textShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
                        }}
                      >
                        🏆 Real-Time Leaderboard (Top 10)
                      </h2>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "8px 16px",
                          background: "rgba(76, 175, 80, 0.2)",
                          borderRadius: "20px",
                          color: "#fff",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                        title="Updates every 5 seconds"
                      >
                        <span
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: "#4caf50",
                            animation: "pulse 2s infinite",
                          }}
                        />
                        Live Updates
                      </div>
                    </div>
                    <div
                      style={{
                        background: "rgba(255, 255, 255, 0.95)",
                        borderRadius: "16px",
                        padding: "20px",
                        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <ol
                        style={{
                          listStyle: "none",
                          padding: 0,
                          margin: 0,
                          counterReset: "leaderboard",
                        }}
                      >
                        {leaderboard.slice(0, 10).map((agent, index) => {
                          const tooltipText = `Full Stats:\nStrength: ${
                            agent.traits.strength
                          }\nSpeed: ${agent.traits.speed}\nIntelligence: ${
                            agent.traits.intelligence
                          }\nXP: ${agent.xp || 0}\nEnergy: ${
                            agent.energy || 100
                          }/100\nPower: ${agent.power}${
                            agent.rareTrait
                              ? `\nRare Trait: ${agent.rareTrait.name} (+${agent.rareTrait.powerBonus})`
                              : ""
                          }`;
                          return (
                            <li
                              key={agent.id}
                              title={tooltipText}
                              style={{
                                counterIncrement: "leaderboard",
                                padding: "15px",
                                marginBottom: "10px",
                                background:
                                  index === 0
                                    ? "linear-gradient(135deg, #f6d365 0%, #fda085 100%)"
                                    : index === 1
                                    ? "linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%)"
                                    : index === 2
                                    ? "linear-gradient(135deg, #cd7f32 0%, #e6a857 100%)"
                                    : "rgba(0, 0, 0, 0.05)",
                                borderRadius: "12px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                border:
                                  index < 3
                                    ? "2px solid rgba(255, 255, 255, 0.5)"
                                    : "none",
                                cursor: "help",
                                transition: "all 0.2s ease",
                              }}
                              onMouseEnter={(e) => {
                                if (index >= 3) {
                                  e.currentTarget.style.background =
                                    "rgba(0, 0, 0, 0.08)";
                                  e.currentTarget.style.transform =
                                    "translateX(5px)";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (index >= 3) {
                                  e.currentTarget.style.background =
                                    "rgba(0, 0, 0, 0.05)";
                                  e.currentTarget.style.transform =
                                    "translateX(0)";
                                }
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "15px",
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "24px",
                                    fontWeight: "bold",
                                    color: index < 3 ? "#fff" : "#333",
                                    minWidth: "30px",
                                  }}
                                >
                                  {index === 0
                                    ? "🥇"
                                    : index === 1
                                    ? "🥈"
                                    : index === 2
                                    ? "🥉"
                                    : `#${index + 1}`}
                                </span>
                                <div>
                                  <div
                                    style={{
                                      fontSize: "18px",
                                      fontWeight: "700",
                                      color: index < 3 ? "#fff" : "#333",
                                      marginBottom: "5px",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                      flexWrap: "wrap",
                                    }}
                                  >
                                    {agent.name}
                                    {agent.rareTrait && (
                                      <span
                                        style={{
                                          display: "inline-block",
                                          padding: "2px 8px",
                                          borderRadius: "12px",
                                          fontSize: "10px",
                                          fontWeight: "bold",
                                          background:
                                            index < 3
                                              ? "rgba(255, 255, 255, 0.3)"
                                              : "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
                                          color: "#fff",
                                          textTransform: "capitalize",
                                        }}
                                      >
                                        ✨ {agent.rareTrait.name}
                                      </span>
                                    )}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "12px",
                                      color:
                                        index < 3
                                          ? "rgba(255,255,255,0.9)"
                                          : "#666",
                                    }}
                                  >
                                    STR {agent.traits.strength} | SPD{" "}
                                    {agent.traits.speed} | INT{" "}
                                    {agent.traits.intelligence} | XP:{" "}
                                    {agent.xp || 0} | ⚡ {agent.energy || 100}
                                  </div>
                                </div>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "flex-end",
                                  gap: "5px",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: "24px",
                                    fontWeight: "800",
                                    color: index < 3 ? "#fff" : "#333",
                                  }}
                                >
                                  {agent.power}
                                </div>
                                <div
                                  style={{
                                    fontSize: "11px",
                                    color:
                                      index < 3
                                        ? "rgba(255,255,255,0.8)"
                                        : "#666",
                                    textTransform: "uppercase",
                                  }}
                                >
                                  Power
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                  </div>
                )}

                {/* Parent Agents Section */}
                <div style={{ marginBottom: "40px" }}>
                  <h2
                    style={{
                      color: "#fff",
                      fontSize: "28px",
                      fontWeight: "700",
                      marginBottom: "20px",
                      textShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    👥 Parent Agents (click to select 2)
                  </h2>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(280px, 1fr))",
                      gap: "20px",
                    }}
                  >
                    {agents.map((agent) => {
                      const isSelected = selectedParents.find(
                        (a) => a.id === agent.id
                      );
                      return (
                        <div
                          key={agent.id}
                          onClick={() => toggleParent(agent)}
                          style={{
                            background: isSelected
                              ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                              : !canBreed(agent)
                              ? "rgba(245, 87, 108, 0.1)"
                              : "rgba(255, 255, 255, 0.95)",
                            border: isSelected
                              ? "3px solid #fff"
                              : !canBreed(agent)
                              ? "2px solid rgba(245, 87, 108, 0.5)"
                              : "2px solid rgba(255, 255, 255, 0.3)",
                            borderRadius: "16px",
                            padding: "20px",
                            cursor: canBreed(agent) ? "pointer" : "not-allowed",
                            transition: "all 0.3s ease",
                            transform: isSelected ? "scale(1.05)" : "scale(1)",
                            boxShadow: isSelected
                              ? "0 10px 30px rgba(102, 126, 234, 0.4)"
                              : "0 4px 15px rgba(0, 0, 0, 0.1)",
                            opacity: !canBreed(agent) && !isSelected ? 0.7 : 1,
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.transform = "scale(1.02)";
                              e.currentTarget.style.boxShadow =
                                "0 6px 20px rgba(0, 0, 0, 0.15)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.transform = "scale(1)";
                              e.currentTarget.style.boxShadow =
                                "0 4px 15px rgba(0, 0, 0, 0.1)";
                            }
                          }}
                        >
                          <h3
                            style={{
                              margin: "0 0 15px 0",
                              fontSize: "22px",
                              fontWeight: "700",
                              color: isSelected ? "#fff" : "#333",
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              flexWrap: "wrap",
                            }}
                          >
                            {agent.name}
                            {agent.rareTrait && (
                              <span
                                style={{
                                  display: "inline-block",
                                  padding: "4px 12px",
                                  borderRadius: "20px",
                                  fontSize: "12px",
                                  fontWeight: "bold",
                                  background:
                                    "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
                                  color: "#fff",
                                  textTransform: "capitalize",
                                  boxShadow:
                                    "0 2px 8px rgba(246, 211, 101, 0.4)",
                                }}
                              >
                                ✨ {agent.rareTrait.name} (+
                                {agent.rareTrait.powerBonus})
                              </span>
                            )}
                          </h3>
                          <ul
                            style={{ listStyle: "none", padding: 0, margin: 0 }}
                          >
                            {Object.entries(agent.traits).map(
                              ([key, value]) => (
                                <li
                                  key={key}
                                  style={{
                                    padding: "8px 0",
                                    borderBottom:
                                      "1px solid rgba(0, 0, 0, 0.1)",
                                    color: isSelected ? "#fff" : "#666",
                                    fontSize: "14px",
                                  }}
                                >
                                  <strong
                                    style={{ textTransform: "capitalize" }}
                                  >
                                    {key}:
                                  </strong>{" "}
                                  {value}
                                </li>
                              )
                            )}
                            <li
                              style={{
                                padding: "8px 0",
                                marginTop: "8px",
                                borderTop: "2px solid rgba(0, 0, 0, 0.1)",
                                color: isSelected ? "#fff" : "#333",
                                fontSize: "16px",
                                fontWeight: "700",
                              }}
                            >
                              ⚡ Power: {calculatePower(agent)}
                            </li>
                            <li
                              style={{
                                padding: "8px 0",
                                color: isSelected ? "#fff" : "#666",
                                fontSize: "14px",
                              }}
                            >
                              ⭐ XP: {agent.xp || 0}
                            </li>
                            <li
                              style={{
                                padding: "8px 0",
                                color: isSelected ? "#fff" : "#666",
                                fontSize: "14px",
                              }}
                            >
                              ⚡ Energy: {agent.energy || 100}/100
                              {!canBreed(agent) && (
                                <span
                                  style={{
                                    marginLeft: "8px",
                                    padding: "2px 6px",
                                    borderRadius: "8px",
                                    fontSize: "11px",
                                    background: "rgba(245, 87, 108, 0.2)",
                                    color: isSelected ? "#fff" : "#f5576c",
                                    fontWeight: "bold",
                                  }}
                                >
                                  Low Energy
                                </span>
                              )}
                            </li>
                            <li
                              style={{
                                padding: "8px 0",
                                marginTop: "4px",
                                color: isSelected ? "#fff" : "#333",
                                fontSize: "15px",
                                fontWeight: "700",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              🧬 GENE: {agent.gene || 0}
                              {(agent.gene || 0) >= 10 && (
                                <span
                                  style={{
                                    padding: "2px 8px",
                                    borderRadius: "8px",
                                    fontSize: "10px",
                                    background: "rgba(76, 175, 80, 0.3)",
                                    color: isSelected ? "#fff" : "#4caf50",
                                    fontWeight: "bold",
                                  }}
                                >
                                  Reward Ready!
                                </span>
                              )}
                            </li>
                          </ul>
                          {isSelected && (
                            <div
                              style={{
                                marginTop: "15px",
                                padding: "8px",
                                background: "rgba(255, 255, 255, 0.2)",
                                borderRadius: "8px",
                                textAlign: "center",
                                color: "#fff",
                                fontWeight: "bold",
                                fontSize: "12px",
                              }}
                            >
                              ✓ Selected
                            </div>
                          )}
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "10px",
                              marginTop: "15px",
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Buy Energy Button */}
                            {agent.energy < 100 && (
                              <button
                                onClick={() => purchaseEnergy(agent, 20)}
                                style={{
                                  width: "100%",
                                  padding: "10px",
                                  fontSize: "13px",
                                  fontWeight: "600",
                                  color: "#fff",
                                  background:
                                    "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
                                  border: "none",
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                  boxShadow:
                                    "0 2px 8px rgba(246, 211, 101, 0.3)",
                                  transition: "all 0.2s ease",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform =
                                    "translateY(-1px)";
                                  e.currentTarget.style.boxShadow =
                                    "0 4px 12px rgba(246, 211, 101, 0.4)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform =
                                    "translateY(0)";
                                  e.currentTarget.style.boxShadow =
                                    "0 2px 8px rgba(246, 211, 101, 0.3)";
                                }}
                              >
                                ⚡ Buy Energy (+20) - 10 coins
                              </button>
                            )}
                            <div
                              style={{
                                display: "flex",
                                gap: "10px",
                              }}
                            >
                              <button
                                onClick={() => updateAgent(agent.id)}
                                style={{
                                  flex: 1,
                                  padding: "8px 12px",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  color: "#fff",
                                  background:
                                    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                                  border: "none",
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                  boxShadow:
                                    "0 2px 8px rgba(79, 172, 254, 0.3)",
                                  transition: "all 0.2s ease",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform =
                                    "translateY(-1px)";
                                  e.currentTarget.style.boxShadow =
                                    "0 4px 12px rgba(79, 172, 254, 0.4)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform =
                                    "translateY(0)";
                                  e.currentTarget.style.boxShadow =
                                    "0 2px 8px rgba(79, 172, 254, 0.3)";
                                }}
                              >
                                ✏️ +1 STR
                              </button>
                              <button
                                onClick={() => deleteAgent(agent.id)}
                                style={{
                                  flex: 1,
                                  padding: "8px 12px",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  color: "#fff",
                                  background:
                                    "linear-gradient(135deg, #f5576c 0%, #f093fb 100%)",
                                  border: "none",
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                  boxShadow:
                                    "0 2px 8px rgba(245, 87, 108, 0.3)",
                                  transition: "all 0.2s ease",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform =
                                    "translateY(-1px)";
                                  e.currentTarget.style.boxShadow =
                                    "0 4px 12px rgba(245, 87, 108, 0.4)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform =
                                    "translateY(0)";
                                  e.currentTarget.style.boxShadow =
                                    "0 2px 8px rgba(245, 87, 108, 0.3)";
                                }}
                              >
                                ❌ Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Agent Selector */}
                <AgentSelector
                  agents={agents}
                  selectedParents={selectedParents}
                  setSelectedParents={setSelectedParents}
                />

                {/* Breed Button */}
                <div style={{ textAlign: "center", marginBottom: "40px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "15px",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      onClick={() => handleBreed()}
                      disabled={autoBreeding}
                      style={{
                        padding: "16px 40px",
                        fontSize: "18px",
                        fontWeight: "700",
                        color: "#fff",
                        background: autoBreeding
                          ? "rgba(255, 255, 255, 0.3)"
                          : "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                        border: "none",
                        borderRadius: "50px",
                        cursor: autoBreeding ? "not-allowed" : "pointer",
                        boxShadow: "0 6px 20px rgba(245, 87, 108, 0.4)",
                        transition: "all 0.3s ease",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        opacity: autoBreeding ? 0.6 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!autoBreeding) {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow =
                            "0 8px 25px rgba(245, 87, 108, 0.5)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!autoBreeding) {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow =
                            "0 6px 20px rgba(245, 87, 108, 0.4)";
                        }
                      }}
                    >
                      🧬 Breed Selected Parents
                    </button>
                    <button
                      onClick={startAutoBreed}
                      disabled={autoBreeding}
                      style={{
                        padding: "16px 40px",
                        fontSize: "18px",
                        fontWeight: "700",
                        color: "#fff",
                        background: autoBreeding
                          ? "rgba(255, 255, 255, 0.3)"
                          : "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                        border: "none",
                        borderRadius: "50px",
                        cursor: autoBreeding ? "not-allowed" : "pointer",
                        boxShadow: "0 6px 20px rgba(79, 172, 254, 0.4)",
                        transition: "all 0.3s ease",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        opacity: autoBreeding ? 0.6 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!autoBreeding) {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow =
                            "0 8px 25px rgba(79, 172, 254, 0.5)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!autoBreeding) {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow =
                            "0 6px 20px rgba(79, 172, 254, 0.4)";
                        }
                      }}
                    >
                      ⚡ Start Auto Breed
                    </button>
                    <button
                      onClick={stopAutoBreed}
                      disabled={!autoBreeding}
                      style={{
                        padding: "16px 40px",
                        fontSize: "18px",
                        fontWeight: "700",
                        color: "#fff",
                        background: !autoBreeding
                          ? "rgba(255, 255, 255, 0.3)"
                          : "linear-gradient(135deg, #f5576c 0%, #f093fb 100%)",
                        border: "none",
                        borderRadius: "50px",
                        cursor: !autoBreeding ? "not-allowed" : "pointer",
                        boxShadow: "0 6px 20px rgba(245, 87, 108, 0.4)",
                        transition: "all 0.3s ease",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        opacity: !autoBreeding ? 0.6 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (autoBreeding) {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow =
                            "0 8px 25px rgba(245, 87, 108, 0.5)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (autoBreeding) {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow =
                            "0 6px 20px rgba(245, 87, 108, 0.4)";
                        }
                      }}
                    >
                      🛑 Stop Auto Breed
                    </button>
                  </div>
                  {autoBreeding && (
                    <div
                      style={{
                        marginTop: "20px",
                        padding: "12px 24px",
                        background: "rgba(76, 175, 80, 0.2)",
                        borderRadius: "50px",
                        color: "#fff",
                        fontSize: "16px",
                        fontWeight: "600",
                        display: "inline-block",
                      }}
                    >
                      ⚡ Auto-breeding active - Generating offspring every
                      second...
                    </div>
                  )}
                </div>

                {/* Battle Buttons */}
                <div
                  style={{
                    textAlign: "center",
                    marginTop: "20px",
                    marginBottom: "40px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "15px",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      onClick={() => handleBattle()}
                      disabled={autoBattling}
                      style={{
                        padding: "16px 40px",
                        fontSize: "18px",
                        fontWeight: "700",
                        color: "#fff",
                        background: autoBattling
                          ? "rgba(255, 255, 255, 0.3)"
                          : "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                        border: "none",
                        borderRadius: "50px",
                        cursor: autoBattling ? "not-allowed" : "pointer",
                        boxShadow: "0 6px 20px rgba(245, 87, 108, 0.4)",
                        transition: "all 0.3s ease",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        opacity: autoBattling ? 0.6 : 1,
                      }}
                    >
                      ⚔️ Battle Selected Parents
                    </button>

                    <button
                      onClick={handleRandomBattle}
                      disabled={autoBattling}
                      style={{
                        padding: "16px 40px",
                        fontSize: "18px",
                        fontWeight: "700",
                        color: "#fff",
                        background: autoBattling
                          ? "rgba(255, 255, 255, 0.3)"
                          : "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                        border: "none",
                        borderRadius: "50px",
                        cursor: autoBattling ? "not-allowed" : "pointer",
                        boxShadow: "0 6px 20px rgba(79, 172, 254, 0.4)",
                        transition: "all 0.3s ease",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                        opacity: autoBattling ? 0.6 : 1,
                      }}
                    >
                      🎲 Random Battle
                    </button>

                    {autoBattling ? (
                      <button
                        onClick={stopAutoBattle}
                        style={{
                          padding: "16px 40px",
                          fontSize: "18px",
                          fontWeight: "700",
                          color: "#fff",
                          background:
                            "linear-gradient(135deg, #f5576c 0%, #f093fb 100%)",
                          border: "none",
                          borderRadius: "50px",
                          cursor: "pointer",
                          boxShadow: "0 6px 20px rgba(245, 87, 108, 0.4)",
                          transition: "all 0.3s ease",
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                        }}
                      >
                        🛑 Stop Auto Battle
                      </button>
                    ) : (
                      <button
                        onClick={startAutoBattle}
                        disabled={autoBreeding}
                        style={{
                          padding: "16px 40px",
                          fontSize: "18px",
                          fontWeight: "700",
                          color: "#fff",
                          background: autoBreeding
                            ? "rgba(255, 255, 255, 0.3)"
                            : "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                          border: "none",
                          borderRadius: "50px",
                          cursor: autoBreeding ? "not-allowed" : "pointer",
                          boxShadow: "0 6px 20px rgba(79, 172, 254, 0.4)",
                          transition: "all 0.3s ease",
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          opacity: autoBreeding ? 0.6 : 1,
                        }}
                      >
                        🔁 Start Auto Battle
                      </button>
                    )}
                  </div>
                  {autoBattling && (
                    <div
                      style={{
                        marginTop: "20px",
                        padding: "12px 24px",
                        background: "rgba(245, 87, 108, 0.2)",
                        borderRadius: "50px",
                        color: "#fff",
                        fontSize: "16px",
                        fontWeight: "600",
                        display: "inline-block",
                      }}
                    >
                      ⚔️ Auto-battling active - Fighting every 2 seconds...
                    </div>
                  )}
                </div>

                {/* Battle Arena */}
                <BattleArena lastBattle={lastBattle} />

                {/* Offspring List Component */}
                <OffspringList offspring={offspringList} />

                {/* Offspring Section */}
                {offspringList.length > 0 && (
                  <div style={{ marginBottom: "40px" }}>
                    <h2
                      style={{
                        color: "#fff",
                        fontSize: "28px",
                        fontWeight: "700",
                        marginBottom: "20px",
                        textShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
                      }}
                    >
                      🌱 Offspring ({offspringList.length})
                    </h2>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(300px, 1fr))",
                        gap: "20px",
                      }}
                    >
                      {offspringList.map((agent) => {
                        const isMinted = mintedNFTs.find(
                          (nft) => nft.id === agent.id
                        );
                        const rarityColors = getRarityColor(agent.rarity);
                        return (
                          <div
                            key={agent.id}
                            style={{
                              background: isMinted
                                ? "linear-gradient(135deg, #f6d365 0%, #fda085 100%)"
                                : "rgba(255, 255, 255, 0.95)",
                              border: isMinted
                                ? "3px solid #fda085"
                                : `2px solid ${rarityColors.border}`,
                              borderRadius: "16px",
                              padding: "20px",
                              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                              position: "relative",
                              overflow: "hidden",
                            }}
                          >
                            {isMinted && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: "10px",
                                  right: "10px",
                                  background:
                                    "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
                                  color: "#fff",
                                  padding: "4px 12px",
                                  borderRadius: "20px",
                                  fontSize: "11px",
                                  fontWeight: "bold",
                                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                                }}
                              >
                                🎨 MINTED
                              </div>
                            )}
                            <h3
                              style={{
                                margin: "0 0 10px 0",
                                fontSize: "20px",
                                fontWeight: "700",
                                color: "#333",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                flexWrap: "wrap",
                              }}
                            >
                              {agent.name}
                              {agent.rareTrait && (
                                <span
                                  style={{
                                    display: "inline-block",
                                    padding: "4px 12px",
                                    borderRadius: "20px",
                                    fontSize: "11px",
                                    fontWeight: "bold",
                                    background:
                                      "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
                                    color: "#fff",
                                    textTransform: "capitalize",
                                    boxShadow:
                                      "0 2px 8px rgba(246, 211, 101, 0.4)",
                                  }}
                                >
                                  ✨ {agent.rareTrait.name} (+
                                  {agent.rareTrait.powerBonus})
                                </span>
                              )}
                            </h3>
                            <div style={{ marginBottom: "15px" }}>
                              {getRarityBadge(agent.rarity)}
                              {agent.rarityPercent && (
                                <span
                                  style={{
                                    display: "inline-block",
                                    marginLeft: "10px",
                                    padding: "4px 12px",
                                    borderRadius: "20px",
                                    fontSize: "14px",
                                    fontWeight: "bold",
                                    background: "rgba(0, 0, 0, 0.1)",
                                    color: "#333",
                                  }}
                                >
                                  {agent.rarityPercent.toFixed(2)}%
                                </span>
                              )}
                            </div>
                            <ul
                              style={{
                                listStyle: "none",
                                padding: 0,
                                margin: "0 0 15px 0",
                              }}
                            >
                              {Object.entries(agent.traits).map(
                                ([key, value]) => (
                                  <li
                                    key={key}
                                    style={{
                                      padding: "6px 0",
                                      borderBottom:
                                        "1px solid rgba(0, 0, 0, 0.1)",
                                      color: "#666",
                                      fontSize: "14px",
                                    }}
                                  >
                                    <strong
                                      style={{ textTransform: "capitalize" }}
                                    >
                                      {key}:
                                    </strong>{" "}
                                    {value}
                                  </li>
                                )
                              )}
                              <li
                                style={{
                                  padding: "8px 0",
                                  marginTop: "8px",
                                  borderTop: "2px solid rgba(0, 0, 0, 0.1)",
                                  color: "#333",
                                  fontSize: "16px",
                                  fontWeight: "700",
                                }}
                              >
                                ⚡ Power: {agent.power || calculatePower(agent)}
                              </li>
                              <li
                                style={{
                                  padding: "6px 0",
                                  color: "#666",
                                  fontSize: "14px",
                                }}
                              >
                                ⭐ XP: {agent.xp || 0}
                              </li>
                              <li
                                style={{
                                  padding: "6px 0",
                                  color: "#666",
                                  fontSize: "14px",
                                }}
                              >
                                ⚡ Energy: {agent.energy || 100}/100
                                {!canBreed(agent) && (
                                  <span
                                    style={{
                                      marginLeft: "8px",
                                      padding: "2px 6px",
                                      borderRadius: "8px",
                                      fontSize: "11px",
                                      background: "rgba(245, 87, 108, 0.2)",
                                      color: "#f5576c",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    Low Energy
                                  </span>
                                )}
                              </li>
                              <li
                                style={{
                                  padding: "8px 0",
                                  marginTop: "4px",
                                  color: "#333",
                                  fontSize: "15px",
                                  fontWeight: "700",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
                                🧬 GENE: {agent.gene || 0}
                                {(agent.gene || 0) >= 10 && (
                                  <span
                                    style={{
                                      padding: "2px 8px",
                                      borderRadius: "8px",
                                      fontSize: "10px",
                                      background: "rgba(76, 175, 80, 0.3)",
                                      color: "#4caf50",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    Reward Ready!
                                  </span>
                                )}
                              </li>
                            </ul>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "10px",
                                marginTop: "15px",
                              }}
                            >
                              {/* Enhanced NFT Minting for Rare Traits */}
                              {!isMinted && agent.rareTrait && (
                                <button
                                  onClick={() => mintNFT(agent)}
                                  style={{
                                    width: "100%",
                                    padding: "14px",
                                    fontSize: "15px",
                                    fontWeight: "700",
                                    color: "#fff",
                                    background:
                                      "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
                                    border: "3px solid #fda085",
                                    borderRadius: "12px",
                                    cursor: "pointer",
                                    boxShadow:
                                      "0 6px 20px rgba(246, 211, 101, 0.5)",
                                    transition: "all 0.3s ease",
                                    textTransform: "uppercase",
                                    letterSpacing: "1px",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform =
                                      "translateY(-3px) scale(1.02)";
                                    e.currentTarget.style.boxShadow =
                                      "0 8px 25px rgba(246, 211, 101, 0.6)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform =
                                      "translateY(0) scale(1)";
                                    e.currentTarget.style.boxShadow =
                                      "0 6px 20px rgba(246, 211, 101, 0.5)";
                                  }}
                                >
                                  ✨ Mint Rare NFT (
                                  {agent.rarity === "rare" ? 20 : 10} coins)
                                </button>
                              )}
                              {/* Regular NFT Minting */}
                              {!isMinted && !agent.rareTrait && (
                                <button
                                  onClick={() => mintNFT(agent)}
                                  style={{
                                    width: "100%",
                                    padding: "12px",
                                    fontSize: "14px",
                                    fontWeight: "600",
                                    color: "#fff",
                                    background: rarityColors.bg,
                                    border: "none",
                                    borderRadius: "10px",
                                    cursor: "pointer",
                                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
                                    transition: "all 0.3s ease",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform =
                                      "translateY(-2px)";
                                    e.currentTarget.style.boxShadow =
                                      "0 6px 20px rgba(0, 0, 0, 0.3)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform =
                                      "translateY(0)";
                                    e.currentTarget.style.boxShadow =
                                      "0 4px 15px rgba(0, 0, 0, 0.2)";
                                  }}
                                >
                                  🎨 Mint NFT (
                                  {agent.rarity === "rare"
                                    ? 20
                                    : agent.rarity === "uncommon"
                                    ? 10
                                    : 5}{" "}
                                  coins)
                                </button>
                              )}
                              {/* Buy Energy for Offspring */}
                              {agent.energy < 100 && (
                                <button
                                  onClick={() => purchaseEnergy(agent, 20)}
                                  style={{
                                    width: "100%",
                                    padding: "10px",
                                    fontSize: "13px",
                                    fontWeight: "600",
                                    color: "#fff",
                                    background:
                                      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                                    border: "none",
                                    borderRadius: "10px",
                                    cursor: "pointer",
                                    boxShadow:
                                      "0 2px 8px rgba(79, 172, 254, 0.3)",
                                    transition: "all 0.2s ease",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform =
                                      "translateY(-1px)";
                                    e.currentTarget.style.boxShadow =
                                      "0 4px 12px rgba(79, 172, 254, 0.4)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform =
                                      "translateY(0)";
                                    e.currentTarget.style.boxShadow =
                                      "0 2px 8px rgba(79, 172, 254, 0.3)";
                                  }}
                                >
                                  ⚡ Buy Energy (+20) - 10 coins
                                </button>
                              )}
                              <div
                                style={{
                                  display: "flex",
                                  gap: "10px",
                                }}
                              >
                                <button
                                  onClick={() => updateAgent(agent.id)}
                                  style={{
                                    padding: "12px 16px",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    color: "#fff",
                                    background:
                                      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                                    border: "none",
                                    borderRadius: "10px",
                                    cursor: "pointer",
                                    boxShadow:
                                      "0 2px 8px rgba(79, 172, 254, 0.3)",
                                    transition: "all 0.2s ease",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform =
                                      "translateY(-1px)";
                                    e.currentTarget.style.boxShadow =
                                      "0 4px 12px rgba(79, 172, 254, 0.4)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform =
                                      "translateY(0)";
                                    e.currentTarget.style.boxShadow =
                                      "0 2px 8px rgba(79, 172, 254, 0.3)";
                                  }}
                                >
                                  ✏️ +1 STR
                                </button>
                                <button
                                  onClick={() => deleteAgent(agent.id)}
                                  style={{
                                    padding: "12px 16px",
                                    fontSize: "12px",
                                    fontWeight: "600",
                                    color: "#fff",
                                    background:
                                      "linear-gradient(135deg, #f5576c 0%, #f093fb 100%)",
                                    border: "none",
                                    borderRadius: "10px",
                                    cursor: "pointer",
                                    boxShadow:
                                      "0 2px 8px rgba(245, 87, 108, 0.3)",
                                    transition: "all 0.2s ease",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform =
                                      "translateY(-1px)";
                                    e.currentTarget.style.boxShadow =
                                      "0 4px 12px rgba(245, 87, 108, 0.4)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform =
                                      "translateY(0)";
                                    e.currentTarget.style.boxShadow =
                                      "0 2px 8px rgba(245, 87, 108, 0.3)";
                                  }}
                                >
                                  ❌
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Minted NFTs Section */}
                {mintedNFTs.length > 0 && (
                  <div>
                    <h2
                      style={{
                        color: "#fff",
                        fontSize: "28px",
                        fontWeight: "700",
                        marginBottom: "20px",
                        textShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
                      }}
                    >
                      🎨 Minted NFTs ({mintedNFTs.length})
                    </h2>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(300px, 1fr))",
                        gap: "20px",
                      }}
                    >
                      {mintedNFTs.map((agent) => {
                        return (
                          <div
                            key={agent.id}
                            style={{
                              background:
                                "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
                              border: "3px solid #fda085",
                              borderRadius: "16px",
                              padding: "20px",
                              boxShadow: "0 8px 25px rgba(246, 211, 101, 0.4)",
                              position: "relative",
                            }}
                          >
                            <div
                              style={{
                                position: "absolute",
                                top: "10px",
                                right: "10px",
                                background: "rgba(255, 255, 255, 0.3)",
                                backdropFilter: "blur(10px)",
                                padding: "6px 14px",
                                borderRadius: "20px",
                                fontSize: "11px",
                                fontWeight: "bold",
                                color: "#fff",
                                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                              }}
                            >
                              🎨 NFT
                            </div>
                            <h3
                              style={{
                                margin: "0 0 10px 0",
                                fontSize: "20px",
                                fontWeight: "700",
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                flexWrap: "wrap",
                              }}
                            >
                              {agent.name}
                              {agent.rareTrait && (
                                <span
                                  style={{
                                    display: "inline-block",
                                    padding: "4px 12px",
                                    borderRadius: "20px",
                                    fontSize: "11px",
                                    fontWeight: "bold",
                                    background: "rgba(255, 255, 255, 0.3)",
                                    backdropFilter: "blur(10px)",
                                    color: "#fff",
                                    textTransform: "capitalize",
                                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                                  }}
                                >
                                  ✨ {agent.rareTrait.name} (+
                                  {agent.rareTrait.powerBonus})
                                </span>
                              )}
                            </h3>
                            <div style={{ marginBottom: "15px" }}>
                              {getRarityBadge(agent.rarity)}
                              {agent.rarityPercent && (
                                <span
                                  style={{
                                    display: "inline-block",
                                    marginLeft: "10px",
                                    padding: "4px 12px",
                                    borderRadius: "20px",
                                    fontSize: "14px",
                                    fontWeight: "bold",
                                    background: "rgba(255, 255, 255, 0.2)",
                                    color: "#fff",
                                  }}
                                >
                                  {agent.rarityPercent.toFixed(2)}%
                                </span>
                              )}
                            </div>
                            <ul
                              style={{
                                listStyle: "none",
                                padding: 0,
                                margin: 0,
                              }}
                            >
                              {Object.entries(agent.traits).map(
                                ([key, value]) => (
                                  <li
                                    key={key}
                                    style={{
                                      padding: "6px 0",
                                      borderBottom:
                                        "1px solid rgba(255, 255, 255, 0.3)",
                                      color: "#fff",
                                      fontSize: "14px",
                                    }}
                                  >
                                    <strong
                                      style={{ textTransform: "capitalize" }}
                                    >
                                      {key}:
                                    </strong>{" "}
                                    {value}
                                  </li>
                                )
                              )}
                              <li
                                style={{
                                  padding: "8px 0",
                                  marginTop: "8px",
                                  borderTop:
                                    "2px solid rgba(255, 255, 255, 0.3)",
                                  color: "#fff",
                                  fontSize: "16px",
                                  fontWeight: "700",
                                }}
                              >
                                ⚡ Power: {agent.power || calculatePower(agent)}
                              </li>
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Mint History Section */}
                <div style={{ marginTop: "40px" }}>
                  <h2
                    style={{
                      color: "#fff",
                      fontSize: "28px",
                      fontWeight: "700",
                      marginBottom: "20px",
                      textShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    📜 Mint History
                  </h2>
                  {history.length === 0 ? (
                    <div
                      style={{
                        padding: "40px",
                        textAlign: "center",
                        background: "rgba(255, 255, 255, 0.1)",
                        backdropFilter: "blur(10px)",
                        borderRadius: "16px",
                        color: "#fff",
                        fontSize: "18px",
                      }}
                    >
                      No mints yet. Start breeding to see history!
                    </div>
                  ) : (
                    <div
                      style={{
                        background: "rgba(255, 255, 255, 0.95)",
                        borderRadius: "16px",
                        padding: "20px",
                        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                        maxHeight: "600px",
                        overflowY: "auto",
                      }}
                    >
                      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                        {history.map((h, i) => (
                          <li
                            key={i}
                            style={{
                              padding: "15px 0",
                              borderBottom:
                                i < history.length - 1
                                  ? "1px solid rgba(0, 0, 0, 0.1)"
                                  : "none",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                marginBottom: "8px",
                                flexWrap: "wrap",
                              }}
                            >
                              <strong
                                style={{ color: "#333", fontSize: "16px" }}
                              >
                                ID: {h.offspringId}
                              </strong>
                              <span
                                style={{
                                  padding: "4px 10px",
                                  borderRadius: "12px",
                                  fontSize: "11px",
                                  fontWeight: "bold",
                                  textTransform: "uppercase",
                                  background:
                                    h.rarity === "rare"
                                      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                      : h.rarity === "uncommon"
                                      ? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                                      : "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                                  color: "#fff",
                                }}
                              >
                                {h.rarity}
                              </span>
                              {h.rarityPercent && (
                                <span
                                  style={{
                                    padding: "4px 10px",
                                    borderRadius: "12px",
                                    fontSize: "12px",
                                    fontWeight: "bold",
                                    background: "rgba(0, 0, 0, 0.1)",
                                    color: "#333",
                                  }}
                                >
                                  {h.rarityPercent.toFixed(2)}%
                                </span>
                              )}
                              <span style={{ color: "#666", fontSize: "14px" }}>
                                {new Date(h.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <div
                              style={{
                                color: "#666",
                                fontSize: "14px",
                                marginBottom: "5px",
                              }}
                            >
                              👤 Wallet:{" "}
                              <code
                                style={{
                                  background: "rgba(0, 0, 0, 0.05)",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  fontFamily: "monospace",
                                }}
                              >
                                {h.wallet === "no-wallet"
                                  ? "No wallet connected"
                                  : `${h.wallet.slice(0, 6)}...${h.wallet.slice(
                                      -4
                                    )}`}
                              </code>
                            </div>
                            <div
                              style={{
                                color: "#666",
                                fontSize: "14px",
                                marginBottom: "5px",
                              }}
                            >
                              👨‍👩‍👧 Parents: <strong>{h.agentA}</strong> +{" "}
                              <strong>{h.agentB}</strong>
                            </div>
                            <div style={{ color: "#666", fontSize: "14px" }}>
                              🔗 TX:{" "}
                              <code
                                style={{
                                  background: "rgba(0, 0, 0, 0.05)",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  fontFamily: "monospace",
                                  fontSize: "12px",
                                }}
                              >
                                {h.tx.slice(0, 12)}...
                              </code>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          }
        />
      </Routes>
    </>
  );
}

export default App;
