import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISupplement {
  content: string;
  attachmentUrls: string[];
  createdAt: Date;
}

export interface IRepairOrder extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  category: string;
  title: string;
  description: string;
  deviceType: 'mac' | 'laptop' | 'computer' | 'other';
  attachmentUrl: string;
  attachmentUrls: string[];
  supplements: ISupplement[];
  repairContent: string;
  notes: string;
  status: 'pending' | 'in_progress' | 'repairing' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const supplementSchema = new Schema<ISupplement>(
  {
    content: {
      type: String,
      required: true,
    },
    attachmentUrls: {
      type: [String],
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const repairOrderSchema = new Schema<IRepairOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    deviceType: {
      type: String,
      enum: ['mac', 'laptop', 'computer', 'other'],
      required: true,
    },
    attachmentUrl: {
      type: String,
      default: '',
    },
    attachmentUrls: {
      type: [String],
      default: [],
    },
    supplements: {
      type: [supplementSchema],
      default: [],
    },
    repairContent: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'repairing', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
repairOrderSchema.index({ userId: 1 });
repairOrderSchema.index({ status: 1 });
repairOrderSchema.index({ createdAt: -1 });
repairOrderSchema.index({ userId: 1, status: 1 });

export const RepairOrder = mongoose.model<IRepairOrder>(
  'RepairOrder',
  repairOrderSchema,
  'repairorders' // Explicitly set collection name
);
