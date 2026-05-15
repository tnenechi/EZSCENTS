import type{ Request, Response } from 'express';
import User from '../models/User';

// Extend Request type to include session
declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400).json({ message: 'User already exists' });
    return;
  }

  // Check if email is in the admin whitelist
  const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [];
  const role = adminEmails.includes(email) ? 'admin' : 'user';

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  if (user) {
    // Store user ID in session
    req.session.userId = user._id.toString();

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc    Auth user & get token (now session)
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const user: any = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    // Store user ID in session
    req.session.userId = user._id.toString();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

// @desc    Logout user / clear session
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = async (req: Request, res: Response): Promise<void> => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ message: 'Could not log out' });
      return;
    }
    res.clearCookie('connect.sid'); // Default name for express-session cookie
    res.json({ message: 'Logged out successfully' });
  });
};

// @desc    Get user profile (helper to check session)
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  const user = await User.findById(req.session.userId).select('-password');
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user password
// @route   PUT /api/auth/profile/password
// @access  Private
export const updateUserPassword = async (req: Request, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body;

  const user: any = await User.findById(req.session.userId);

  if (user && (await user.matchPassword(currentPassword))) {
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } else {
    res.status(401).json({ message: 'Invalid current password' });
  }
};
