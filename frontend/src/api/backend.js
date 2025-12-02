// Centralized Backend API Client
// All backend API calls should go through this module

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

// Helper function for making API requests
async function apiRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === "object") {
    config.body = JSON.stringify(config.body);
  }

  try {
    // Only log important requests (not health checks)
    if (!endpoint.includes('/health')) {
      console.log(`[API] ${config.method || "GET"} ${endpoint}`);
    }
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      console.error(`[API] Error ${response.status}:`, data);
      throw new Error(data.error || `API request failed: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error(`[API] Request failed:`, error);
    throw error;
  }
}

// ============================================
// AGENTS API
// ============================================

/**
 * Get all agents
 * @returns {Promise<Array>} Array of agent objects
 */
export async function getAgents() {
  return apiRequest("/agents");
}

/**
 * Get a single agent by ID
 * @param {number} id - Agent ID
 * @returns {Promise<Object>} Agent object
 */
export async function getAgent(id) {
  return apiRequest(`/agents/${id}`);
}

/**
 * Create a new agent
 * @param {Object} agent - Agent data
 * @returns {Promise<Object>} Created agent object
 */
export async function createAgent(agent) {
  return apiRequest("/agents", {
    method: "POST",
    body: agent,
  });
}

/**
 * Update an agent
 * @param {number} id - Agent ID
 * @param {Object} updates - Agent data to update
 * @returns {Promise<Object>} Updated agent object
 */
export async function updateAgent(id, updates) {
  return apiRequest(`/agents/${id}`, {
    method: "PUT",
    body: updates,
  });
}

/**
 * Delete an agent
 * @param {number} id - Agent ID
 * @returns {Promise<void>}
 */
export async function deleteAgent(id) {
  return apiRequest(`/agents/${id}`, {
    method: "DELETE",
  });
}

// ============================================
// BATTLE API
// ============================================

/**
 * Battle two agents
 * @param {number} agentA - First agent ID
 * @param {number} agentB - Second agent ID
 * @returns {Promise<Object>} Battle result with winner and loser
 */
export async function battleAgents(agentA, agentB) {
  return apiRequest("/api/battle", {
    method: "POST",
    body: {
      agentA,
      agentB,
    },
  });
}

// ============================================
// BREEDING API
// ============================================

/**
 * Breed two agents
 * @param {number} parent1Id - First parent agent ID
 * @param {number} parent2Id - Second parent agent ID
 * @returns {Promise<Object>} Baby agent object
 */
export async function breedAgents(parent1Id, parent2Id) {
  return apiRequest("/api/breed", {
    method: "POST",
    body: {
      parent1Id,
      parent2Id,
    },
  });
}

// ============================================
// CHAT API
// ============================================

/**
 * Get chat history for an agent
 * @param {number} agentId - Agent ID
 * @returns {Promise<Array>} Array of chat messages
 */
export async function getChatHistory(agentId) {
  return apiRequest(`/api/chat/${agentId}`);
}

/**
 * Send a chat message to an agent
 * @param {number} agentId - Agent ID
 * @param {string} message - Message text
 * @returns {Promise<Object>} AI response object
 */
export async function sendChatMessage(agentId, message) {
  return apiRequest("/api/chat", {
    method: "POST",
    body: {
      agentId,
      message,
    },
  });
}

// ============================================
// HEALTH CHECK API
// ============================================

/**
 * Check if backend is online
 * @returns {Promise<Object>} Health status
 */
export async function checkHealth() {
  return apiRequest("/api/health");
}

// ============================================
// PAYMENT API
// ============================================

/**
 * Create a Stripe checkout session
 * @param {Object} paymentData - Payment data {userId, amount, currency}
 * @returns {Promise<Object>} Checkout session object with url and sessionId
 */
export async function createCheckoutSession(paymentData) {
  return apiRequest("/api/payment/create-checkout-session", {
    method: "POST",
    body: paymentData,
  });
}

/**
 * Verify payment success
 * @param {string} sessionId - Stripe session ID
 * @returns {Promise<Object>} Payment verification result
 */
export async function verifyPaymentSuccess(sessionId) {
  return apiRequest(`/api/payment/success?session_id=${sessionId}`);
}

/**
 * Create a payment intent (legacy, kept for backward compatibility)
 * @param {Object} paymentData - Payment data (userId, amount, currency, paymentMethod)
 * @returns {Promise<Object>} Payment intent object
 */
export async function createPaymentIntent(paymentData) {
  return apiRequest("/api/payment/create", {
    method: "POST",
    body: paymentData,
  });
}

/**
 * Confirm a payment and add coins
 * @param {Object} confirmationData - Confirmation data (paymentId, transactionId, userId, coins)
 * @returns {Promise<Object>} Confirmation result with new balance
 */
export async function confirmPayment(confirmationData) {
  return apiRequest("/api/payment/confirm", {
    method: "POST",
    body: confirmationData,
  });
}

/**
 * Get user's coin balance
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Balance object with coins
 */
export async function getBalance(userId) {
  return apiRequest(`/api/payment/balance/${userId}`);
}

/**
 * Get payment history for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of payment records
 */
export async function getPaymentHistory(userId) {
  return apiRequest(`/api/payment/history/${userId}`);
}

// ============================================
// AGENT ACTIONS API (Coin-based purchases)
// ============================================

/**
 * Refill agent energy (costs 50 coins)
 * @param {number} agentId - Agent ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result with updated agent and balance
 */
export async function refillEnergy(agentId, userId) {
  return apiRequest(`/agents/${agentId}/refill-energy`, {
    method: "POST",
    body: { userId },
  });
}

/**
 * Apply XP boost to agent (costs 100 coins, gives +20% XP next match)
 * @param {number} agentId - Agent ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result with updated agent and balance
 */
export async function applyXPBoost(agentId, userId) {
  return apiRequest(`/agents/${agentId}/xp-boost`, {
    method: "POST",
    body: { userId },
  });
}

/**
 * Re-roll one random stat into a rare 8-10 roll (costs 200 coins)
 * @param {number} agentId - Agent ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result with updated agent and balance
 */
export async function rollRareTrait(agentId, userId) {
  return apiRequest(`/agents/${agentId}/rare-trait-roll`, {
    method: "POST",
    body: { userId },
  });
}

/**
 * List an agent for sale
 * @param {number} agentId - Agent ID
 * @param {string} userId - User ID (owner)
 * @param {number} price - Price in coins
 * @returns {Promise<Object>} Result with updated agent
 */
export async function listAgentForSale(agentId, userId, price) {
  return apiRequest(`/agents/${agentId}/list-for-sale`, {
    method: "POST",
    body: { userId, price },
  });
}

/**
 * Remove an agent from sale
 * @param {number} agentId - Agent ID
 * @param {string} userId - User ID (owner)
 * @returns {Promise<Object>} Result with updated agent
 */
export async function removeAgentFromSale(agentId, userId) {
  return apiRequest(`/agents/${agentId}/remove-from-sale`, {
    method: "POST",
    body: { userId },
  });
}

/**
 * Purchase an agent
 * @param {number} agentId - Agent ID
 * @param {string} buyerId - Buyer's user ID
 * @returns {Promise<Object>} Result with purchased agent and updated balance
 */
export async function purchaseAgent(agentId, buyerId) {
  return apiRequest(`/agents/${agentId}/purchase`, {
    method: "POST",
    body: { buyerId },
  });
}

// Export API_URL for any components that need it
export { API_URL };


