import { Types } from 'mongoose';
import { ProductModel } from '../models/product.model';

export interface ProductFilters {
  categoryId?: string;
  subcategoryId?: string;
  search?: string;
}

export const productRepository = {
  findAll: async (filters: ProductFilters) => {
    const filter: Record<string, unknown> = {};
    if (filters.categoryId) {
      filter.categoryId = new Types.ObjectId(filters.categoryId);
    }
    if (filters.subcategoryId) {
      filter.subcategoryId = new Types.ObjectId(filters.subcategoryId);
    }
    if (filters.search && filters.search.trim() !== '') {
      filter.$text = { $search: filters.search.trim() };
    }
    return ProductModel.find(filter).sort({ createdAt: -1 }).lean().exec();
  },

  findById: async (id: string) => {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return ProductModel.findById(id).lean().exec();
  },

  findByIds: async (ids: string[]) => {
    const objectIds = ids.filter((id) => Types.ObjectId.isValid(id)).map((id) => new Types.ObjectId(id));
    if (objectIds.length === 0) {
      return [];
    }
    return ProductModel.find({ _id: { $in: objectIds } }).lean().exec();
  },

  create: async (data: {
    categoryId: string;
    subcategoryId?: string;
    title: string;
    price: number;
    currency?: string;
    image: string;
    description?: string;
    specs?: unknown;
    condition?: string;
    warranty?: string;
    location?: string;
  }) => {
    const { subcategoryId, categoryId, ...rest } = data;
    const doc: Record<string, unknown> = {
      ...rest,
      categoryId: new Types.ObjectId(categoryId),
    };
    if (subcategoryId) {
      doc.subcategoryId = new Types.ObjectId(subcategoryId);
    }
    return ProductModel.create(doc);
  },

  update: async (
    id: string,
    data: Partial<{
      categoryId: string;
      subcategoryId: string | null;
      title: string;
      price: number;
      currency: string;
      image: string;
      description: string;
      specs: unknown;
      condition: string;
      warranty: string;
      location: string;
    }>,
  ) => {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    const payload: Record<string, unknown> = { ...data };
    if (data.categoryId) {
      payload.categoryId = new Types.ObjectId(data.categoryId);
    }
    if (data.subcategoryId !== undefined) {
      payload.subcategoryId =
        data.subcategoryId === null ? null : new Types.ObjectId(data.subcategoryId);
    }
    return ProductModel.findByIdAndUpdate(id, payload, { new: true }).lean().exec();
  },

  remove: async (id: string) => {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return ProductModel.findByIdAndDelete(id).lean().exec();
  },
};
