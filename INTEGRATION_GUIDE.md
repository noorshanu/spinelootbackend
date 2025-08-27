# SpinLoot Frontend-Backend Integration Guide

## Overview

This guide explains how to integrate the SpinLoot frontend with the backend API for a complete airdrop dashboard experience.

## Prerequisites

- Node.js 18+ installed
- MongoDB running locally or cloud instance
- Both frontend and backend repositories cloned

## Backend Setup

### 1. Install Dependencies
```bash
cd spinelootbackend
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://localhost:27017/spineloot
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000
```

### 3. Seed Database
```bash
npm run seed:tasks
```

### 4. Start Backend Server
```bash
npm run dev
```

The backend will be available at `http://localhost:4000`

## Frontend Setup

### 1. Install Dependencies
```bash
cd ../spineloot
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
VITE_API_URL=http://localhost:4000/api
VITE_APP_NAME=SpinLoot
VITE_SOLANA_NETWORK=devnet
```

### 3. Start Frontend Development Server
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Integration Features

### 1. Wallet Authentication
- Users connect their Solana wallet
- Backend creates/authenticates users based on wallet address
- JWT tokens are stored and managed automatically

### 2. Task Management
- Tasks are loaded from backend API
- Task completion is tracked and synced
- Points are awarded and stored in database

### 3. Daily Spinner
- Spinner rewards are generated server-side
- Daily limits are enforced
- Points are automatically added to user account

### 4. Referral System
- Referral codes are generated automatically
- Referral tracking and statistics
- Bonus points for referrers and referred users

### 5. Points & Tiers
- Real-time points tracking
- Automatic tier progression
- Points history and statistics

## API Endpoints Used

### Authentication
- `POST /api/auth/connect-wallet` - Connect wallet and authenticate
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Tasks
- `GET /api/tasks` - Get all active tasks
- `GET /api/tasks/progress` - Get user's task progress
- `POST /api/tasks/:taskId/complete` - Complete a task

### Daily Spinner
- `POST /api/spinner/spin` - Spin daily spinner
- `GET /api/spinner/status` - Get spinner status

### Referrals
- `GET /api/referrals/info` - Get referral information
- `GET /api/referrals/stats` - Get referral statistics
- `POST /api/referrals/validate` - Validate referral code

## Data Flow

### 1. User Authentication
```
Frontend (Wallet Connect) → Backend (Create/Auth User) → Frontend (Store Token)
```

### 2. Task Completion
```
Frontend (Complete Task) → Backend (Validate & Award Points) → Frontend (Update UI)
```

### 3. Daily Spinner
```
Frontend (Spin Request) → Backend (Generate Reward) → Frontend (Show Result)
```

### 4. Referral System
```
Frontend (Referral Code) → Backend (Validate & Process) → Frontend (Update Stats)
```

## Context Providers

### UserContext
Manages user authentication state and profile data:
- User information
- Authentication status
- Wallet connection
- Profile updates

### AirdropContext
Manages airdrop-related data and operations:
- Task data and progress
- Points and tier information
- Spinner functionality
- API interactions

## Error Handling

The integration includes comprehensive error handling:
- Network errors
- Authentication failures
- Validation errors
- Rate limiting
- Server errors

## Development Workflow

### 1. Backend Development
- API endpoints in `src/controllers/`
- Database models in `src/models/`
- Routes in `src/routes/`
- Middleware in `src/middleware/`

### 2. Frontend Development
- API service in `src/services/api.ts`
- Context providers in `src/contexts/`
- Components in `src/components/`
- Pages in `src/pages/`

### 3. Testing
- Backend: `npm test`
- Frontend: `npm run test`
- API testing: Use Postman or similar

## Production Deployment

### Backend
1. Set production environment variables
2. Use production MongoDB instance
3. Set up proper CORS origins
4. Configure rate limiting
5. Deploy to your preferred platform

### Frontend
1. Set production API URL
2. Build the application: `npm run build`
3. Deploy to your preferred platform
4. Configure environment variables

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure `CORS_ORIGIN` is set correctly in backend
   - Check frontend API URL configuration

2. **Authentication Issues**
   - Verify JWT secret is set
   - Check token storage in frontend
   - Ensure wallet connection is working

3. **Database Connection**
   - Verify MongoDB is running
   - Check connection string
   - Ensure database exists

4. **Task Completion Issues**
   - Check task validation logic
   - Verify user permissions
   - Check task configuration

### Debug Mode

Enable debug logging in backend:
```env
LOG_LEVEL=debug
```

Check browser console for frontend errors and API responses.

## Security Considerations

1. **JWT Tokens**
   - Use strong secrets
   - Set appropriate expiration times
   - Validate tokens on all protected routes

2. **Rate Limiting**
   - Configure appropriate limits
   - Monitor for abuse
   - Implement progressive delays

3. **Input Validation**
   - Validate all user inputs
   - Sanitize data
   - Prevent injection attacks

4. **CORS**
   - Restrict origins in production
   - Validate credentials
   - Monitor for unauthorized access

## Performance Optimization

1. **Database Indexing**
   - Index frequently queried fields
   - Optimize aggregation queries
   - Monitor query performance

2. **Caching**
   - Cache static data
   - Implement Redis for session storage
   - Cache API responses where appropriate

3. **Frontend Optimization**
   - Lazy load components
   - Optimize bundle size
   - Implement proper error boundaries

## Monitoring

1. **Backend Monitoring**
   - API response times
   - Error rates
   - Database performance
   - Memory usage

2. **Frontend Monitoring**
   - Page load times
   - API call success rates
   - User interactions
   - Error tracking

## Support

For issues or questions:
1. Check the API documentation
2. Review error logs
3. Test API endpoints directly
4. Verify environment configuration
