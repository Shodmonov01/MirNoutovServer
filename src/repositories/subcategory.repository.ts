import { Types } from 'mongoose';
import { SubcategoryModel } from '../models/subcategory.model';

export interface SubcategoryLean {
  _id: Types.ObjectId;
  categoryId: Types.ObjectId;
  name: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

export const subcategoryRepository = {
  findAll: async (): Promise<SubcategoryLean[]> => {
    const rows = await SubcategoryModel.find().sort({ categoryId: 1, name: 1 }).lean().exec();
    return rows as SubcategoryLean[];
  },

  findByCategoryId: async (categoryId: string): Promise<SubcategoryLean[]> => {
    if (!Types.ObjectId.isValid(categoryId)) {
      return [];
    }
    const rows = await SubcategoryModel.find({ categoryId: new Types.ObjectId(categoryId) })
      .sort({ name: 1 })
      .lean()
      .exec();
    return rows as SubcategoryLean[];
  },

  findById: async (id: string): Promise<SubcategoryLean | null> => {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    const row = await SubcategoryModel.findById(id).lean().exec();
    return row as SubcategoryLean | null;
  },

  create: async (data: { categoryId: string; name: string; image: string }) => {
    return SubcategoryModel.create({
      categoryId: new Types.ObjectId(data.categoryId),
      name: data.name,
      image: data.image,
    });
  },

  update: async (
    id: string,
    data: Partial<{ categoryId: string; name: string; image: string }>,
  ): Promise<SubcategoryLean | null> => {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    const payload: Record<string, unknown> = { ...data };
    if (data.categoryId) {
      payload.categoryId = new Types.ObjectId(data.categoryId);
    }
    const row = await SubcategoryModel.findByIdAndUpdate(id, payload, { new: true }).lean().exec();
    return row as SubcategoryLean | null;
  },

  remove: async (id: string): Promise<SubcategoryLean | null> => {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    const row = await SubcategoryModel.findByIdAndDelete(id).lean().exec();
    return row as SubcategoryLean | null;
  },
};
