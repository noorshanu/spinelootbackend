# SpinLoot Airdrop Dashboard Backend

A professional Node.js backend with MongoDB for the SpinLoot airdrop dashboard, featuring wallet-based authentication, points system, referral program, and comprehensive task management.

## Features

- 🚀 **Express.js** - Fast, unopinionated web framework
- 🍃 **MongoDB** - NoSQL database with Mongoose ODM
- 🔐 **Wallet Authentication** - Secure wallet-based authentication
- 🎯 **Points System** - Comprehensive points tracking and tier system
- 👥 **Referral Program** - Complete referral system with tracking
- 🎰 **Daily Spinner** - Random rewards system with daily limits
- 📋 **Task Management** - Airdrop tasks with completion tracking
- 🛡️ **Security Middleware** - Helmet, CORS, rate limiting, XSS protection
- 📝 **Input Validation** - Express-validator for request validation
- 🧪 **Testing** - Jest testing framework
- 📊 **Logging** - Morgan HTTP request logger
- 🔧 **Development Tools** - Nodemon, ESLint
- 🏗️ **Clean Architecture** - Organized folder structure

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd spinelootbackend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   - Set your MongoDB connection string
   - Configure JWT secret
   - Set other environment variables as needed

4. **Start the development server**
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Mongoose models
├── routes/          # API routes
├── services/        # Business logic
├── utils/           # Utility functions
└── server.js        # Main server file
```

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run seed:tasks` - Seed database with default tasks

## API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Authentication
- `POST /api/auth/connect-wallet` - Connect wallet and authenticate
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)
- `GET /api/auth/points-history` - Get points history (protected)

### Tasks
- `GET /api/tasks` - Get all active tasks
- `GET /api/tasks/:taskId` - Get specific task
- `POST /api/tasks/:taskId/complete` - Complete task (protected)
- `GET /api/tasks/progress` - Get user's task progress (protected)
- `GET /api/tasks/stats` - Get task statistics (protected)

### Referrals
- `GET /api/referrals/info` - Get referral info (protected)
- `GET /api/referrals/list` - Get referrals list (protected)
- `GET /api/referrals/stats` - Get referral statistics (protected)
- `POST /api/referrals/validate` - Validate referral code
- `GET /api/referrals/leaderboard` - Get referral leaderboard
- `GET /api/referrals/rewards` - Get referral rewards (protected)

### Daily Spinner
- `POST /api/spinner/spin` - Spin daily spinner (protected)
- `GET /api/spinner/status` - Get spinner status (protected)
- `GET /api/spinner/history` - Get spinner history (protected)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `4000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/spineloot` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `FRONTEND_URL` | Frontend URL for referral links | `http://localhost:3000` |

## Security Features

- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API rate limiting
- **Input Sanitization** - MongoDB query sanitization
- **XSS Protection** - Cross-site scripting protection
- **Wallet Authentication** - Secure wallet-based authentication

## Points & Tier System

- **Newcomer**: 0-29 points
- **Space Explorer**: 30-59 points  
- **Cosmic Creator**: 60+ points

## Referral System

- **Referrer Bonus**: 100 points per successful referral
- **Referred Bonus**: 50 points welcome bonus
- **Milestone Rewards**: Bonus points at 5, 10, 25, 50, 100 referrals
- **Manual Referrals**: Support for manual referral code entry
- **Referral ID**: Uses wallet address (first 8 characters)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and tests
6. Submit a pull request

## License

MIT License - see LICENSE file for details
