import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  lineUserId: string | null;
  displayName: string;
  avatarUrl: string;
  status: 'active' | 'inactive';
  points: number;
  memberSince: Date;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    lineUserId: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    points: {
      type: Number,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'Points must be an integer',
      },
    },
    memberSince: {
      type: Date,
      default: Date.now,
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes (lineUserId already has unique sparse index)
userSchema.index({ status: 1 });
userSchema.index({ createdAt: -1 });

export const User = mongoose.model<IUser>('User', userSchema);
