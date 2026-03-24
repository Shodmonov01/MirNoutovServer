import mongoose, { type Document, Schema, type Types } from 'mongoose';

export interface IAdmin extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

const adminSchema = new Schema<IAdmin>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true, versionKey: false },
);

export const AdminModel = mongoose.model<IAdmin>('Admin', adminSchema);
