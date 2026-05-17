import mongoose from 'mongoose';

/**
 * User document shape for authentication.
 * Password is stored hashed only — never return it from API responses.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // hide from queries unless .select('+password')
    },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
