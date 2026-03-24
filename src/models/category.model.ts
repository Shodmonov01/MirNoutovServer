import mongoose, { type Document, Schema, type Types } from 'mongoose';

export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
  },
  { timestamps: true, versionKey: false },
);

export const CategoryModel = mongoose.model<ICategory>('Category', categorySchema);
