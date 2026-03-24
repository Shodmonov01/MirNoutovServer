import mongoose, { type Document, Schema, type Types } from 'mongoose';

export interface IProduct extends Document {
  _id: Types.ObjectId;
  categoryId: Types.ObjectId;
  subcategoryId?: Types.ObjectId;
  title: string;
  price: number;
  currency: string;
  image: string;
  description?: string;
  specs?: unknown;
  condition?: string;
  warranty?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    subcategoryId: { type: Schema.Types.ObjectId, ref: 'Subcategory', required: false },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    currency: { type: String, default: 'UZS' },
    image: { type: String, required: true },
    description: { type: String, required: false },
    specs: { type: Schema.Types.Mixed, required: false },
    condition: { type: String, required: false },
    warranty: { type: String, required: false },
    location: { type: String, required: false },
  },
  { timestamps: true, versionKey: false },
);

productSchema.index({ title: 'text', description: 'text' });

export const ProductModel = mongoose.model<IProduct>('Product', productSchema);
