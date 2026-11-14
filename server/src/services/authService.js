import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Teacher } from '../models/Teacher.js';
import { Guardian } from '../models/Guardian.js';
import { AppError } from '../utils/apiResponse.js';
import { ENV } from '../config/env.js';

export class AuthService {
  static async login(email, password) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Please contact administrator.', 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      ENV.JWT_SECRET,
      { expiresIn: ENV.JWT_EXPIRES_IN }
    );

    // Fetch role-specific details
    let profileData = null;
    if (user.role === 'TEACHER') {
      profileData = await Teacher.findOne({ user: user._id });
    } else if (user.role === 'GUARDIAN') {
      profileData = await Guardian.findOne({ user: user._id }).populate({
        path: 'students',
        populate: [
          { path: 'class', select: 'name code' },
          { path: 'section', select: 'name' },
        ],
      });
    }

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: profileData,
      },
    };
  }

  static async getProfile(userId) {
    const user = await User.findById(userId).select('-passwordHash');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    let profileData = null;
    if (user.role === 'TEACHER') {
      profileData = await Teacher.findOne({ user: user._id });
    } else if (user.role === 'GUARDIAN') {
      profileData = await Guardian.findOne({ user: user._id }).populate({
        path: 'students',
        populate: [
          { path: 'class', select: 'name code' },
          { path: 'section', select: 'name' },
        ],
      });
    }

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        profile: profileData,
      },
    };
  }
}

