import mongoose, { type Document, Schema, type Types } from 'mongoose';

export interface ISubcategory extends Document {
  _id: Types.ObjectId;
  categoryId: Types.ObjectId;
  name: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

const subcategorySchema = new Schema<ISubcategory>(
  {
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    name: { type: String, required: true },
    image: { type: String, required: true },
  },
  { timestamps: true, versionKey: false },
);

subcategorySchema.index({ categoryId: 1, name: 1 }, { unique: true });

export const SubcategoryModel = mongoose.model<ISubcategory>('Subcategory', subcategorySchema);
