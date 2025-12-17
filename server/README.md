# Reality Patch: SQL Game - Server

Backend server for the Reality Patch: SQL Game built with Express, TypeScript, and MongoDB.

## 🚀 Quick Start

### Prerequisites
- Node.js v18 or higher
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your MongoDB connection string and other settings
```

3. Create logs directory:
```bash
mkdir logs
```

4. Start development server:
```bash
npm run dev
```

The server will start on `http://localhost:3001` (or the port specified in `.env`).

## 📁 Project Structure

```
server/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.ts  # MongoDB connection
│   │   └── env.ts       # Environment variables
│   ├── controllers/     # Route controllers
│   ├── middleware/       # Express middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── logs/                # Log files (gitignored)
├── dist/                # Compiled JavaScript (gitignored)
└── package.json
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user (requires auth)

### Progress
- `GET /api/progress` - Get all user progress (requires auth)
- `GET /api/progress/level/:levelId` - Get level progress (requires auth)
- `POST /api/progress/mission/complete` - Complete mission (requires auth)
- `PUT /api/progress/stats` - Update user stats (requires auth)
- `GET /api/progress/stats` - Get user stats (requires auth)
- `POST /api/progress/sync` - Sync client progress (requires auth)

### Health
- `GET /api/health` - Health check
- `GET /api/info` - Server info

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## 📝 Environment Variables

See `.env.example` for all required environment variables.

## 🧪 Testing

```bash
npm test
```

## 🏗️ Building for Production

```bash
npm run build
npm start
```

## 📚 Documentation

For detailed implementation plan, see `PLAN_AND_STEPS.md` (if created).

## 🛠️ Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code

## 📦 Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **jsonwebtoken** - JWT authentication
- **bcrypt** - Password hashing
- **joi** - Input validation
- **winston** - Logging
- **helmet** - Security headers
- **cors** - CORS middleware
- **express-rate-limit** - Rate limiting

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting
- Helmet security headers
- Input validation with Joi
- CORS configuration
- Error handling

## 📄 License

ISC

