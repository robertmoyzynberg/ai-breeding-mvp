# AI Breeding MVP - Comprehensive Test Plan

## Overview

This document provides a systematic testing checklist for all features of the AI Breeding MVP, including NFT agents, stat-based personalities, chat functionality, and blockchain integration.

---

## Pre-Testing Setup

### Backend Setup

- [ ] Backend server running on port 5001
- [ ] Database file `backend/db.sqlite` exists (will be created automatically)
- [ ] OpenAI API key configured (optional - system works with mock responses)
- [ ] All routes registered and accessible

### Frontend Setup

- [ ] Frontend running on port 3000
- [ ] MetaMask installed (for wallet features)
- [ ] Testnet ETH available (for NFT minting/testing)

### Test Accounts

- [ ] Create at least 2 test accounts
- [ ] Create at least 3-4 test agents with different stat combinations

---

## Test Suite 1: Account & Authentication

### 1.1 Account Creation

- [ ] Navigate to `/create-account`
- [ ] Enter username
- [ ] Click "Create"
- [ ] Verify: Account created successfully
- [ ] Verify: Redirected to Dashboard
- [ ] Verify: User state stored globally
- [ ] Verify: Balance shows (default 0 or initial amount)

### 1.2 Dashboard Access

- [ ] Navigate to `/dashboard` while logged in
- [ ] Verify: Dashboard displays correctly
- [ ] Verify: Shows username and balance
- [ ] Verify: All navigation buttons present
- [ ] Navigate to `/dashboard` while NOT logged in
- [ ] Verify: Redirected to `/create-account`

---

## Test Suite 2: Agent Creation & Management

### 2.1 Create Agent

- [ ] Navigate to `/create-agent`
- [ ] Verify: Page requires authentication (redirects if not logged in)
- [ ] Enter agent name
- [ ] Click "Create Agent"
- [ ] Verify: Agent created successfully
- [ ] Verify: Balance deducted (10 coins)
- [ ] Verify: Redirected to Dashboard
- [ ] Verify: Agent appears in `/agents` page

### 2.2 View Agents

- [ ] Navigate to `/agents`
- [ ] Verify: All user's agents displayed
- [ ] Verify: Each agent shows:
  - Name
  - Traits (strength, speed, intelligence)
  - Power
  - Energy
  - XP
  - GENE
  - Rarity
- [ ] Verify: Action buttons present (Train, Select for Breeding, Battle)

### 2.3 Agent Stats Validation

- [ ] Verify: All agents have valid trait values (1-10 range)
- [ ] Verify: Power calculated correctly
- [ ] Verify: Energy defaults to 100
- [ ] Verify: XP defaults to 0
- [ ] Verify: GENE defaults to 0

---

## Test Suite 3: Breeding System

### 3.1 Parent Selection Flow

- [ ] Navigate to `/breed/select`
- [ ] Verify: All user's agents displayed
- [ ] Click "Select Parent A" on an agent
- [ ] Verify: Navigated to `/breed/parentB/:parentAId`
- [ ] Verify: Parent A highlighted at top
- [ ] Verify: Parent A excluded from selectable list
- [ ] Click "Select Parent B" on another agent
- [ ] Verify: Navigated to `/breed/run/:parentAId/:parentBId`

### 3.2 Breeding Execution

- [ ] Verify: Loading state shows during breeding
- [ ] Verify: Breeding completes successfully
- [ ] Verify: Newborn agent displayed with stats
- [ ] Verify: Parent agents awarded +1 GENE each
- [ ] Verify: Coin reward based on rarity (if applicable)
- [ ] Verify: Child agent saved to backend
- [ ] Verify: Child appears in `/agents` page

### 3.3 Breeding Results

- [ ] Verify: Child agent has valid traits
- [ ] Verify: Child agent has unique ID
- [ ] Verify: Child agent has owner set correctly
- [ ] Verify: Rarity calculated correctly
- [ ] Verify: Power calculated correctly

---

## Test Suite 4: Battle System

### 4.1 Manual Battle

- [ ] Select 2 agents in main App interface
- [ ] Click "Battle Selected Parents"
- [ ] Verify: Battle executes
- [ ] Verify: Winner determined
- [ ] Verify: XP awarded (10 for winner, 2 for loser)
- [ ] Verify: Energy deducted (10 per agent)
- [ ] Verify: Power recalculated with new XP
- [ ] Verify: Battle results displayed

### 4.2 Random Battle

- [ ] Click "Random Battle"
- [ ] Verify: Two random agents selected
- [ ] Verify: Battle executes
- [ ] Verify: Results displayed

### 4.3 Auto Battle

- [ ] Click "Start Auto Battle"
- [ ] Verify: Battles occur every 2 seconds
- [ ] Verify: Results update continuously
- [ ] Click "Stop Auto Battle"
- [ ] Verify: Battling stops

### 4.4 Battle Backend Integration

- [ ] Verify: Agents updated in backend after battle
- [ ] Verify: 404 errors handled gracefully for non-existent agents
- [ ] Verify: Local fallback works if backend unavailable

---

## Test Suite 5: NFT Minting

### 5.1 Wallet Connection

- [ ] Navigate to `/mint`
- [ ] Verify: "Connect Wallet" button present
- [ ] Click "Connect Wallet"
- [ ] Verify: MetaMask prompts for connection
- [ ] Approve connection
- [ ] Verify: Wallet address displayed
- [ ] Verify: "Wallet Connected" status shown

### 5.2 Agent Selection for Minting

- [ ] Verify: All user's agents displayed
- [ ] Click on an agent
- [ ] Verify: Agent highlighted
- [ ] Verify: "Mint Selected Agent as NFT" button enabled

### 5.3 NFT Minting Process

- [ ] Click "Mint Selected Agent as NFT"
- [ ] Verify: Loading state shows
- [ ] Verify: Transaction processed (or mock transaction if contract not deployed)
- [ ] Verify: Success message with transaction ID
- [ ] Verify: Etherscan link provided (if real transaction)

### 5.4 Contract Integration (if deployed)

- [ ] Verify: NFT minted on blockchain
- [ ] Verify: Token ID assigned
- [ ] Verify: Metadata stored correctly
- [ ] Verify: Owner set correctly

---

## Test Suite 6: Marketplace & NFT Display

### 6.1 Marketplace Access

- [ ] Navigate to `/marketplace`
- [ ] Verify: Wallet connector displayed
- [ ] Verify: "Refresh NFTs" button present
- [ ] Verify: Navigation buttons present

### 6.2 NFT Display

- [ ] Click "Refresh NFTs"
- [ ] Verify: All minted NFTs loaded
- [ ] For each NFT, verify:
  - Image displayed (or placeholder)
  - Name shown
  - Token ID displayed
  - Owner address shown (truncated)
  - Metadata attributes displayed
  - Blockchain stats displayed (Intelligence, Strength, Energy)
  - Personality badges displayed
  - Upgrade buttons (if owner)

### 6.3 NFT Selection & Chat

- [ ] Click on an NFT card
- [ ] Verify: NFT highlighted
- [ ] Verify: Chat interface appears below
- [ ] Verify: Chat shows agent name and stats
- [ ] Verify: Personality traits displayed in chat header

### 6.4 Personality Visualization

- [ ] Verify: Personality badges match stats
- [ ] Verify: Color coding correct:
  - Blue for intelligence traits
  - Red for strength traits
  - Orange for energy traits
- [ ] Verify: Icons displayed correctly
- [ ] Verify: Conversation style description shown

---

## Test Suite 7: Stat Upgrades

### 7.1 Upgrade Intelligence

- [ ] Select owned NFT in marketplace
- [ ] Click "+Int" button
- [ ] Verify: Transaction sent (or mock)
- [ ] Verify: Intelligence stat increases by 1
- [ ] Verify: Stats refresh automatically
- [ ] Verify: Personality badges update
- [ ] Verify: Conversation style updates

### 7.2 Upgrade Strength

- [ ] Click "+Str" button
- [ ] Verify: Strength stat increases by 1
- [ ] Verify: Personality badges update
- [ ] Verify: Conversation style updates

### 7.3 Upgrade Energy

- [ ] Click "+Ene" button
- [ ] Verify: Energy stat increases by 1
- [ ] Verify: Personality badges update
- [ ] Verify: Conversation style updates

### 7.4 Multiple Upgrades

- [ ] Upgrade all three stats multiple times
- [ ] Verify: Stats persist on blockchain
- [ ] Verify: Personality evolves correctly
- [ ] Verify: No errors occur

---

## Test Suite 8: AI Chat System

### 8.1 Chat History Loading

- [ ] Select an NFT in marketplace
- [ ] Verify: Chat interface loads
- [ ] Verify: "Loading chat history..." shown initially
- [ ] Verify: Previous messages load (if any)
- [ ] Verify: Messages display correctly with sender labels

### 8.2 Sending Messages

- [ ] Type a message in chat input
- [ ] Press Enter or click "Send"
- [ ] Verify: User message appears immediately
- [ ] Verify: "Agent is typing..." indicator shows
- [ ] Verify: AI response received
- [ ] Verify: Agent message appears
- [ ] Verify: Auto-scroll to bottom

### 8.3 Personality Reflection in Responses

- [ ] Test with High Intelligence (≥15):
  - [ ] Verify: Uses sophisticated vocabulary
  - [ ] Verify: Discusses complex topics
  - [ ] Verify: Shows deep reasoning
- [ ] Test with Low Intelligence (<10):
  - [ ] Verify: Uses simple language
  - [ ] Verify: Keeps responses brief
  - [ ] Verify: Discusses basic topics
- [ ] Test with High Strength (≥15):
  - [ ] Verify: Makes bold statements
  - [ ] Verify: Shows confidence
  - [ ] Verify: Decisive in responses
- [ ] Test with Low Strength (<10):
  - [ ] Verify: Shows caution
  - [ ] Verify: Asks for input
  - [ ] Verify: Collaborative tone
- [ ] Test with High Energy (≥15):
  - [ ] Verify: Enthusiastic responses
  - [ ] Verify: Uses exclamation marks
  - [ ] Verify: Longer, more active responses
- [ ] Test with Low Energy (<10):
  - [ ] Verify: Calm, measured tone
  - [ ] Verify: Shorter responses
  - [ ] Verify: Lower activity level

### 8.4 Conversation Topics

- [ ] Chat with High Intelligence agent
- [ ] Verify: Agent discusses complex topics naturally
- [ ] Verify: Agent brings up advanced concepts
- [ ] Chat with Low Intelligence agent
- [ ] Verify: Agent prefers simple topics
- [ ] Verify: Agent keeps discussions basic

### 8.5 Response Pacing

- [ ] Chat with High Energy agent
- [ ] Verify: Responses are enthusiastic and quick
- [ ] Chat with Low Energy agent
- [ ] Verify: Responses are calm and measured

### 8.6 Decision-Making Style

- [ ] Chat with High Strength agent
- [ ] Verify: Makes bold, decisive statements
- [ ] Chat with Low Strength agent
- [ ] Verify: Shows caution and asks for input

### 8.7 Chat Persistence

- [ ] Send several messages to an NFT
- [ ] Close chat (click another NFT or close)
- [ ] Reopen chat with same NFT
- [ ] Verify: Previous conversation history loads
- [ ] Verify: All messages present in correct order
- [ ] Reload page
- [ ] Verify: Chat history persists after reload

### 8.8 Multiple NFT Conversations

- [ ] Chat with NFT #1
- [ ] Send 3 messages
- [ ] Switch to NFT #2
- [ ] Send 2 messages
- [ ] Switch back to NFT #1
- [ ] Verify: NFT #1's conversation history intact
- [ ] Switch to NFT #2
- [ ] Verify: NFT #2's conversation history intact

---

## Test Suite 9: Stat-Based Personality Evolution

### 9.1 Personality Changes with Upgrades

- [ ] Select an NFT with low stats (Int: 5, Str: 5, Ene: 5)
- [ ] Note initial personality badges
- [ ] Upgrade Intelligence to 15
- [ ] Verify: Personality badges update
- [ ] Verify: "Highly Intelligent" badge appears
- [ ] Chat with agent
- [ ] Verify: Responses reflect higher intelligence
- [ ] Upgrade Strength to 15
- [ ] Verify: "Confident" badge appears
- [ ] Chat with agent
- [ ] Verify: Responses show more confidence
- [ ] Upgrade Energy to 15
- [ ] Verify: "Energetic" badge appears
- [ ] Chat with agent
- [ ] Verify: Responses become more enthusiastic

### 9.2 Personality Combinations

- [ ] Create/select agents with different stat combinations:
  - [ ] High Int, High Str, High Ene (Genius Warrior)
  - [ ] High Int, Low Str, Low Ene (Gentle Scholar)
  - [ ] Low Int, High Str, High Ene (Simple Warrior)
  - [ ] Low Int, Low Str, Low Ene (Simple Helper)
- [ ] Chat with each
- [ ] Verify: Each has distinct personality
- [ ] Verify: Responses match personality traits

---

## Test Suite 10: Error Handling & Edge Cases

### 10.1 Backend Errors

- [ ] Stop backend server
- [ ] Try to send chat message
- [ ] Verify: Error handled gracefully
- [ ] Verify: User-friendly error message
- [ ] Restart backend
- [ ] Verify: System recovers

### 10.2 Missing OpenAI API Key

- [ ] Remove OPENAI_API_KEY from environment
- [ ] Send chat message
- [ ] Verify: Mock response received
- [ ] Verify: Message indicates API key needed
- [ ] Verify: Message saved to database

### 10.3 Wallet Not Connected

- [ ] Disconnect wallet
- [ ] Try to mint NFT
- [ ] Verify: Error message prompts connection
- [ ] Try to upgrade stats
- [ ] Verify: Error message prompts connection

### 10.4 Empty States

- [ ] Navigate to marketplace with no NFTs
- [ ] Verify: Empty state message shown
- [ ] Navigate to agents page with no agents
- [ ] Verify: Empty state message shown
- [ ] Open chat with no history
- [ ] Verify: "Start a conversation" message shown

### 10.5 Invalid Data

- [ ] Try to create agent with empty name
- [ ] Verify: Validation error
- [ ] Try to breed without selecting parents
- [ ] Verify: Error message
- [ ] Try to battle without selecting agents
- [ ] Verify: Error message

---

## Test Suite 11: Performance & UX

### 11.1 Loading States

- [ ] Verify: All async operations show loading states
- [ ] Verify: Loading messages are clear
- [ ] Verify: No flickering or layout shifts

### 11.2 Responsiveness

- [ ] Test on different screen sizes
- [ ] Verify: Layout adapts correctly
- [ ] Verify: Grid layouts work on mobile
- [ ] Verify: Chat interface usable on mobile

### 11.3 Navigation Flow

- [ ] Test complete user journey:
  - [ ] Create account → Dashboard
  - [ ] Create agent → View agents
  - [ ] Breed agents → View offspring
  - [ ] Mint NFT → Marketplace
  - [ ] Chat with NFT → Upgrade stats
- [ ] Verify: All transitions smooth
- [ ] Verify: No broken links
- [ ] Verify: Back navigation works

---

## Test Suite 12: Blockchain Integration (if deployed)

### 12.1 Contract Deployment

- [ ] Verify: Contract deployed to testnet
- [ ] Verify: Contract address configured in frontend
- [ ] Verify: ABI matches contract

### 12.2 NFT Minting on Chain

- [ ] Mint an NFT
- [ ] Verify: Transaction confirmed on blockchain
- [ ] Verify: Token ID assigned
- [ ] Verify: Metadata stored
- [ ] Verify: Owner set correctly

### 12.3 Stat Upgrades on Chain

- [ ] Upgrade a stat
- [ ] Verify: Transaction confirmed
- [ ] Verify: Stat updated on-chain
- [ ] Verify: Can query updated stat from contract

### 12.4 NFT Fetching

- [ ] Refresh NFTs in marketplace
- [ ] Verify: All on-chain NFTs loaded
- [ ] Verify: Stats fetched correctly
- [ ] Verify: Metadata parsed correctly

---

## Test Results Template

For each test suite, document:

- [ ] Test Date: ****\_\_\_****
- [ ] Tester: ****\_\_\_****
- [ ] Pass/Fail: ****\_\_\_****
- [ ] Notes: ****\_\_\_****
- [ ] Bugs Found: ****\_\_\_****
- [ ] Screenshots: ****\_\_\_****

---

## Known Issues & Workarounds

### Issue 1: Backend 404 Errors for Non-Existent Agents

- **Status**: Expected behavior
- **Workaround**: System falls back to local logic
- **Fix**: Ensure agents are saved to backend before operations

### Issue 2: Duplicate React Keys

- **Status**: Should be resolved
- **Workaround**: None needed
- **Fix**: Deduplication logic in place

---

## Success Criteria

All tests pass when:

- [ ] All core features work (breeding, battling, minting, chatting)
- [ ] Personality system reflects stats accurately
- [ ] Chat history persists correctly
- [ ] Stat upgrades work and update personalities
- [ ] No critical errors in console
- [ ] User experience is smooth and intuitive
- [ ] All edge cases handled gracefully

---

## Next Steps After Testing

1. Fix any bugs found during testing
2. Optimize performance if needed
3. Add missing features based on test feedback
4. Prepare for deployment
5. Consider on-chain chat persistence (optional)
6. Add stat-based gameplay features
7. Implement personality evolution over time

---

**Test Plan Version**: 1.0  
**Last Updated**: 2024  
**Status**: Ready for Testing
