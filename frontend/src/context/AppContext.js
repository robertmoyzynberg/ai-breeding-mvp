import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getAgents, getBalance } from "../api/backend";

const AppContext = createContext();

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}

export function AppProvider({ children }) {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [coins, setCoins] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(true);

  const refreshAgents = useCallback(async () => {
    try {
      const data = await getAgents();
      setAgents(data || []);
      setLastUpdate(new Date());
      return data;
    } catch (error) {
      console.error("[AppContext] Error refreshing agents:", error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshAgents();
  }, [refreshAgents]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshAgents();
    }, 5000);

    return () => clearInterval(interval);
  }, [refreshAgents]);

  const updateAgent = useCallback((updatedAgent) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === updatedAgent.id ? updatedAgent : a))
    );
  }, []);

  const addAgent = useCallback((newAgent) => {
    setAgents((prev) => [...prev, newAgent]);
  }, []);

  const removeAgent = useCallback((agentId) => {
    setAgents((prev) => prev.filter((a) => a.id !== agentId));
  }, []);

  // Coins/Balance management
  const refreshBalance = useCallback(async () => {
    try {
      const username = localStorage.getItem("username");
      if (!username) {
        // Fallback to localStorage if no username
        const savedCoins = localStorage.getItem("coins");
        setCoins(savedCoins ? parseInt(savedCoins) : 0);
        setBalanceLoading(false);
        return;
      }

      const data = await getBalance(username);
      const newBalance = data.coins || 0;
      setCoins(newBalance);
      localStorage.setItem("coins", newBalance.toString());
    } catch (error) {
      console.error("[AppContext] Error refreshing balance:", error);
      // Fallback to localStorage
      const savedCoins = localStorage.getItem("coins");
      setCoins(savedCoins ? parseInt(savedCoins) : 0);
    } finally {
      setBalanceLoading(false);
    }
  }, []);

  const updateCoins = useCallback((newAmount) => {
    setCoins(newAmount);
    localStorage.setItem("coins", newAmount.toString());
  }, []);

  const addCoins = useCallback((amount) => {
    setCoins((prev) => {
      const newAmount = prev + amount;
      localStorage.setItem("coins", newAmount.toString());
      return newAmount;
    });
  }, []);

  const deductCoins = useCallback((amount) => {
    setCoins((prev) => {
      const newAmount = Math.max(0, prev - amount);
      localStorage.setItem("coins", newAmount.toString());
      return newAmount;
    });
  }, []);

  // Initial balance load
  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  // Auto-refresh balance every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshBalance();
    }, 10000);

    return () => clearInterval(interval);
  }, [refreshBalance]);

  const value = {
    agents,
    loading,
    lastUpdate,
    refreshAgents,
    updateAgent,
    addAgent,
    removeAgent,
    coins,
    balanceLoading,
    refreshBalance,
    updateCoins,
    addCoins,
    deductCoins,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

