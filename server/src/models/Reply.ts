import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReply extends Document {
  _id: Types.ObjectId;
  repairOrderId: Types.ObjectId;
  adminId: Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const replySchema = new Schema<IReply>(
  {
    repairOrderId: {
      type: Schema.Types.ObjectId,
      ref: 'RepairOrder',
      required: true,
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
replySchema.index({ repairOrderId: 1 });
replySchema.index({ repairOrderId: 1, createdAt: 1 });

export const Reply = mongoose.model<IReply>('Reply', replySchema);
