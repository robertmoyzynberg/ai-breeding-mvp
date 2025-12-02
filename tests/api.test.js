/**
 * API Endpoint Tests
 * Run with: node tests/api.test.js
 * 
 * These tests verify all backend API endpoints return correct responses
 */

const API_URL = process.env.API_URL || 'http://localhost:5001';

// Test helper
async function testEndpoint(name, method, endpoint, body = null, expectedStatus = 200) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();
    
    const passed = response.status === expectedStatus;
    console.log(`${passed ? '✅' : '❌'} ${name}: ${response.status} ${passed ? 'PASS' : 'FAIL'}`);
    
    if (!passed) {
      console.log(`   Expected: ${expectedStatus}, Got: ${response.status}`);
      console.log(`   Response:`, data);
    }
    
    return { passed, status: response.status, data };
  } catch (error) {
    console.log(`❌ ${name}: ERROR - ${error.message}`);
    return { passed: false, error: error.message };
  }
}

// Run all tests
async function runTests() {
  console.log('🧪 Running API Endpoint Tests...\n');
  
  // Health Check
  await testEndpoint('Health Check', 'GET', '/api/health');
  
  // Agents
  await testEndpoint('Get All Agents', 'GET', '/agents');
  await testEndpoint('Get Single Agent', 'GET', '/agents/1');
  
  // Create test agent
  const createResult = await testEndpoint(
    'Create Agent',
    'POST',
    '/agents',
    {
      name: 'TestAgent',
      owner: 'testuser',
      traits: { strength: 5, speed: 5, intelligence: 5 }
    },
    201
  );
  
  const agentId = createResult.data?.id;
  
  if (agentId) {
    await testEndpoint('Get Created Agent', 'GET', `/agents/${agentId}`);
    await testEndpoint('Update Agent', 'PUT', `/agents/${agentId}`, { energy: 90 });
    await testEndpoint('Delete Agent', 'DELETE', `/agents/${agentId}`);
  }
  
  // Battle (requires 2 agents)
  await testEndpoint(
    'Battle Agents',
    'POST',
    '/api/battle',
    { agentA: 1, agentB: 2 }
  );
  
  // Breed (requires 2 agents)
  await testEndpoint(
    'Breed Agents',
    'POST',
    '/api/breed',
    { parent1Id: 1, parent2Id: 2 }
  );
  
  // Payment
  await testEndpoint(
    'Create Checkout Session',
    'POST',
    '/api/payment/create-checkout-session',
    { userId: 'testuser', amount: 9.99 }
  );
  
  await testEndpoint('Get Balance', 'GET', '/api/payment/balance/testuser');
  await testEndpoint('Get Payment History', 'GET', '/api/payment/history/testuser');
  
  // Chat
  await testEndpoint(
    'Send Chat Message',
    'POST',
    '/api/chat',
    { agentId: 1, message: 'Hello!' }
  );
  
  await testEndpoint('Get Chat History', 'GET', '/api/chat/1');
  
  console.log('\n✅ Tests completed!');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { testEndpoint, runTests };

