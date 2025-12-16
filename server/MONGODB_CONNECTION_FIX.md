# MongoDB Connection Fix

## Issue
The error `querySrv ENOTFOUND _mongodb._tcp.cluster.mongodb.net` indicates the MongoDB cluster name in your connection string is incorrect.

## Your Current URI (from earlier conversation)
```
mongodb+srv://aakashshivanshu5_db_user:jxtlDZdDy6WfU4X8@cluster.mongodb.net/sql_game?retryWrites=true&w=majority
```

## Problem
The cluster name `cluster.mongodb.net` is incorrect. Based on your original connection string, it should be:
```
cluster0.dibnaxf.mongodb.net
```

## Correct MongoDB URI Format
Update your `.env` file with:

```env
MONGODB_URI=mongodb+srv://aakashshivanshu5_db_user:jxtlDZdDy6WfU4X8@cluster0.dibnaxf.mongodb.net/sql_game?retryWrites=true&w=majority
```

## How to Find Your Correct Cluster Name

1. Go to [MongoDB Atlas Dashboard](https://cloud.mongodb.com/)
2. Click on your cluster
3. Click "Connect"
4. Choose "Connect your application"
5. Copy the connection string - it will show the correct cluster name

The format should be:
```
mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/<database>?retryWrites=true&w=majority
```

## Common Issues

1. **Wrong cluster name**: Make sure you use the full cluster name (e.g., `cluster0.dibnaxf.mongodb.net`)
2. **Network Access**: Ensure your IP is whitelisted in MongoDB Atlas (or use `0.0.0.0/0` for testing)
3. **Database name**: Make sure `/sql_game` is included in the URI
4. **Password special characters**: If your password has special characters, URL encode them

## Test Connection

After updating your `.env` file, restart the server:
```bash
npm run dev
```

You should see: `✅ MongoDB connected successfully`

