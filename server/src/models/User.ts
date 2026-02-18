import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  lineUserId: string | null;
  displayName: string;
  avatarUrl: string;
  status: 'active' | 'inactive';
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
