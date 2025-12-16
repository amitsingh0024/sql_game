import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { UnauthorizedError, ConflictError } from '../utils/errors.js';
import { JWTPayload } from '../types/index.js';
import logger from '../utils/logger.js';

export class AuthService {
  async register(username: string, email: string, password: string) {
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
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
      email,
      password: passwordHash,
    });

    logger.info(`New user registered: ${user.username} (${user.email})`);

    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
    };
  }

  async login(email: string, password: string) {
    // Find user with password field
    const user = await User.findOne({ email }).select('+password');

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
      },
      accessToken,
      refreshToken,
    };
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
}

export default new AuthService();

