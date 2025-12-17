import { UserSettings } from '../models/UserSettings.js';
import { User } from '../models/User.js';
import { NotFoundError } from '../utils/errors.js';
import logger from '../utils/logger.js';

export class SettingsService {
  async getSettings(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    let settings = await UserSettings.findOne({ userId: user._id });

    // Create default settings if they don't exist
    if (!settings) {
      settings = await UserSettings.create({
        userId: user._id,
      });
      logger.info(`Default settings created for user: ${user.username}`);
    }

    return {
      id: settings._id.toString(),
      userId: settings.userId.toString(),
      theme: settings.theme,
      soundEnabled: settings.soundEnabled,
      musicEnabled: settings.musicEnabled,
      soundVolume: settings.soundVolume,
      musicVolume: settings.musicVolume,
      language: settings.language,
      timezone: settings.timezone,
      dateFormat: settings.dateFormat,
      timeFormat: settings.timeFormat,
      emailNotifications: settings.emailNotifications,
      pushNotifications: settings.pushNotifications,
      friendRequestNotifications: settings.friendRequestNotifications,
      challengeInviteNotifications: settings.challengeInviteNotifications,
      achievementNotifications: settings.achievementNotifications,
      leaderboardNotifications: settings.leaderboardNotifications,
      profileVisibility: settings.profileVisibility,
      showEmail: settings.showEmail,
      showLevel: settings.showLevel,
      showXp: settings.showXp,
      allowFriendRequests: settings.allowFriendRequests,
      defaultDifficulty: settings.defaultDifficulty,
      autoSaveProgress: settings.autoSaveProgress,
      showHints: settings.showHints,
      showTutorials: settings.showTutorials,
      autoAcceptChallenges: settings.autoAcceptChallenges,
      challengeReminderEnabled: settings.challengeReminderEnabled,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    };
  }

  async updateSettings(
    userId: string,
    updates: {
      theme?: 'light' | 'dark' | 'auto';
      soundEnabled?: boolean;
      musicEnabled?: boolean;
      soundVolume?: number;
      musicVolume?: number;
      language?: string;
      timezone?: string;
      dateFormat?: string;
      timeFormat?: '12h' | '24h';
      emailNotifications?: boolean;
      pushNotifications?: boolean;
      friendRequestNotifications?: boolean;
      challengeInviteNotifications?: boolean;
      achievementNotifications?: boolean;
      leaderboardNotifications?: boolean;
      profileVisibility?: 'public' | 'friends' | 'private';
      showEmail?: boolean;
      showLevel?: boolean;
      showXp?: boolean;
      allowFriendRequests?: boolean;
      defaultDifficulty?: 'easy' | 'medium' | 'hard' | 'expert';
      autoSaveProgress?: boolean;
      showHints?: boolean;
      showTutorials?: boolean;
      autoAcceptChallenges?: boolean;
      challengeReminderEnabled?: boolean;
    }
  ) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    let settings = await UserSettings.findOne({ userId: user._id });

    // Create settings if they don't exist
    if (!settings) {
      settings = await UserSettings.create({
        userId: user._id,
      });
    }

    // Update allowed fields
    const allowedFields: (keyof typeof updates)[] = [
      'theme',
      'soundEnabled',
      'musicEnabled',
      'soundVolume',
      'musicVolume',
      'language',
      'timezone',
      'dateFormat',
      'timeFormat',
      'emailNotifications',
      'pushNotifications',
      'friendRequestNotifications',
      'challengeInviteNotifications',
      'achievementNotifications',
      'leaderboardNotifications',
      'profileVisibility',
      'showEmail',
      'showLevel',
      'showXp',
      'allowFriendRequests',
      'defaultDifficulty',
      'autoSaveProgress',
      'showHints',
      'showTutorials',
      'autoAcceptChallenges',
      'challengeReminderEnabled',
    ];

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        (settings as any)[field] = updates[field];
      }
    });

    // Validate volume ranges
    if (updates.soundVolume !== undefined) {
      settings.soundVolume = Math.max(0, Math.min(100, updates.soundVolume));
    }
    if (updates.musicVolume !== undefined) {
      settings.musicVolume = Math.max(0, Math.min(100, updates.musicVolume));
    }

    await settings.save();

    logger.info(`Settings updated for user: ${user.username}`);

    return {
      id: settings._id.toString(),
      userId: settings.userId.toString(),
      theme: settings.theme,
      soundEnabled: settings.soundEnabled,
      musicEnabled: settings.musicEnabled,
      soundVolume: settings.soundVolume,
      musicVolume: settings.musicVolume,
      language: settings.language,
      timezone: settings.timezone,
      dateFormat: settings.dateFormat,
      timeFormat: settings.timeFormat,
      emailNotifications: settings.emailNotifications,
      pushNotifications: settings.pushNotifications,
      friendRequestNotifications: settings.friendRequestNotifications,
      challengeInviteNotifications: settings.challengeInviteNotifications,
      achievementNotifications: settings.achievementNotifications,
      leaderboardNotifications: settings.leaderboardNotifications,
      profileVisibility: settings.profileVisibility,
      showEmail: settings.showEmail,
      showLevel: settings.showLevel,
      showXp: settings.showXp,
      allowFriendRequests: settings.allowFriendRequests,
      defaultDifficulty: settings.defaultDifficulty,
      autoSaveProgress: settings.autoSaveProgress,
      showHints: settings.showHints,
      showTutorials: settings.showTutorials,
      autoAcceptChallenges: settings.autoAcceptChallenges,
      challengeReminderEnabled: settings.challengeReminderEnabled,
      updatedAt: settings.updatedAt,
    };
  }

  async resetSettings(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const settings = await UserSettings.findOne({ userId: user._id });

    if (!settings) {
      // Create default settings
      const newSettings = await UserSettings.create({
        userId: user._id,
      });
      return this.getSettings(userId);
    }

    // Reset to defaults
    settings.theme = 'auto';
    settings.soundEnabled = true;
    settings.musicEnabled = true;
    settings.soundVolume = 70;
    settings.musicVolume = 50;
    settings.language = 'en';
    settings.timezone = 'UTC';
    settings.dateFormat = 'MM/DD/YYYY';
    settings.timeFormat = '12h';
    settings.emailNotifications = true;
    settings.pushNotifications = true;
    settings.friendRequestNotifications = true;
    settings.challengeInviteNotifications = true;
    settings.achievementNotifications = true;
    settings.leaderboardNotifications = true;
    settings.profileVisibility = 'public';
    settings.showEmail = false;
    settings.showLevel = true;
    settings.showXp = true;
    settings.allowFriendRequests = true;
    settings.defaultDifficulty = 'medium';
    settings.autoSaveProgress = true;
    settings.showHints = true;
    settings.showTutorials = true;
    settings.autoAcceptChallenges = false;
    settings.challengeReminderEnabled = true;

    await settings.save();

    logger.info(`Settings reset to defaults for user: ${user.username}`);

    return this.getSettings(userId);
  }
}

export default new SettingsService();

