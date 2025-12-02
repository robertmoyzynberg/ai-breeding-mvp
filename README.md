# 🧬 AI Breeding MVP

A full-stack AI-powered breeding game where players create, battle, breed, and chat with AI agents.

## ✨ Features

- **Agent Creation:** Create unique AI agents with customizable traits
- **Battles:** Battle agents against each other to earn XP and coins
- **Breeding:** Combine two agents to create offspring with inherited traits
- **AI Chat:** Have conversations with your agents powered by OpenAI
- **Coin Economy:** Purchase coins, earn rewards, and redeem for upgrades
- **Store:** Buy coins and redeem them for energy refills, XP boosts, and rare trait rolls
- **Agent Profiles:** View detailed stats and manage your agents
- **Real-time Updates:** Global state management with auto-refresh

## 🛠️ Tech Stack

### Frontend
- React.js
- React Router
- React Context (Global State)
- CSS3 (Animations & Responsive Design)

### Backend
- Node.js
- Express.js
- SQLite (Database)
- OpenAI API (Chat)

## 📦 Installation

### Prerequisites
- Node.js 16+ installed
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/ai-breeding-mvp.git
   cd ai-breeding-mvp
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure environment variables**

   Create `backend/.env`:
   ```
   PORT=5001
   OPENAI_API_KEY=your_openai_key_here (optional)
   ```

   Create `frontend/.env`:
   ```
   REACT_APP_API_URL=http://localhost:5001
   ```

5. **Start the backend**
   ```bash
   cd backend
   npm start
   ```

6. **Start the frontend** (in a new terminal)
   ```bash
   cd frontend
   npm start
   ```

7. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

## 🎮 Usage

1. **Create Account:** Enter a username to start
2. **Create Agent:** Design your first AI agent
3. **Battle:** Select two agents to battle
4. **Breed:** Combine agents to create offspring
5. **Chat:** Have conversations with your agents
6. **Store:** Purchase coins and redeem for upgrades

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy:**
- Frontend: Deploy to [Vercel](https://vercel.com)
- Backend: Deploy to [Render](https://render.com)

## 📁 Project Structure

```
ai-breeding-mvp/
├── backend/
│   ├── src/
│   │   ├── routes/        # API routes
│   │   └── server.js      # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/          # Backend API client
│   │   ├── components/   # React components
│   │   ├── context/      # Global state
│   │   ├── pages/        # Page components
│   │   └── App.js        # Main app
│   └── package.json
└── README.md
```

## 🔧 API Endpoints

### Agents
- `GET /agents` - Get all agents
- `GET /agents/:id` - Get single agent
- `POST /agents` - Create agent
- `PUT /agents/:id` - Update agent
- `DELETE /agents/:id` - Delete agent
- `POST /agents/:id/refill-energy` - Refill energy (50 coins)
- `POST /agents/:id/xp-boost` - Apply XP boost (100 coins)
- `POST /agents/:id/rare-trait-roll` - Roll rare trait (200 coins)

### Battle
- `POST /api/battle` - Battle two agents

### Breeding
- `POST /api/breed` - Breed two agents

### Chat
- `GET /api/chat/:agentId` - Get chat history
- `POST /api/chat` - Send message

### Payment
- `POST /api/payment/create` - Create payment intent
- `POST /api/payment/confirm` - Confirm payment
- `GET /api/payment/balance/:userId` - Get balance
- `GET /api/payment/history/:userId` - Get payment history

### Health
- `GET /api/health` - Health check

## 🎯 Roadmap

- [ ] Real payment integration (Stripe/Coinbase)
- [ ] PostgreSQL migration for production
- [ ] NFT minting on blockchain
- [ ] Marketplace for trading agents
- [ ] Leaderboards and rankings
- [ ] Multiplayer battles
- [ ] Agent evolution system

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🙏 Acknowledgments

- OpenAI for AI chat capabilities
- React community for excellent tools
- All contributors and testers

---

**Built with ❤️ for the AI gaming community**

