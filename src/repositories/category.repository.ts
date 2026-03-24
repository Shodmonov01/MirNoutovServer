import { Types } from 'mongoose';
import { CategoryModel } from '../models/category.model';

export const categoryRepository = {
  findAll: async () => {
    return CategoryModel.find().sort({ name: 1 }).lean().exec();
  },

  findById: async (id: string) => {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return CategoryModel.findById(id).lean().exec();
  },

  create: async (data: { name: string; image: string }) => {
    return CategoryModel.create(data);
  },

  update: async (id: string, data: { name?: string; image?: string }) => {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return CategoryModel.findByIdAndUpdate(id, data, { new: true }).lean().exec();
  },

  remove: async (id: string) => {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return CategoryModel.findByIdAndDelete(id).lean().exec();
  },
};
