import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { UserStats } from '../models/UserStats.js';
import { env } from '../config/env.js';
import { UnauthorizedError, ConflictError, NotFoundError, AppError } from '../utils/errors.js';
import { JWTPayload } from '../types/index.js';
import logger from '../utils/logger.js';

export class AuthService {
  async register(username: string, email: string, password: string) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email: email.toLowerCase() }, { username }],
      });

      if (existingUser) {
        if (existingUser.email.toLowerCase() === email.toLowerCase()) {
          throw new ConflictError('Email already registered');
        }
        throw new ConflictError('Username already taken');
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = await User.create({
        username,
        email: email.toLowerCase(),
        password: passwordHash,
      });

      // Create initial UserStats for the new user
      try {
        await UserStats.create({
          userId: user._id,
          totalXp: 0,
          currentRank: 'NOVICE WEAVER',
          unlockedLevels: [1],
          levelStability: {},
          missionsCompleted: 0,
          levelsCompleted: 0,
          totalPlaytimeSeconds: 0,
        });
      } catch (statsError: any) {
        // If UserStats creation fails, log but don't fail registration
        logger.error(`Failed to create UserStats for user ${user._id}:`, statsError);
      }

      logger.info(`New user registered: ${user.username} (${user.email})`);

      return {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        userRole: user.userRole,
        level: user.level,
        xp: user.xp,
        stability: user.stability,
        createdAt: user.createdAt,
      };
    } catch (error: any) {
      // Handle MongoDB duplicate key errors
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern || {})[0];
        if (field === 'email') {
          throw new ConflictError('Email already registered');
        } else if (field === 'username') {
          throw new ConflictError('Username already taken');
        }
        throw new ConflictError('User already exists');
      }
      // Re-throw if it's already an AppError
      if (error instanceof ConflictError || error instanceof AppError) {
        throw error;
      }
      // Log unexpected errors
      logger.error('Unexpected error during registration:', error);
      throw new Error('Registration failed. Please try again.');
    }
  }

  async login(email: string, password: string) {
    try {
      // Find user with password field (case-insensitive email)
      const user = await User.findOne({ 
        email: email.toLowerCase() 
      }).select('+password');

      if (!user) {
        throw new UnauthorizedError('Invalid email or password');
      }

      if (!user.isActive) {
        throw new UnauthorizedError('Account is deactivated');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedError('Invalid email or password');
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate tokens
      const payload: JWTPayload = {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
      };

      const accessToken = this.generateAccessToken(payload);
      const refreshToken = this.generateRefreshToken(payload);

      logger.info(`User logged in: ${user.username} (${user.email})`);

      return {
        user: {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin,
          userRole: user.userRole,
          level: user.level,
          xp: user.xp,
          stability: user.stability,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      // Re-throw if it's already an AppError
      if (error instanceof UnauthorizedError || error instanceof AppError) {
        throw error;
      }
      // Log unexpected errors
      logger.error('Unexpected error during login:', error);
      throw new UnauthorizedError('Login failed. Please try again.');
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as JWTPayload;
      
      const user = await User.findById(decoded.id);

      if (!user || !user.isActive) {
        throw new UnauthorizedError('User not found or inactive');
      }

      const payload: JWTPayload = {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
      };

      const newAccessToken = this.generateAccessToken(payload);

      return {
        accessToken: newAccessToken,
      };
    } catch (error) {
      throw new UnauthorizedError('Invalid refresh token');
    }
  }

  private generateAccessToken(payload: JWTPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });
  }

  private generateRefreshToken(payload: JWTPayload): string {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    });
  }

  async getUserById(userId: string) {
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }

    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      userRole: user.userRole,
      level: user.level,
      xp: user.xp,
      stability: user.stability,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export default new AuthService();

