import mongoose, { type Document, Schema, type Types } from 'mongoose';

export interface ITelegramAdmin extends Document {
  _id: Types.ObjectId;
  telegramUserId: number;
  createdByAdminId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const telegramAdminSchema = new Schema<ITelegramAdmin>(
  {
    telegramUserId: { type: Number, required: true, unique: true },
    createdByAdminId: { type: Schema.Types.ObjectId, required: true, ref: 'Admin' },
  },
  { timestamps: true, versionKey: false },
);

export const TelegramAdminModel = mongoose.model<ITelegramAdmin>(
  'TelegramAdmin',
  telegramAdminSchema,
);
