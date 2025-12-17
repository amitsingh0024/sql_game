# Models and Routes Status

## ✅ Models WITH Routes Implemented

1. **User** → `auth.routes.ts` + `user.routes.ts`
   - Authentication, profile, friends, friend requests

2. **UserProgress** → `progress.routes.ts`
   - Mission progress, level progress

3. **UserStats** → `progress.routes.ts`
   - User statistics, XP, ranks

4. **UserSettings** → `settings.routes.ts`
   - User preferences, notifications, privacy

5. **Questions** → `question.routes.ts`
   - CRUD operations, random questions, answer verification

6. **Challenges** → `challenge.routes.ts`
   - Challenge creation, enrollment, progress, leaderboard

7. **FriendRequest** → `user.routes.ts`
   - Friend request management (send, accept, reject)

---

## ❌ Models WITHOUT Routes (Need Implementation)

### 1. **UserAchievement**
- **Model**: `UserAchievement.ts`
- **Purpose**: Track user achievements/unlocked achievements
- **Fields**: `userId`, `achievementId`, `unlockedAt`
- **Suggested Routes**:
  - `GET /api/v1/achievements` - Get user's achievements
  - `GET /api/v1/achievements/:id` - Get specific achievement
  - `POST /api/v1/achievements/unlock` - Unlock achievement (system/admin)
  - `GET /api/v1/achievements/list` - Get all available achievements

### 2. **GameConfig**
- **Model**: `GameConfig.ts`
- **Purpose**: Game configuration and version tracking
- **Fields**: `gametype`, `gameversion`, `gameplatform`, `gamebrowser`, `gameengine`
- **Suggested Routes**:
  - `GET /api/v1/game-config` - Get game configurations
  - `GET /api/v1/game-config/:gametype` - Get config for specific game type
  - `POST /api/v1/game-config` - Create config (admin only)
  - `PUT /api/v1/game-config/:id` - Update config (admin only)

### 3. **Leaderboard** (Global)
- **Model**: `Leaderboard.ts`
- **Purpose**: Global and level-specific leaderboards
- **Fields**: `userId`, `levelId`, `totalXp`, `rank`
- **Note**: Challenge-specific leaderboard exists in `challenge.routes.ts`
- **Suggested Routes**:
  - `GET /api/v1/leaderboard` - Get global leaderboard
  - `GET /api/v1/leaderboard/level/:levelId` - Get level-specific leaderboard
  - `GET /api/v1/leaderboard/user/:userId` - Get user's rank
  - `POST /api/v1/leaderboard/update` - Update leaderboard (system)

### 4. **AnalyticsEvent**
- **Model**: `AnalyticsEvent.ts`
- **Purpose**: Track user events and analytics
- **Fields**: `userId`, `eventType`, `levelId`, `missionIndex`, `metadata`
- **Event Types**: mission_start, mission_complete, query_execute, query_error, level_unlock, level_complete, hint_requested, session_start, session_end
- **Suggested Routes**:
  - `POST /api/v1/analytics/event` - Log an event
  - `GET /api/v1/analytics/events` - Get user's events (with filters)
  - `GET /api/v1/analytics/stats` - Get analytics statistics (admin)
  - `GET /api/v1/analytics/events/:eventType` - Get events by type

---

## 📋 Summary

**Total Models**: 12 (excluding sub-schemas)
**Models with Routes**: 7
**Models without Routes**: 4

**Missing Routes**:
1. UserAchievement routes
2. GameConfig routes
3. Leaderboard routes (global)
4. AnalyticsEvent routes

