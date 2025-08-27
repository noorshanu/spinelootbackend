# SpinLoot Airdrop Dashboard API Documentation

## Base URL
```
http://localhost:4000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### Connect Wallet
**POST** `/auth/connect-wallet`

Connect wallet and authenticate user. Creates new user if wallet address doesn't exist.

**Request Body:**
```json
{
  "walletAddress": "string (required)",
  "displayName": "string (optional)",
  "email": "string (optional)",
  "referralCode": "string (optional)"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "string",
      "walletAddress": "string",
      "displayName": "string",
      "email": "string",
      "avatar": "string",
      "role": "string",
      "totalPoints": "number",
      "currentTier": "string",
      "referralCode": "string",
      "referralCount": "number",
      "totalReferralEarnings": "number"
    },
    "token": "string"
  }
}
```

#### Get Profile
**GET** `/auth/profile` *(Protected)*

Get current user's profile information.

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "string",
      "walletAddress": "string",
      "displayName": "string",
      "email": "string",
      "avatar": "string",
      "role": "string",
      "totalPoints": "number",
      "currentTier": "string",
      "referralCode": "string",
      "referralCount": "number",
      "totalReferralEarnings": "number",
      "isActive": "boolean",
      "lastLogin": "date",
      "createdAt": "date",
      "updatedAt": "date"
    }
  }
}
```

#### Update Profile
**PUT** `/auth/profile` *(Protected)*

Update user's profile information.

**Request Body:**
```json
{
  "displayName": "string (optional)",
  "email": "string (optional)",
  "avatar": "string (optional)"
}
```

#### Get Points History
**GET** `/auth/points-history` *(Protected)*

Get user's points history with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

#### Get Completed Tasks
**GET** `/auth/completed-tasks` *(Protected)*

Get user's completed tasks list.

### Tasks

#### Get All Tasks
**GET** `/tasks`

Get all active airdrop tasks.

**Response:**
```json
{
  "status": "success",
  "data": {
    "tasks": [
      {
        "taskId": "string",
        "title": "string",
        "description": "string",
        "points": "number",
        "maxCompletions": "number",
        "type": "once|daily|limited",
        "action": "string",
        "link": "string",
        "category": "social|engagement|referral|special",
        "isActive": "boolean"
      }
    ]
  }
}
```

#### Get Task by ID
**GET** `/tasks/:taskId`

Get specific task details.

#### Complete Task
**POST** `/tasks/:taskId/complete` *(Protected)*

Complete a specific task and earn points.

**Response:**
```json
{
  "status": "success",
  "message": "Task completed successfully",
  "data": {
    "pointsEarned": "number",
    "totalPoints": "number",
    "taskCompletion": {
      "taskId": "string",
      "completions": "number",
      "completed": "boolean"
    }
  }
}
```

#### Get Task Progress
**GET** `/tasks/progress` *(Protected)*

Get user's progress on all tasks.

**Response:**
```json
{
  "status": "success",
  "data": {
    "taskProgress": [
      {
        "taskId": "string",
        "title": "string",
        "description": "string",
        "points": "number",
        "maxCompletions": "number",
        "type": "string",
        "action": "string",
        "link": "string",
        "completions": "number",
        "completed": "boolean",
        "lastCompleted": "date",
        "canComplete": "boolean"
      }
    ],
    "totalPoints": "number",
    "currentTier": "string"
  }
}
```

#### Get Task Statistics
**GET** `/tasks/stats` *(Protected)*

Get user's task completion statistics.

### Referrals

#### Get Referral Info
**GET** `/referrals/info` *(Protected)*

Get user's referral information.

**Response:**
```json
{
  "status": "success",
  "data": {
    "referralCode": "string",
    "referralCount": "number",
    "totalReferralEarnings": "number",
    "referralLink": "string"
  }
}
```

#### Get Referrals List
**GET** `/referrals/list` *(Protected)*

Get list of user's referrals with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by status (pending|active|completed)

#### Get Referral Statistics
**GET** `/referrals/stats` *(Protected)*

Get user's referral statistics.

**Response:**
```json
{
  "status": "success",
  "data": {
    "stats": {
      "total": "number",
      "pending": "number",
      "active": "number",
      "completed": "number",
      "totalEarnings": "number",
      "thisMonth": "number"
    }
  }
}
```

#### Validate Referral Code
**POST** `/referrals/validate`

Validate a referral code.

**Request Body:**
```json
{
  "referralCode": "string"
}
```

#### Get Referral Leaderboard
**GET** `/referrals/leaderboard`

Get referral leaderboard with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

#### Get Referral Rewards
**GET** `/referrals/rewards` *(Protected)*

Get user's referral rewards and milestones.

### Daily Spinner

#### Spin Daily Spinner
**POST** `/spinner/spin` *(Protected)*

Spin the daily spinner to earn random points.

**Response:**
```json
{
  "status": "success",
  "message": "Spin completed successfully",
  "data": {
    "spinResult": {
      "points": "number",
      "description": "string",
      "type": "points"
    },
    "totalPoints": "number",
    "spinsToday": "number",
    "canSpinAgain": "boolean"
  }
}
```

#### Get Spinner Status
**GET** `/spinner/status` *(Protected)*

Get current spinner status and eligibility.

**Response:**
```json
{
  "status": "success",
  "data": {
    "spinsToday": "number",
    "maxSpinsPerDay": "number",
    "canSpin": "boolean",
    "reason": "string",
    "lastSpin": "date",
    "nextReset": "date"
  }
}
```

#### Get Spinner History
**GET** `/spinner/history` *(Protected)*

Get user's spinner history with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

## Error Responses

All endpoints return consistent error responses:

```json
{
  "status": "error",
  "message": "Error description"
}
```

For validation errors:
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "string",
      "message": "string",
      "value": "string"
    }
  ]
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## Tier System

- **Newcomer**: 0-29 points
- **Space Explorer**: 30-59 points
- **Cosmic Creator**: 60+ points

## Points System

- **Tasks**: 5-10 points per completion
- **Referrals**: 100 points per successful referral
- **Daily Spinner**: 10-100 points per spin (random)
- **Welcome Bonus**: 50 points for using referral code

## Rate Limiting

- 100 requests per 15 minutes per IP address
- Daily spinner: 3 spins per day
- Task completions: Based on task type and max completions
